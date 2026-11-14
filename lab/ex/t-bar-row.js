// T-바 로우 — 자세 키프레임·근육 강도(추정) 설정. 엔진은 ../lineart-demo.js
const META = {
  "title": "T-바 로우",
  "kicker": "상체 · 등",
  "sub": "당기기 1초 · 1초 멈춤 · 내리기 2초",
  "yt": "T-bar+row+form",
  "summary": [
    [
      "주",
      "광배근·등 가운데(날개뼈 모으기)"
    ],
    [
      "보조",
      "뒷어깨, 이두, 전완"
    ],
    [
      "버팀",
      "허리·햄스트링(힙힌지 유지)"
    ]
  ],
  "tips": [
    "허리는 평평하게, 반동 없이 팔꿈치를 뒤로.",
    "햄스트링 회복 1~3단계에는 체스트 서포티드 로우로 바꿔요."
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

// 발목 고정, 무릎 굽힘 고정. 상체는 거의 고정하고 손 위치를 어깨 아래 → 갈비뼈 아래로 옮기며 팔은 IK로 푼다(팔꿈치는 뒤로).
function torsoFrame(p) {
  const ankleN = [104, 128]
  const kneeN = go(ankleN, L.shank, 165)
  const hip = go(kneeN, L.thigh, 165 + 50)
  const shoulder = go(hip, L.torso, p.trunk)
  return { ankleN, kneeN, hip, shoulder }
}
LineArtDemo.mount({
  meta: META,
  summary: META.summary,
  viewBox: '36 40 136 96',
  ground: 'M38 130.6 L170 130.6',
  ghostPose: 'top',
  reducedAt: 2.2,
  farOffset: [-1.8, -0.8],
  poses: {
    bottom: { trunk: 118, reach: 0 },
    top: { trunk: 121, reach: 1 },
  },
  phases: [
    { key: 'set', dur: 0.8, from: 'bottom', to: 'bottom', cue: '엉덩이를 접고 등은 평평하게', sub: '팔은 곧게 · 무릎 살짝 굽혀 고정' },
    { key: 'pull', dur: 1.0, from: 'bottom', to: 'top', cue: '팔꿈치를 뒤로 끌어 당기기', sub: '손잡이를 명치 아래로 · 상체는 들지 않기' },
    { key: 'squeeze', dur: 0.8, from: 'top', to: 'top', cue: '날개뼈를 모으고 1초', sub: '어깨가 귀로 올라가지 않게' },
    { key: 'lower', dur: 2.0, from: 'top', to: 'bottom', cue: '2초 동안 천천히 내리기', sub: '등이 둥글게 말리지 않을 만큼만', stretch: ['B:lats'] },
  ],
  solve(p) {
    const j = torsoFrame(p)
    const d = [(j.shoulder[0] - j.hip[0]) / L.torso, (j.shoulder[1] - j.hip[1]) / L.torso]
    const frontN = [-d[1], d[0]] // 몸통의 앞(배) 방향
    const fN = frontN[1] > 0 ? frontN : [-frontN[0], -frontN[1]]
    const hang = [j.shoulder[0] + 1.2, j.shoulder[1] + L.upper + L.fore - 0.6]
    const chest = [j.hip[0] + d[0] * L.torso * 0.52 + fN[0] * 7, j.hip[1] + d[1] * L.torso * 0.52 + fN[1] * 7]
    const handN = [lerp(hang[0], chest[0], p.reach), lerp(hang[1], chest[1], p.reach)]
    const elbowN = ik(j.shoulder, handN, L.upper, L.fore, -1)
    return { ...j, elbowN, handN, toeN: 0, toeF: 0 }
  },
  // 랜드마인 T바: 뒤쪽 바닥의 축에서 손잡이를 지나 원판까지 이어진다.
  props({ back, front, el, pen }) {
    const bar = pen(back, 2.2)
    const pivot = el('path', { fill: 'currentColor' }, back)
    pivot.setAttribute('d', 'M38 131 L46 131 L44 126 L40 126 Z')
    const grip = pen(front, 2.6)
    // 원판은 몸 뒤에 그려 머리·팔이 앞에 오게 한다
    const plate = el('path', { class: 'pp', stroke: 'currentColor', 'stroke-width': 1.6 }, back)
    const plate2 = pen(back, 1)
    return {
      update(j) {
        const P = [42, 126], H = j.handN
        const dx = H[0] - P[0], dy = H[1] - P[1], l = Math.hypot(dx, dy)
        const end = [H[0] + (dx / l) * 9, H[1] + (dy / l) * 9]
        bar.setAttribute('d', `M${P[0]} ${P[1]} L${end[0].toFixed(2)} ${end[1].toFixed(2)}`)
        grip.setAttribute('d', `M${(H[0] - 2.4).toFixed(2)} ${(H[1] + 1).toFixed(2)} L${(H[0] + 2.4).toFixed(2)} ${(H[1] - 1).toFixed(2)}`)
        const c = [end[0] + (dx / l) * 1.5, end[1] + (dy / l) * 1.5], r = 12
        plate.setAttribute('d', `M${(c[0] - 2).toFixed(2)} ${(c[1] - r).toFixed(2)} h4 v${2 * r} h-4 Z`)
        plate2.setAttribute('d', `M${(c[0] + 3).toFixed(2)} ${(c[1] - r + 2).toFixed(2)} v${2 * r - 4}`)
      },
    }
  },
  bands: [
    { layer: 'torso', key: 'B:erect', from: 'hip', to: 'shoulder', off: 3.6, k0: 0.08, k1: 0.42, w: 3 },
    { layer: 'torso', key: 'B:lats', from: 'hip', to: 'shoulder', off: 3.4, k0: 0.46, k1: 0.8, w: 3.2 },
    { layer: 'torso', key: 'B:traps', from: 'hip', to: 'shoulder', off: 4.2, k0: 0.83, k1: 0.98, w: 3.2 },
    { layer: 'near', key: 'B:ham', from: 'kneeN', to: 'hip', off: 2.1, k0: 0.12, k1: 0.84, w: 2.6 },
    { layer: 'near', key: 'B:glute', type: 'glute', leg: 'near', w: 3.4 },
    { layer: 'arm', key: 'B:rdelt', from: 'elbowN', to: 'shoulder', off: 1.1, k0: 0.72, k1: 1.0, w: 2.6 },
    { layer: 'arm', key: 'B:biceps', from: 'elbowN', to: 'shoulder', off: -1.1, k0: 0.12, k1: 0.66, w: 2.2 },
    { layer: 'arm', key: 'B:forearm', from: 'handN', to: 'elbowN', off: 0, k0: 0.18, k1: 0.8, w: 2 },
  ],
  loads: {
    set: { 'B:erect': 5, 'B:ham': 4, 'B:glute': 3, 'B:forearm': 4, 'B:lats': 2 },
    pull: { 'B:lats': 8, 'B:traps': 7, 'B:rdelt': 6, 'B:biceps': 5, 'B:forearm': 5, 'B:erect': 6, 'B:ham': 4, 'B:glute': 4 },
    squeeze: { 'B:traps': 8, 'B:lats': 7, 'B:rdelt': 6, 'B:biceps': 5, 'B:forearm': 5, 'B:erect': 6, 'B:ham': 4, 'B:glute': 4 },
    lower: { 'B:lats': 6, 'B:traps': 5, 'B:rdelt': 4, 'B:biceps': 4, 'B:forearm': 4, 'B:erect': 6, 'B:ham': 4, 'B:glute': 3 },
  },
  roles: {
    set: [['버티기', '허리(척추기립근)·햄스트링·엉덩이로 힙힌지 유지'], ['보조', '전완(손잡이 잡기)']],
    pull: [['주로', '광배근·등 가운데(승모 중·하부)'], ['보조', '뒷어깨, 이두, 전완'], ['버티기', '허리·햄스트링']],
    squeeze: [['주로', '등 가운데(날개뼈 모으기)·광배근'], ['보조', '뒷어깨, 이두'], ['버티기', '허리·햄스트링']],
    lower: [['주로', '광배근이 늘어나며 버팀'], ['버티기', '허리·햄스트링, 전완']],
  },
})
