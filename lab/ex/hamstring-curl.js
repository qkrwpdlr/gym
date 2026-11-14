// 햄스트링 컬 — 공통 해법으로 관절·기구를 구성하는 운동별 설정.
ExerciseKit.mount({
  "kind": "hamstring-curl",
  "family": "seatedLeg",
  "meta": {
    "title": "햄스트링 컬",
    "kicker": "자세 보기",
    "sub": "천천히 반복 · 반동 없이",
    "summary": [
      [
        "주",
        "햄스트링"
      ],
      [
        "보조",
        "종아리"
      ],
      [
        "버팀",
        "복부·골반"
      ]
    ],
    "tips": [
      "시티드 머신의 허벅지 패드로 다리를 고정해요.",
      "발목 패드를 뒤로 당기고 2초간 천천히 펴요.",
      "회복 중에는 통증 2/10 이하에서만 해요."
    ],
    "yt": "hamstring+curl+exercise+form"
  },
  "phases": [
    {
      "key": "set",
      "dur": 0.8,
      "from": "start",
      "to": "start",
      "cue": "시작 자세를 잡아요",
      "sub": "허벅지와 골반은 좌석에 고정해요"
    },
    {
      "key": "move",
      "dur": 1.2,
      "from": "start",
      "to": "end",
      "cue": "뒤꿈치를 아래·뒤로 당겨요",
      "sub": "허벅지와 골반은 좌석에 고정해요"
    },
    {
      "key": "hold",
      "dur": 1,
      "from": "end",
      "to": "end",
      "cue": "끝에서 1초 멈춰요",
      "sub": "허벅지와 골반은 좌석에 고정해요"
    },
    {
      "key": "return",
      "dur": 2,
      "from": "end",
      "to": "start",
      "cue": "천천히 시작 자세로 돌아와요",
      "sub": "허벅지와 골반은 좌석에 고정해요"
    }
  ],
  "loads": {
    "set": {
      "B:ham": 5.9,
      "B:calf": 2.6,
      "B:abs": 1.3
    },
    "move": {
      "B:ham": 9,
      "B:calf": 4,
      "B:abs": 2
    },
    "hold": {
      "B:ham": 9,
      "B:calf": 4,
      "B:abs": 2
    },
    "return": {
      "B:ham": 7.2,
      "B:calf": 3.2,
      "B:abs": 1.6
    }
  },
  "viewBox": "50 50 110 87"
})
