// 아스클링 다이버 — 자세 키프레임·근육 강도(추정) 설정. 엔진은 ../lineart-demo.js
const META = {
  "title": "아스클링 다이버",
  "kicker": "회복 2단계 · L-프로토콜",
  "sub": "다친 다리로 서서 다이빙하듯 숙이기 · 3×6 · 이틀에 한 번",
  "yt": "Askling+diver+L-protocol",
  "summary": [
    [
      "주",
      "다친 다리 햄스트링(늘어나며 버팀)·엉덩이"
    ],
    [
      "보조",
      "허리, 중둔근, 반대쪽 엉덩이"
    ]
  ],
  "tips": [
    "선 다리 무릎은 10~20° 굽힌 채 고정해요.",
    "숙이기·팔 뻗기·뒷다리 뻗기를 동시에, 골반은 수평으로.",
    "당김이 2/10을 넘으면 그 직전 깊이에서 멈춰요."
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

LineArtDemo.mount({
  meta: META,
  summary: META.summary,
  viewBox: '44 22 156 116',
  ground: 'M48 130.6 L196 130.6',
  sided: true,
  ghostPose: 'end',
  reducedAt: 4.5,
  poses: {
    start: { trunk: 176, arm: 12, elbow: 8, swingThigh: -4, swingKnee: 28 },
    end: { trunk: 100, arm: 102, elbow: 2, swingThigh: -82, swingKnee: 4 },
  },
  phases: [
    { key: 'set', dur: 1.2, from: 'start', to: 'start', cue: '다친 다리로 서요', sub: '무릎은 살짝 굽혀서 고정 · 반대 발은 살짝 띄우기' },
    { key: 'dive', dur: 3.0, from: 'start', to: 'end', cue: '숙이며 팔은 앞으로, 뒷다리는 뒤로', sub: '세 동작을 동시에 · 천천히', stretch: ['S:ham'] },
    { key: 'hold', dur: 1.2, from: 'end', to: 'end', cue: '끝에서 잠깐 멈춤', sub: '골반 수평 · 당김 2/10 넘으면 덜 숙이기', stretch: ['S:ham'] },
    { key: 'back', dur: 2.4, from: 'end', to: 'start', cue: '천천히 돌아오기', sub: '선 다리 무릎 각도는 그대로' },
  ],
  // 선 다리(가까운 다리)는 발목 고정, 무릎 15° 고정. 숙일수록 정강이 기울기를 줄여 골반을 뒤로 보낸다.
  solve(p) {
    const depth = (176 - p.trunk) / 76
    const ankleN = [118, 128]
    const lean = lerp(9, 4, depth)
    const kneeN = go(ankleN, L.shank, 180 - lean)
    const hip = go(kneeN, L.thigh, 180 - lean + 15)
    const shoulder = go(hip, L.torso, p.trunk)
    const elbowN = go(shoulder, L.upper, p.arm)
    const handN = go(elbowN, L.fore, p.arm + p.elbow)
    const kneeF = go(hip, L.thigh, p.swingThigh)
    const ankleF = go(kneeF, L.shank, p.swingThigh + p.swingKnee)
    return { ankleN, kneeN, hip, shoulder, elbowN, handN, kneeF, ankleF, toeF: 12 + 58 * depth,
      elbowF: [elbowN[0] - 1.2, elbowN[1] + 0.6], handF: [handN[0] - 1.2, handN[1] + 0.6] }
  },
  bands: [
    { layer: 'far', key: 'O:ham', from: 'kneeF', to: 'hipF', off: 1.9, k0: 0.15, k1: 0.78 },
    { layer: 'far', key: 'O:glute', from: 'kneeF', to: 'hipF', off: 2.2, k0: 0.84, k1: 1.0, w: 3.2 },
    { layer: 'torso', key: 'B:erect', from: 'hip', to: 'shoulder', off: 3.6, k0: 0.22, k1: 0.78, w: 3 },
    { layer: 'near', key: 'S:ham', from: 'kneeN', to: 'hip', off: 2.1, k0: 0.12, k1: 0.84, w: 2.6 },
    { layer: 'near', key: 'S:quad', from: 'kneeN', to: 'hip', off: -2.1, k0: 0.12, k1: 0.84 },
    { layer: 'near', key: 'S:calf', from: 'ankleN', to: 'kneeN', off: 1.7, k0: 0.3, k1: 0.82, w: 2.2 },
    { layer: 'near', key: 'S:glute', type: 'glute', leg: 'near', w: 3.4 },
    { layer: 'arm', key: 'B:delt', from: 'elbowN', to: 'shoulder', off: 0, k0: 0.7, k1: 1.0, w: 3.2 },
  ],
  loads: {
    set: { 'S:quad': 3, 'S:gmed': 4, 'S:calf': 3, 'S:glute': 2 },
    dive: { 'S:ham': 7, 'S:glute': 6, 'S:gmed': 5, 'B:erect': 5, 'O:glute': 6, 'O:ham': 4, 'B:delt': 3, 'S:quad': 3, 'S:calf': 3 },
    hold: { 'S:ham': 7, 'S:glute': 6, 'S:gmed': 6, 'B:erect': 6, 'O:glute': 7, 'O:ham': 5, 'B:delt': 4, 'S:quad': 3, 'S:calf': 3 },
    back: { 'S:glute': 7, 'S:ham': 6, 'S:gmed': 5, 'B:erect': 5, 'O:glute': 3, 'O:ham': 2, 'S:quad': 3, 'S:calf': 3 },
  },
  roles: {
    set: [['주로', '선 다리 허벅지 앞·중둔근으로 균형 잡기'], ['버티기', '종아리']],
    dive: [['주로', '선 다리 햄스트링(늘어나며 버팀)·엉덩이'], ['버티기', '허리(척추기립근)·중둔근으로 골반 수평'], ['보조', '뒷다리 엉덩이, 앞어깨']],
    hold: [['주로', '선 다리 햄스트링·엉덩이로 자세 고정'], ['버티기', '허리·중둔근, 뒷다리 엉덩이'], ['보조', '앞어깨(팔 뻗기)']],
    back: [['주로', '선 다리 엉덩이로 골반을 세워 올라오기'], ['보조', '선 다리 햄스트링, 허리']],
  },
})
