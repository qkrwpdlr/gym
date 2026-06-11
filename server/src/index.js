// gym-llm — DeepSeek 프록시 (Cloudflare Worker)
// 보안 모델: 디바이스 토큰(SHA-256 해시 비교) + CORS 오리진 고정 + 파라미터 서버 고정.
// 비용 상한: DeepSeek 선불 잔액을 소액($5~10)으로 유지하는 것이 절대 손실 상한.

import { DAILY_ADJUST, PROGRAM } from './prompts.js';

const MODEL = 'deepseek-v4-flash';
const UPSTREAM = 'https://api.deepseek.com/chat/completions';
const MAX_BODY_BYTES = 128 * 1024;
const MAX_MESSAGES = 40;
const MAX_CONTENT_CHARS = 60000;

// mode별 서버 고정 프리셋 — 클라이언트는 mode와 messages만 보낼 수 있다
const MODES = {
  daily_adjust:     { system: DAILY_ADJUST, thinking: 'disabled', max_tokens: 2048 },
  program_intake:   { system: PROGRAM,      thinking: 'disabled', max_tokens: 1024 },
  program_generate: { system: PROGRAM,      thinking: 'enabled',  max_tokens: 16384 },
};

function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

function json(env, status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...corsHeaders(env),
    },
  });
}

async function sha256hex(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

// 길이 고정 비교 (타이밍 차이 최소화)
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function validateBody(body) {
  if (!body || typeof body !== 'object') return '본문이 객체가 아님';
  if (!MODES[body.mode]) return 'mode는 daily_adjust | program_intake | program_generate';
  if (!Array.isArray(body.messages) || !body.messages.length) return 'messages 필요';
  if (body.messages.length > MAX_MESSAGES) return 'messages 개수 초과';
  // 서버 단독 권한 필드를 클라이언트가 보내면 거부
  for (const k of ['model', 'max_tokens', 'thinking', 'temperature', 'system', 'response_format', 'tools']) {
    if (k in body) return `'${k}'는 서버가 결정한다`;
  }
  let total = 0;
  for (const m of body.messages) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant')) return 'role은 user|assistant만 허용';
    if (typeof m.content !== 'string' || !m.content.length) return 'content는 비어있지 않은 문자열';
    total += m.content.length;
  }
  if (total > MAX_CONTENT_CHARS) return 'content 총량 초과';
  return null;
}

async function callDeepSeek(env, mode, messages) {
  const preset = MODES[mode];
  const resp = await fetch(UPSTREAM, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + env.DEEPSEEK_API_KEY,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'system', content: preset.system }, ...messages],
      max_tokens: preset.max_tokens,
      thinking: { type: preset.thinking },
      response_format: { type: 'json_object' },
      stream: false,
    }),
    signal: AbortSignal.timeout(mode === 'program_generate' ? 170000 : 60000),
  });
  if (!resp.ok) {
    const detail = await resp.text().catch(() => '');
    throw Object.assign(new Error('upstream ' + resp.status), { status: resp.status, detail: detail.slice(0, 300) });
  }
  const data = await resp.json();
  return {
    content: data.choices?.[0]?.message?.content ?? '',
    usage: data.usage ?? null,
  };
}

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin');

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    // CORS: Origin이 있으면 허용 오리진과 일치해야 함 (네이티브 앱은 Origin 없음 → 토큰만으로 통과)
    if (origin && env.ALLOWED_ORIGIN && origin !== env.ALLOWED_ORIGIN) {
      return json(env, 403, { error: 'origin_not_allowed' });
    }

    const url = new URL(req.url);
    if (req.method !== 'POST' || url.pathname !== '/v1/chat') {
      return json(env, 404, { error: 'not_found' });
    }

    // 인증: Bearer 토큰의 SHA-256이 등록된 해시와 일치해야 함
    const auth = req.headers.get('Authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) return json(env, 401, { error: 'unauthorized' });
    const hash = await sha256hex(token);
    const allowed = (env.DEVICE_TOKEN_HASH || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!allowed.some(h => safeEqual(hash, h.toLowerCase()))) {
      return json(env, 401, { error: 'unauthorized' });
    }

    const text = await req.text();
    if (text.length > MAX_BODY_BYTES) return json(env, 413, { error: 'body_too_large' });

    let body;
    try { body = JSON.parse(text); } catch { return json(env, 400, { error: 'invalid_json' }); }
    const verr = validateBody(body);
    if (verr) return json(env, 400, { error: 'invalid_request', detail: verr });

    try {
      let result = await callDeepSeek(env, body.mode, body.messages);
      // DeepSeek JSON 모드의 알려진 결함(간헐적 빈 content) — 1회 자동 재시도
      if (!result.content) result = await callDeepSeek(env, body.mode, body.messages);
      if (!result.content) return json(env, 502, { error: 'empty_response' });
      // 메타데이터만 로깅 (대화 본문 로깅 금지)
      console.log(JSON.stringify({ mode: body.mode, msgs: body.messages.length, usage: result.usage }));
      return json(env, 200, result);
    } catch (e) {
      if (e.status === 429) return json(env, 429, { error: 'rate_limited' });
      return json(env, 502, { error: 'upstream_error', detail: e.detail || e.message });
    }
  },
};
