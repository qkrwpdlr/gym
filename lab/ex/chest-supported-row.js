// 체스트 서포티드 로우 — 공통 해법으로 관절·기구를 구성하는 운동별 설정.
ExerciseKit.mount({
  "kind": "chest-supported-row",
  "family": "row",
  "meta": {
    "title": "체스트 서포티드 로우",
    "kicker": "자세 보기",
    "sub": "천천히 반복 · 반동 없이",
    "summary": [
      [
        "주",
        "광배근·등 가운데"
      ],
      [
        "보조",
        "뒷어깨·이두·전완"
      ],
      [
        "버팀",
        "복부"
      ]
    ],
    "tips": [
      "가슴을 패드에 대고 발로 바닥을 지지해요.",
      "가슴을 떼지 않고 팔꿈치를 뒤로 보내요.",
      "회복 중에는 통증 2/10 이하에서만 해요."
    ],
    "yt": "chest+supported+row+exercise+form"
  },
  "phases": [
    {
      "key": "set",
      "dur": 0.8,
      "from": "start",
      "to": "start",
      "cue": "시작 자세를 잡아요",
      "sub": "가슴과 골반은 고정해요"
    },
    {
      "key": "move",
      "dur": 1.2,
      "from": "start",
      "to": "end",
      "cue": "팔꿈치를 뒤로 당겨요",
      "sub": "가슴과 골반은 고정해요"
    },
    {
      "key": "hold",
      "dur": 1,
      "from": "end",
      "to": "end",
      "cue": "끝에서 1초 멈춰요",
      "sub": "가슴과 골반은 고정해요"
    },
    {
      "key": "return",
      "dur": 2,
      "from": "end",
      "to": "start",
      "cue": "천천히 시작 자세로 돌아와요",
      "sub": "가슴과 골반은 고정해요"
    }
  ],
  "loads": {
    "set": {
      "B:lats": 5.2,
      "B:traps": 5.2,
      "B:rdelt": 3.9,
      "B:biceps": 3.9,
      "B:forearm": 3.2,
      "B:erect": 1.3,
      "B:ham": 0.7
    },
    "move": {
      "B:lats": 8,
      "B:traps": 8,
      "B:rdelt": 6,
      "B:biceps": 6,
      "B:forearm": 5,
      "B:erect": 2,
      "B:ham": 1
    },
    "hold": {
      "B:lats": 8,
      "B:traps": 8,
      "B:rdelt": 6,
      "B:biceps": 6,
      "B:forearm": 5,
      "B:erect": 2,
      "B:ham": 1
    },
    "return": {
      "B:lats": 6.4,
      "B:traps": 6.4,
      "B:rdelt": 4.8,
      "B:biceps": 4.8,
      "B:forearm": 4.0,
      "B:erect": 1.6,
      "B:ham": 0.8
    }
  }
})
