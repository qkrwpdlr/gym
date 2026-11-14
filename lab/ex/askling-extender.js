// 아스클링 익스텐더 — 공통 해법으로 관절·기구를 구성하는 운동별 설정.
ExerciseKit.mount({
  "kind": "askling-extender",
  "family": "extender",
  "meta": {
    "title": "아스클링 익스텐더",
    "kicker": "회복 · L-프로토콜",
    "sub": "고관절 90° 고정 · 천천히 무릎 펴기 · 통증 전 멈춤",
    "summary": [
      [
        "주",
        "햄스트링(길이 늘리기)"
      ],
      [
        "보조",
        "허벅지 앞(무릎 펴기)"
      ],
      [
        "버팀",
        "팔·복부"
      ]
    ],
    "tips": [
      "누워 다친 허벅지를 두 손으로 90°에 고정해요.",
      "통증이 생기기 직전까지만 무릎을 천천히 펴요.",
      "회복 중에는 통증 2/10 이하에서만 해요."
    ],
    "yt": "Askling+extender+L+protocol"
  },
  "phases": [
    {
      "key": "set",
      "dur": 1,
      "from": "start",
      "to": "start",
      "cue": "허벅지를 두 손으로 고정해요",
      "sub": "고관절 90° · 어깨와 골반은 바닥에"
    },
    {
      "key": "extend",
      "dur": 3,
      "from": "start",
      "to": "end",
      "cue": "무릎을 천천히 펴요",
      "sub": "통증 직전에 멈춰요",
      "stretch": [
        "S:ham"
      ]
    },
    {
      "key": "return",
      "dur": 2,
      "from": "end",
      "to": "start",
      "cue": "무릎을 다시 굽혀요",
      "sub": "허벅지 위치는 그대로 유지해요"
    }
  ],
  "loads": {
    "set": {
      "S:ham": 2.0,
      "S:quad": 2.6,
      "B:biceps": 1.3,
      "B:abs": 1.3
    },
    "extend": {
      "S:ham": 3,
      "S:quad": 4,
      "B:biceps": 2,
      "B:abs": 2
    },
    "return": {
      "S:ham": 2.4,
      "S:quad": 3.2,
      "B:biceps": 1.6,
      "B:abs": 1.6
    }
  },
  "sided": true,
  "viewBox": "37 60 119 80"
})
