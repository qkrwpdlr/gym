// 리어델트 머신 — 공통 해법으로 관절·기구를 구성하는 운동별 설정.
ExerciseKit.mount({
  "kind": "rear-delt-machine",
  "family": "shoulder",
  "meta": {
    "title": "리어델트 머신",
    "kicker": "자세 보기",
    "sub": "벌리기 1초 · 모으기 2초 · 옆모습 투영",
    "summary": [
      [
        "주",
        "뒷어깨"
      ],
      [
        "보조",
        "등 가운데"
      ],
      [
        "버팀",
        "복부"
      ]
    ],
    "tips": [
      "가슴을 패드에 대고 팔을 옆·뒤로 벌려요.",
      "어깨를 으쓱하지 말고 같은 높이로 돌아와요.",
      "회복 중에는 통증 2/10 이하에서만 해요."
    ],
    "yt": "rear+delt+machine+exercise+form"
  },
  "phases": [
    {
      "key": "set",
      "dur": 0.8,
      "from": "start",
      "to": "start",
      "cue": "시작 자세를 잡아요",
      "sub": "옆모습 투영 · 어깨를 으쓱하지 않아요"
    },
    {
      "key": "move",
      "dur": 1.2,
      "from": "start",
      "to": "end",
      "cue": "팔을 옆·뒤로 벌려요",
      "sub": "옆모습 투영 · 어깨를 으쓱하지 않아요"
    },
    {
      "key": "hold",
      "dur": 1,
      "from": "end",
      "to": "end",
      "cue": "끝에서 1초 멈춰요",
      "sub": "옆모습 투영 · 어깨를 으쓱하지 않아요"
    },
    {
      "key": "return",
      "dur": 2,
      "from": "end",
      "to": "start",
      "cue": "천천히 시작 자세로 돌아와요",
      "sub": "옆모습 투영 · 어깨를 으쓱하지 않아요"
    }
  ],
  "loads": {
    "set": {
      "B:rdelt": 5.9,
      "B:traps": 3.9,
      "B:sdelt": 2.6,
      "B:forearm": 2.0,
      "B:abs": 1.3
    },
    "move": {
      "B:rdelt": 9,
      "B:traps": 6,
      "B:sdelt": 4,
      "B:forearm": 3,
      "B:abs": 2
    },
    "hold": {
      "B:rdelt": 9,
      "B:traps": 6,
      "B:sdelt": 4,
      "B:forearm": 3,
      "B:abs": 2
    },
    "return": {
      "B:rdelt": 7.2,
      "B:traps": 4.8,
      "B:sdelt": 3.2,
      "B:forearm": 2.4,
      "B:abs": 1.6
    }
  }
})
