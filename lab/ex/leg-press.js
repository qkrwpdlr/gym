// 레그 프레스 — 공통 해법으로 관절·기구를 구성하는 운동별 설정.
ExerciseKit.mount({
  "kind": "leg-press",
  "family": "legPress",
  "meta": {
    "title": "레그 프레스",
    "kicker": "자세 보기",
    "sub": "천천히 반복 · 반동 없이",
    "summary": [
      [
        "주",
        "허벅지 앞·엉덩이"
      ],
      [
        "보조",
        "내전근"
      ],
      [
        "버팀",
        "복부"
      ]
    ],
    "tips": [
      "골반과 허리를 패드에 붙인 채 무릎을 굽혀요.",
      "뒤꿈치를 붙이고 무릎을 세게 잠그지 않아요.",
      "회복 중에는 통증 2/10 이하에서만 해요."
    ],
    "yt": "leg+press+exercise+form"
  },
  "phases": [
    {
      "key": "set",
      "dur": 0.8,
      "from": "start",
      "to": "start",
      "cue": "시작 자세를 잡아요",
      "sub": "골반이 패드에서 말려 올라오기 전에 멈춰요"
    },
    {
      "key": "move",
      "dur": 2,
      "from": "start",
      "to": "end",
      "cue": "무릎을 천천히 굽혀요",
      "sub": "골반이 패드에서 말려 올라오기 전에 멈춰요"
    },
    {
      "key": "hold",
      "dur": 1,
      "from": "end",
      "to": "end",
      "cue": "끝에서 1초 멈춰요",
      "sub": "골반이 패드에서 말려 올라오기 전에 멈춰요"
    },
    {
      "key": "return",
      "dur": 2,
      "from": "end",
      "to": "start",
      "cue": "천천히 시작 자세로 돌아와요",
      "sub": "골반이 패드에서 말려 올라오기 전에 멈춰요"
    }
  ],
  "loads": {
    "set": {
      "B:quad": 5.9,
      "B:glute": 4.5,
      "B:ham": 2.0,
      "B:calf": 1.3,
      "B:abs": 2.0
    },
    "move": {
      "B:quad": 9,
      "B:glute": 7,
      "B:ham": 3,
      "B:calf": 2,
      "B:abs": 3
    },
    "hold": {
      "B:quad": 9,
      "B:glute": 7,
      "B:ham": 3,
      "B:calf": 2,
      "B:abs": 3
    },
    "return": {
      "B:quad": 7.2,
      "B:glute": 5.6,
      "B:ham": 2.4,
      "B:calf": 1.6,
      "B:abs": 2.4
    }
  },
  "viewBox": "40 43 127 97"
})
