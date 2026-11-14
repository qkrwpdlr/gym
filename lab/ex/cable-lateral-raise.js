// 케이블 레터럴 레이즈 — 공통 해법으로 관절·기구를 구성하는 운동별 설정.
ExerciseKit.mount({
  "kind": "cable-lateral-raise",
  "family": "shoulder",
  "meta": {
    "title": "케이블 레터럴 레이즈",
    "kicker": "자세 보기",
    "sub": "올리기 1초 · 내리기 2초 · 옆모습 투영",
    "summary": [
      [
        "주",
        "옆어깨"
      ],
      [
        "보조",
        "앞어깨·승모근"
      ],
      [
        "버팀",
        "복부"
      ]
    ],
    "tips": [
      "팔꿈치를 살짝 굽힌 채 팔을 옆으로 들어요.",
      "어깨 높이까지만, 몸통 반동 없이 내려요.",
      "회복 중에는 통증 2/10 이하에서만 해요."
    ],
    "yt": "cable+lateral+raise+exercise+form"
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
      "cue": "팔을 옆으로 들어요",
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
      "B:sdelt": 5.9,
      "B:delt": 2.0,
      "B:traps": 2.6,
      "B:forearm": 2.0,
      "B:abs": 2.0
    },
    "move": {
      "B:sdelt": 9,
      "B:delt": 3,
      "B:traps": 4,
      "B:forearm": 3,
      "B:abs": 3
    },
    "hold": {
      "B:sdelt": 9,
      "B:delt": 3,
      "B:traps": 4,
      "B:forearm": 3,
      "B:abs": 3
    },
    "return": {
      "B:sdelt": 7.2,
      "B:delt": 2.4,
      "B:traps": 3.2,
      "B:forearm": 2.4,
      "B:abs": 2.4
    }
  }
})
