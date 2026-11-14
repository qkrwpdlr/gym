// 노르딕컬 — 공통 해법으로 관절·기구를 구성하는 운동별 설정.
ExerciseKit.mount({
  "kind": "nordic-curl",
  "family": "nordic",
  "meta": {
    "title": "노르딕컬",
    "kicker": "자세 보기",
    "sub": "보조·짧은 범위부터 · 내리기 4초 · 손으로 복귀",
    "summary": [
      [
        "주",
        "햄스트링(내려가며 버팀)"
      ],
      [
        "보조",
        "종아리"
      ],
      [
        "버팀",
        "엉덩이·복부"
      ]
    ],
    "tips": [
      "발목을 고정하고 무릎부터 머리까지 곧게 유지해요.",
      "4초간 버티며 내려가고 손으로 받아 밀어 돌아와요.",
      "회복 중에는 통증 2/10 이하에서만 해요."
    ],
    "yt": "nordic+curl+exercise+form"
  },
  "phases": [
    {
      "key": "set",
      "dur": 0.8,
      "from": "start",
      "to": "start",
      "cue": "시작 자세를 잡아요",
      "sub": "보조·짧은 범위부터 · 내리기 4초 · 손으로 복귀"
    },
    {
      "key": "down",
      "dur": 4,
      "from": "start",
      "to": "end",
      "cue": "몸을 곧게 유지하며 내려요",
      "sub": "햄스트링으로 4초 버텨요 · 손을 준비해요"
    },
    {
      "key": "hold",
      "dur": 0.7,
      "from": "end",
      "to": "end",
      "cue": "끝 범위에서 잠깐 멈춰요",
      "sub": "햄스트링으로 4초 버텨요 · 손을 준비해요",
      "count": false
    },
    {
      "key": "up",
      "dur": 2,
      "from": "end",
      "to": "start",
      "cue": "손으로 밀어 돌아와요",
      "sub": "햄스트링으로 4초 버텨요 · 손을 준비해요"
    }
  ],
  "loads": {
    "set": {
      "B:ham": 6.5,
      "B:calf": 3.2,
      "B:glute": 2.6,
      "B:abs": 3.2
    },
    "down": {
      "B:ham": 10,
      "B:calf": 5,
      "B:glute": 4,
      "B:abs": 5
    },
    "hold": {
      "B:ham": 10,
      "B:calf": 5,
      "B:glute": 4,
      "B:abs": 5
    },
    "up": {
      "B:ham": 10,
      "B:calf": 5,
      "B:glute": 4,
      "B:abs": 5
    }
  },
  "viewBox": "49 51 118 89"
})
