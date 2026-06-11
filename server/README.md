# gym-llm — DeepSeek 프록시 서버 (Cloudflare Worker)

PWA의 gymbro 챗이 사용하는 LLM 프록시. 시스템 프롬프트·모델·토큰 한도는 전부 서버 고정이고,
클라이언트는 `mode`와 `messages`만 보낼 수 있다.

## 배포 (1회)

```bash
cd server

# 1. 디바이스 토큰 생성 (앱에 입력할 원문 — 안전한 곳에 보관)
openssl rand -base64 32
# 예: Xy3k...== ← 이 원문을 앱 설정 탭의 '디바이스 토큰'에 입력

# 2. 토큰의 SHA-256 해시 계산
echo -n '<위에서 생성한 토큰 원문>' | shasum -a 256
# 출력된 hex가 DEVICE_TOKEN_HASH

# 3. 시크릿 등록
npx wrangler secret put DEEPSEEK_API_KEY    # platform.deepseek.com 발급 키
npx wrangler secret put DEVICE_TOKEN_HASH   # 위 hex (여러 기기는 쉼표로 구분)

# 4. wrangler.toml의 ALLOWED_ORIGIN을 본인 GitHub Pages 오리진으로 수정 후 배포
npx wrangler deploy
# → https://gym-llm.<account>.workers.dev
```

앱 설정 탭에 서버 주소(`https://gym-llm.<account>.workers.dev`)와 토큰 원문을 입력하면 끝.

## API

`POST /v1/chat` — `Authorization: Bearer <device-token>`

```jsonc
// 요청
{ "mode": "daily_adjust" | "program_intake" | "program_generate",
  "messages": [{ "role": "user" | "assistant", "content": "..." }] }
// 응답
{ "content": "<JSON 봉투 문자열>", "usage": { ... } }
```

mode별 서버 고정값: daily_adjust(thinking off, 2048), program_intake(thinking off, 1024),
program_generate(thinking on, 16384). 모두 `deepseek-v4-flash` + JSON 모드.

## 보안/비용 체크리스트

- API 키와 토큰 해시는 Worker Secret에만 존재 (리포에 없음)
- 대화 본문은 로깅하지 않음 (mode/개수/usage만)
- 잘못된 토큰은 즉시 401 — 봇 스캔이 비용을 만들 수 없음
- **DeepSeek 선불 잔액을 $5~10로 유지** — 절대 손실 상한
- 토큰 유출 시: 새 토큰 생성 → 해시 교체(`wrangler secret put`) → 재배포
