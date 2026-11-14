// 행잉 레그레이즈 — 공통 해법으로 관절·기구를 구성하는 운동별 설정.
ExerciseKit.mount({
  "kind": "hanging-leg-raise",
  "family": "hanging",
  "meta": {
    "title": "행잉 레그레이즈",
    "kicker": "자세 보기",
    "sub": "천천히 반복 · 반동 없이",
    "summary": [
      [
        "주",
        "복근·고관절 굽힘근"
      ],
      [
        "보조",
        "허벅지 앞"
      ],
      [
        "버팀",
        "광배근·전완"
      ]
    ],
    "tips": [
      "바에 매달려 몸이 흔들리지 않게 고정해요.",
      "다리를 들며 골반을 말고 천천히 내려요."
    ],
    "yt": "hanging+leg+raise+pelvic+tilt"
  },
  "phases": [
    {
      "key": "set",
      "dur": 0.8,
      "from": "start",
      "to": "start",
      "cue": "시작 자세를 잡아요",
      "sub": "상체 반동 없이 복부에 힘을 줘요"
    },
    {
      "key": "move",
      "dur": 1.2,
      "from": "start",
      "to": "end",
      "cue": "골반을 말며 다리를 들어요",
      "sub": "상체 반동 없이 복부에 힘을 줘요"
    },
    {
      "key": "hold",
      "dur": 1,
      "from": "end",
      "to": "end",
      "cue": "끝에서 1초 멈춰요",
      "sub": "상체 반동 없이 복부에 힘을 줘요"
    },
    {
      "key": "return",
      "dur": 2,
      "from": "end",
      "to": "start",
      "cue": "천천히 시작 자세로 돌아와요",
      "sub": "상체 반동 없이 복부에 힘을 줘요"
    }
  ],
  "loads": {
    "set": {
      "B:abs": 5.9,
      "B:quad": 3.2,
      "B:lats": 2.6,
      "B:forearm": 4.5
    },
    "move": {
      "B:abs": 9,
      "B:quad": 5,
      "B:lats": 4,
      "B:forearm": 7
    },
    "hold": {
      "B:abs": 9,
      "B:quad": 5,
      "B:lats": 4,
      "B:forearm": 7
    },
    "return": {
      "B:abs": 7.2,
      "B:quad": 4.0,
      "B:lats": 3.2,
      "B:forearm": 5.6
    }
  }
})
