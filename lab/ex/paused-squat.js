// 포즈 로우바 스쿼트 — 공통 해법으로 관절·기구를 구성하는 운동별 설정.
ExerciseKit.mount({
  "kind": "paused-squat",
  "family": "squat",
  "meta": {
    "title": "포즈 로우바 스쿼트",
    "kicker": "자세 보기",
    "sub": "바텀 2초 정지 · 로우바",
    "summary": [
      [
        "주",
        "허벅지 앞·엉덩이"
      ],
      [
        "보조",
        "내전근·햄스트링"
      ],
      [
        "버팀",
        "허리·복부"
      ]
    ],
    "tips": [
      "로우바 위치를 유지하고 바닥에서 2초 멈춰요.",
      "멈춘 동안 배의 압력과 발 전체 지지를 유지해요."
    ],
    "yt": "paused+squat+exercise+form"
  },
  "phases": [
    {
      "key": "set",
      "dur": 0.8,
      "from": "start",
      "to": "start",
      "cue": "시작 자세를 잡아요",
      "sub": "호흡을 정리하고 몸통을 고정해요"
    },
    {
      "key": "down",
      "dur": 2,
      "from": "start",
      "to": "end",
      "cue": "엉덩이와 무릎을 함께 굽혀요",
      "sub": "로우바 · 발 전체로 지지해요"
    },
    {
      "key": "hold",
      "dur": 2,
      "from": "end",
      "to": "end",
      "cue": "바닥에서 2초 멈춰요",
      "sub": "로우바 · 발 전체로 지지해요",
      "count": true
    },
    {
      "key": "up",
      "dur": 2,
      "from": "end",
      "to": "start",
      "cue": "가슴과 골반이 함께 올라와요",
      "sub": "로우바 · 발 전체로 지지해요"
    }
  ],
  "loads": {
    "set": {
      "B:quad": 5.9,
      "B:glute": 5.2,
      "B:erect": 3.9,
      "B:abs": 3.9,
      "B:ham": 2.6,
      "B:calf": 2.0
    },
    "down": {
      "B:quad": 9,
      "B:glute": 8,
      "B:erect": 6,
      "B:abs": 6,
      "B:ham": 4,
      "B:calf": 3
    },
    "hold": {
      "B:quad": 9,
      "B:glute": 8,
      "B:erect": 6,
      "B:abs": 6,
      "B:ham": 4,
      "B:calf": 3
    },
    "up": {
      "B:quad": 9,
      "B:glute": 8,
      "B:erect": 6,
      "B:abs": 6,
      "B:ham": 4,
      "B:calf": 3
    }
  }
})
