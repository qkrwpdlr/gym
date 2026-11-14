// 풀업 — 자세 키프레임·근육 강도(추정) 설정. 엔진은 ../lineart-demo.js
const META = {
  "title": "풀업",
  "kicker": "상체 · 등",
  "sub": "올라가기 1.2초 · 내려가기 2초",
  "yt": "pull+up+form",
  "summary": [
    [
      "주",
      "광배근"
    ],
    [
      "보조",
      "이두, 등 아래(승모 하부), 전완"
    ],
    [
      "버팀",
      "복근(몸 흔들림 막기)"
    ]
  ],
  "tips": [
    "시작할 때 날개뼈를 살짝 내리고 매달려요.",
    "다리 차지 말고 천천히 내려요. 통증은 2/10 이하로 해요."
  ]
}
const { go, lerp, L } = LineArtDemo
// 두 마디 IK: a에서 b까지 l1·l2 길이로 잇고, bend=+1이면 가운데 관절이 앞(+x), -1이면 뒤.
function ik(a, b, l1, l2, bend) {
  const dx = b[0] - a[0], dy = b[1] - a[1]
  const d = Math.min(Math.hypot(dx, dy), l1 + l2 - 0.01)
  const th = Math.atan2(dy, dx)
  const al = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))))
  const c1 = [a[0] + l1 * Math.cos(th - al), a[1] + l1 * Math.sin(th - al)]
  const c2 = [a[0] + l1 * Math.cos(th + al), a[1] + l1 * Math.sin(th + al)]
  return (c1[0] - c2[0]) * bend > 0 ? c1 : c2
}

// 손은 바에 고정. 어깨 위치를 매달림 → 바 높이로 옮기고 팔은 IK(팔꿈치는 앞쪽)로 푼다. 몸통·다리는 어깨에 매달린다.
const BAR = [112, 24]
LineArtDemo.mount(window.__demoConfig = {
  meta: META,
  summary: META.summary,
  viewBox: '56 6 112 132',
  ground: false,
  ghostPose: 'top',
  reducedAt: 2.4,
  farOffset: [-1.8, -0.6],
  poses: {
    hang: { rise: 0, lean: 3, kneeA: -40 },
    top: { rise: 1, lean: 14, kneeA: -48 },
  },
  phases: [
    { key: 'hang', dur: 0.8, from: 'hang', to: 'hang', cue: '어깨를 살짝 내리고 매달리기', sub: '날개뼈 아래로 · 몸 흔들지 않기', stretch: ['B:lats'] },
    { key: 'pull', dur: 1.2, from: 'hang', to: 'top', cue: '팔꿈치를 옆구리 쪽으로 끌어내리기', sub: '가슴을 바 쪽으로 · 다리 차지 않기' },
    { key: 'top', dur: 0.6, from: 'top', to: 'top', cue: '턱이 바를 넘게 · 잠깐 멈춤', sub: '어깨가 귀로 올라가지 않게' },
    { key: 'lower', dur: 2.0, from: 'top', to: 'hang', cue: '2초 동안 천천히 내려가기', sub: '팔이 거의 펴질 때까지', stretch: ['B:lats'] },
  ],
  solve(p) {
    const handN = BAR
    const sHang = [BAR[0] - 1.5, BAR[1] + L.upper + L.fore - 0.8]
    const sTop = [BAR[0] - 3.5, BAR[1] + 3]
    const shoulder = [lerp(sHang[0], sTop[0], p.rise), lerp(sHang[1], sTop[1], p.rise)]
    const elbowN = ik(shoulder, handN, L.upper, L.fore, 1)
    const hip = go(shoulder, L.torso, -p.lean + 8)
    const kneeN = go(hip, L.thigh, 12)
    const ankleN = go(kneeN, L.shank, 12 + p.kneeA)
    return { shoulder, hip, kneeN, ankleN, elbowN, handN, toeN: 55, toeF: 55,
      shoulderF: [shoulder[0] - 1.6, shoulder[1] - 0.6], elbowF: [elbowN[0] - 1.6, elbowN[1] - 0.6], handF: [handN[0] - 3.5, handN[1]] }
  },
  props({ back, pen }) {
    const bar = pen(back, 2.6)
    bar.setAttribute('d', `M60 ${BAR[1]} L164 ${BAR[1]}`)
    return { update() {} }
  },
  bands: [
    { layer: 'torso', key: 'B:lats', from: 'hip', to: 'shoulder', off: 3.4, k0: 0.38, k1: 0.86, w: 3.2 },
    { layer: 'torso', key: 'B:traps', from: 'hip', to: 'shoulder', off: 4.2, k0: 0.84, k1: 0.98, w: 3.2 },
    { layer: 'torso', key: 'B:abs', from: 'hip', to: 'shoulder', off: -4, k0: 0.18, k1: 0.66, w: 2.6 },
    { layer: 'arm', key: 'B:biceps', from: 'elbowN', to: 'shoulder', off: -1.1, k0: 0.12, k1: 0.68, w: 2.2 },
    { layer: 'arm', key: 'B:rdelt', from: 'elbowN', to: 'shoulder', off: 1.1, k0: 0.74, k1: 1.0, w: 2.4 },
    { layer: 'arm', key: 'B:forearm', from: 'handN', to: 'elbowN', off: 0, k0: 0.2, k1: 0.8, w: 2 },
  ],
  loads: {
    hang: { 'B:forearm': 6, 'B:lats': 3, 'B:traps': 4, 'B:abs': 3 },
    pull: { 'B:lats': 9, 'B:biceps': 7, 'B:traps': 6, 'B:forearm': 6, 'B:rdelt': 4, 'B:abs': 4 },
    top: { 'B:lats': 8, 'B:biceps': 7, 'B:traps': 7, 'B:forearm': 6, 'B:rdelt': 4, 'B:abs': 4 },
    lower: { 'B:lats': 7, 'B:biceps': 5, 'B:traps': 5, 'B:forearm': 6, 'B:rdelt': 3, 'B:abs': 3 },
  },
  roles: {
    hang: [['버티기', '전완(악력)·등 아래쪽(날개뼈 내리기)'], ['보조', '복근(몸 고정)']],
    pull: [['주로', '광배근'], ['보조', '이두, 등 가운데·아래(승모 하부), 전완'], ['버티기', '복근']],
    top: [['주로', '광배근·이두로 높이 유지'], ['보조', '등 가운데, 전완']],
    lower: [['주로', '광배근이 늘어나며 버팀'], ['보조', '이두, 전완']],
  },
})
