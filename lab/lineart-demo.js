// lineart-demo.js — 옆모습 라인아트 운동 시범 + 근육 강도 표시 공통 엔진.
// 펜 선 그리기(limb·shoe·잉크 필터)는 line-art-animation/lib/ink.ts(MIT)에서 옮겼다.
// 근육 지도는 body-muscles(Apache-2.0)를 vendor/에서 읽는다.
//
// 각도 규약: "아래 방향에서 앞(+x)으로 돈 각도(도)". 0 = 수직 아래, 90 = 수평 앞, 180 = 수직 위, 음수 = 뒤.
// 근육 띠의 off: 양수 = 몸의 뒤쪽 면(팔·다리는 먼 관절→몸통 관절 순서로 넘길 때).
(function () {
  const NS = 'http://www.w3.org/2000/svg'
  const PEN = 1.35
  const R = Math.PI / 180
  const f = (n) => n.toFixed(2)
  const pt = (p) => `${f(p[0])} ${f(p[1])}`
  const lerp = (a, b, u) => a + (b - a) * u
  const ease = (u) => u * u * (3 - 2 * u)
  const go = (p, len, deg) => [p[0] + len * Math.sin(deg * R), p[1] + len * Math.cos(deg * R)]
  const add = (p, q) => [p[0] + q[0], p[1] + q[1]]
  const L = { shank: 24, thigh: 26, torso: 29, neck: 4, head: 6.2, upper: 15, fore: 14 }

  function el(tag, attrs = {}, parent) {
    const n = document.createElementNS(NS, tag)
    for (const k in attrs) n.setAttribute(k, String(attrs[k]))
    if (parent) parent.appendChild(n)
    return n
  }
  const pen = (parent, w = PEN) =>
    el('path', { fill: 'none', stroke: 'currentColor', 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, parent)
  function limb(parent, width, w = PEN) {
    const g = el('g', {}, parent)
    const fill = el('path', { class: 'pp' }, g)
    const a = pen(g, w), b = pen(g, w)
    const half = (width - w) / 2
    return {
      g,
      draw(joints, endGap = [0.4, 0.9]) {
        const s = joints[0], e = joints[joints.length - 1]
        let c = [(s[0] + e[0]) / 2, (s[1] + e[1]) / 2]
        if (joints.length === 3) { const m = joints[1]; c = [m[0] + 0.55 * (m[0] - c[0]), m[1] + 0.55 * (m[1] - c[1])] }
        const P = []
        for (let i = 0; i <= 16; i++) { const t = i / 16, u = 1 - t; P.push([u * u * s[0] + 2 * u * t * c[0] + t * t * e[0], u * u * s[1] + 2 * u * t * c[1] + t * t * e[1]]) }
        const side = (sgn) => P.map((p, i) => {
          const q = P[Math.min(P.length - 1, i + 1)], o = P[Math.max(0, i - 1)]
          const dx = q[0] - o[0], dy = q[1] - o[1], l = Math.hypot(dx, dy) || 1
          return [p[0] - (dy / l) * half * sgn, p[1] + (dx / l) * half * sgn]
        })
        const Lp = side(1), Rp = side(-1)
        fill.setAttribute('d', 'M' + Lp.map(pt).join('L') + 'L' + Rp.slice().reverse().map(pt).join('L') + 'Z')
        const cut = (arr, gap) => arr.slice(0, arr.length - Math.round(gap * 2))
        a.setAttribute('d', 'M' + cut(Lp, endGap[0]).map(pt).join('L'))
        b.setAttribute('d', 'M' + cut(Rp, endGap[1]).map(pt).join('L'))
      },
    }
  }
  function shoe(node, ankle, toe = 0) {
    const r = toe * R, c = Math.cos(r), s = Math.sin(r)
    const S = (x, y) => [ankle[0] + x * c - y * s, ankle[1] + x * s + y * c]
    node.setAttribute('d', `M${pt(S(-1.6, -0.6))} L${pt(S(4.6, -0.2))} Q${pt(S(6.6, 0.4))} ${pt(S(5.6, 1.6))} L${pt(S(-1.4, 1.5))} Q${pt(S(-2.2, 0.5))} ${pt(S(-1.6, -0.6))}Z`)
  }
  const circle = (c, r) => `M${f(c[0] - r)} ${f(c[1])} a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0 a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0Z`
  function inkFilter(svg) {
    const defs = el('defs', {}, svg)
    const flt = el('filter', { id: 'ink-edge', x: '-2%', y: '-2%', width: '104%', height: '104%' }, defs)
    el('feTurbulence', { type: 'fractalNoise', baseFrequency: '0.6', numOctaves: 1, seed: 7, result: 'n' }, flt)
    el('feDisplacementMap', { in: 'SourceGraphic', in2: 'n', scale: 0.45, xChannelSelector: 'R', yChannelSelector: 'G', result: 'd' }, flt)
    el('feGaussianBlur', { in: 'd', stdDeviation: 0.12 }, flt)
    return 'url(#ink-edge)'
  }
  // a→b 선분을 따라 off만큼 옆으로 띄운 [시작, 끝]. off 양수 = b에서 a를 볼 때 기준 뒤쪽 면.
  function seg(a, b, off, k0, k1) {
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1
    const nx = dy / l, ny = -dx / l
    const P = (k) => [a[0] + dx * k + nx * off, a[1] + dy * k + ny * off]
    return [P(k0), P(k1)]
  }

  // ---------- 근육 이름 → body-muscles id ----------
  const IDS = {
    ham: ['hamstrings-medial', 'hamstrings-lateral'], glute: ['gluteus-maximus'], gmed: ['gluteus-medius'], quad: ['quads'],
    calf: ['calves-gastroc-medial', 'calves-gastroc-lateral', 'calves-soleus'], erect: ['lower-back-erectors'],
    delt: ['shoulder-front'], sdelt: ['shoulder-side'], rdelt: ['deltoid-rear'], lats: ['lats-upper', 'lats-mid', 'lats-lower'],
    traps: ['traps-mid', 'traps-lower'], biceps: ['biceps'], forearm: ['forearm-flexors', 'forearm-extensors'],
    abs: ['abs-upper', 'abs-lower'], triceps: ['triceps-long', 'triceps-lateral'], chest: ['chest-upper', 'chest-lower'],
  }

  function mount(X) {
    const $ = (id) => document.getElementById(id)
    const svg = $('scene')
    svg.setAttribute('viewBox', X.viewBox)
    const filter = inkFilter(svg)
    const back = el('g', {}, svg) // 기구 뒤쪽
    const ground = pen(back, 1.1)
    if (X.ground !== false) { ground.setAttribute('d', X.ground); ground.setAttribute('opacity', '0.55') }
    const ghost = el('g', { opacity: 0.09 }, svg)
    const fig = el('g', { filter }, svg)
    const front = el('g', { filter }, svg) // 기구 앞쪽(손잡이·원판 등)

    const BAND = (parent, w) => el('path', { fill: 'none', stroke: '#94a3b8', 'stroke-width': w, 'stroke-linecap': 'round', opacity: 0 }, parent)
    function build(parent, withBands) {
      const F = {}
      F.farLeg = limb(parent, 6.4); F.farShoe = el('path', { fill: 'currentColor' }, parent)
      F.farArm = limb(parent, 3.6)
      F.bands = { far: [], torso: [], near: [], arm: [] }
      const mk = (layer) => { if (!withBands) return; for (const b of X.bands.filter((b) => b.layer === layer)) F.bands[layer].push({ spec: b, node: BAND(parent, b.w || 2.4) }) }
      mk('far')
      F.torso = limb(parent, 11.5)
      mk('torso')
      F.nearLeg = limb(parent, 7); F.nearShoe = el('path', { fill: 'currentColor' }, parent)
      mk('near')
      F.nearArm = limb(parent, 3.8)
      mk('arm')
      F.head = el('path', { class: 'pp', stroke: 'currentColor', 'stroke-width': PEN }, parent)
      return F
    }
    const Fg = build(fig, true)
    const Gh = X.ghostPose ? build(ghost, false) : null
    const props = X.props ? X.props({ back, front, el, pen, limb }) : null

    function full(j) {
      const up = [j.shoulder[0] - j.hip[0], j.shoulder[1] - j.hip[1]], l = Math.hypot(up[0], up[1]) || 1
      j.head = j.head || [j.shoulder[0] + (up[0] / l) * (L.neck + L.head), j.shoulder[1] + (up[1] / l) * (L.neck + L.head)]
      const o = X.farOffset || [-1.6, -0.7]
      for (const k of ['knee', 'ankle', 'elbow', 'hand']) {
        const nk = k + 'N', fk = k + 'F'
        if (!j[fk]) j[fk] = add(j[nk], o)
      }
      j.hipF = j.hipF || j.hip
      j.shoulderF = j.shoulderF || add(j.shoulder, o)
      return j
    }
    function draw(F, j, P) {
      F.farLeg.draw([j.hipF, j.kneeF, j.ankleF]); shoe(F.farShoe, j.ankleF, j.toeF || 0)
      F.farArm.draw([j.shoulderF, j.elbowF, j.handF])
      F.torso.draw([j.hip, j.shoulder], [0.2, 0.2])
      F.nearLeg.draw([j.hip, j.kneeN, j.ankleN]); shoe(F.nearShoe, j.ankleN, j.toeN || 0)
      F.nearArm.draw([j.shoulder, j.elbowN, j.handN])
      F.head.setAttribute('d', circle(j.head, L.head))
      if (!P) return
      for (const layer in F.bands) for (const { spec, node } of F.bands[layer]) {
        if (spec.type === 'glute') {
          const leg = spec.leg === 'far' ? ['kneeF', 'hipF'] : ['kneeN', 'hip']
          const t1 = seg(j[leg[0]], j[leg[1]], 2.6, 0.82, 0.82)[0], t2 = seg(j.hip, j.shoulder, 4.2, 0.14, 0.14)[0]
          const dx = t1[0] + t2[0] - 2 * j.hip[0], dy = t1[1] + t2[1] - 2 * j.hip[1], l = Math.hypot(dx, dy) || 1
          const mid = [j.hip[0] + (dx / l) * 6.2, j.hip[1] + (dy / l) * 6.2]
          node.setAttribute('d', `M${pt(t1)} Q${pt(mid)} ${pt(t2)}`)
        } else {
          const [p, q] = seg(j[spec.from], j[spec.to], spec.off || 0, spec.k0 ?? 0.15, spec.k1 ?? 0.85)
          node.setAttribute('d', `M${pt(p)} L${pt(q)}`)
        }
        const v = P.load[spec.key] || 0
        if (v < 0.5) { node.setAttribute('opacity', '0'); continue }
        node.setAttribute('stroke', COLORS[Math.min(10, Math.round(v))])
        node.setAttribute('opacity', '0.95')
        node.setAttribute('stroke-dasharray', P.stretch.has(spec.key) ? '2.2 1.6' : 'none')
      }
    }

    // ---------- 시간 → 자세 ----------
    const PH = X.phases
    const CYCLE = PH.reduce((a, p) => a + p.dur, 0)
    function phaseAt(t) {
      let x = ((t % CYCLE) + CYCLE) % CYCLE, i = 0
      while (x > PH[i].dur && i < PH.length - 1) { x -= PH[i].dur; i++ }
      return { i, frac: Math.min(1, x / PH[i].dur) }
    }
    function poseAt(i, frac) {
      const ph = PH[i], u = ease(frac), A = X.poses[ph.from], B = X.poses[ph.to], p = {}
      for (const k in A) p[k] = lerp(A[k], B[k], u)
      return p
    }

    // ---------- 근육 강도 ----------
    const COLORS = (window.BodyMuscles && BodyMuscles.INTENSITY_COLORS) || { 0: '#94a3b8', 1: '#fde047', 2: '#facc15', 3: '#eab308', 4: '#fb923c', 5: '#f97316', 6: '#ea580c', 7: '#ef4444', 8: '#dc2626', 9: '#b91c1c', 10: '#7f1d1d' }
    let injured = 'left'
    if (X.sided) try { if (localStorage.getItem('lineart-injured') === 'right') injured = 'right' } catch (e) { /* 저장 안 됨 */ }
    const other = () => (injured === 'left' ? 'right' : 'left')
    function loadAt(i, frac) {
      const cur = X.loads[PH[i].key], prev = X.loads[PH[(i + PH.length - 1) % PH.length].key]
      const u = ease(Math.min(1, frac * 1.6)), m = {}
      for (const k of new Set([...Object.keys(cur), ...Object.keys(prev)])) m[k] = lerp(prev[k] || 0, cur[k] || 0, u)
      return m
    }
    function bodyState(m) {
      const st = {}
      const put = (id, v) => { const r = Math.min(10, Math.round(v)); if (r > 0 && (!st[id] || st[id].intensity < r)) st[id] = { intensity: r, selected: false } }
      for (const key in m) {
        const [who, name] = key.split(':')
        for (const id of IDS[name] || []) {
          if (who === 'B') { for (const sd of ['left', 'right', 'central']) put(`${id}-${sd}`, m[key]) }
          else put(`${id}-${who === 'S' ? injured : other()}`, m[key])
        }
      }
      return st
    }
    let charts = null
    if (window.BodyMuscles) {
      const { BodyChart, ViewSide } = BodyMuscles
      charts = [
        new BodyChart($('mapF'), { view: ViewSide.FRONT, bodyState: {}, ariaLabel: '앞모습 근육 지도', enableTransitions: true }),
        new BodyChart($('mapB'), { view: ViewSide.BACK, bodyState: {}, ariaLabel: '뒷모습 근육 지도', enableTransitions: true }),
      ]
    }
    const sideBox = document.querySelector('.side')
    if (!X.sided && sideBox) sideBox.remove()
    if (X.sided && sideBox) {
      const btns = sideBox.querySelectorAll('button')
      const mark = () => btns.forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.side === injured)))
      btns.forEach((b) => b.addEventListener('click', () => { injured = b.dataset.side; try { localStorage.setItem('lineart-injured', injured) } catch (e) { /* 저장 안 됨 */ } lastMap = ''; mark() }))
      mark()
    }

    // ---------- 큐·진행 바 ----------
    const cueEl = $('cue'), rolesEl = $('roles'), bar = $('bar')
    const fills = PH.map((ph) => { const s = document.createElement('span'); s.style.flex = String(ph.dur); const i = document.createElement('i'); s.appendChild(i); bar.appendChild(s); return i })
    let lastPhase = -1, lastMap = ''

    if (Gh) draw(Gh, full(X.solve(X.poses[X.ghostPose])), null)

    function frame(time) {
      const { i, frac } = phaseAt(time)
      const p = poseAt(i, frac)
      const j = full(X.solve(p))
      const load = loadAt(i, frac)
      const stretch = new Set(PH[i].stretch || [])
      if (props) props.update(j, p)
      draw(Fg, j, { load, stretch })
      if (i !== lastPhase) {
        lastPhase = i
        cueEl.innerHTML = `${PH[i].cue}<small>${PH[i].sub}</small>`
        rolesEl.innerHTML = (X.roles[PH[i].key] || []).map(([a, b]) => `<div><b>${a}</b> ${b}</div>`).join('')
      }
      fills.forEach((fi, k) => (fi.style.width = (k < i ? 100 : k === i ? frac * 100 : 0) + '%'))
      const st = bodyState(load), key = JSON.stringify(st) + injured
      if (charts && key !== lastMap) { lastMap = key; charts.forEach((c) => c.update({ bodyState: st })) }
    }

    // ---------- 루프 (?t=초 로 고정) ----------
    const q = new URLSearchParams(location.search)
    let speed = 1, playing = true, t = 0, prev = performance.now()
    if (q.has('t')) frame(Number(q.get('t')))
    else {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) { playing = false; t = X.reducedAt || 0 }
      const tick = (now) => {
        const dt = Math.min(0.05, (now - prev) / 1000); prev = now
        if (playing) t += dt * speed
        frame(t)
        requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }
    const playBtn = $('play'), slowBtn = $('slow')
    playBtn.addEventListener('click', () => { playing = !playing; playBtn.textContent = playing ? '일시정지' : '재생'; playBtn.setAttribute('aria-pressed', String(!playing)) })
    slowBtn.addEventListener('click', () => { speed = speed === 1 ? 0.5 : 1; slowBtn.setAttribute('aria-pressed', String(speed !== 1)) })
  }

  window.LineArtDemo = { mount, go, lerp, add, seg, L, R }
})()
