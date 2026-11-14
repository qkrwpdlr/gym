// 펜들레이 로우 — 공통 해법으로 관절·기구를 구성하는 운동별 설정.
ExerciseKit.mount({
  "kind": "pendlay-row",
  "family": "row",
  "meta": {
    "title": "펜들레이 로우",
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
        "허리·햄스트링"
      ]
    ],
    "tips": [
      "상체를 바닥과 거의 평행하게 두고 바를 당겨요.",
      "매번 원판을 바닥에 내려놓고 반동 없이 다시 시작해요."
    ],
    "yt": "pendlay+row+exercise+form"
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
      "B:erect": 3.2,
      "B:ham": 2.6
    },
    "move": {
      "B:lats": 8,
      "B:traps": 8,
      "B:rdelt": 6,
      "B:biceps": 6,
      "B:forearm": 5,
      "B:erect": 5,
      "B:ham": 4
    },
    "hold": {
      "B:lats": 8,
      "B:traps": 8,
      "B:rdelt": 6,
      "B:biceps": 6,
      "B:forearm": 5,
      "B:erect": 5,
      "B:ham": 4
    },
    "return": {
      "B:lats": 6.4,
      "B:traps": 6.4,
      "B:rdelt": 4.8,
      "B:biceps": 4.8,
      "B:forearm": 4.0,
      "B:erect": 4.0,
      "B:ham": 3.2
    }
  }
})
