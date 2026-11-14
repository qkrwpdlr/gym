// 카프 레이즈 — 공통 해법으로 관절·기구를 구성하는 운동별 설정.
ExerciseKit.mount({
  "kind": "calf-raise",
  "family": "calf",
  "meta": {
    "title": "카프 레이즈",
    "kicker": "자세 보기",
    "sub": "천천히 반복 · 반동 없이",
    "summary": [
      [
        "주",
        "종아리"
      ],
      [
        "보조",
        "발목 주변"
      ],
      [
        "버팀",
        "복부"
      ]
    ],
    "tips": [
      "발 앞쪽을 발판에 두고 뒤꿈치를 들어요.",
      "위에서 1초 멈추고 반동 없이 내려요.",
      "회복 중에는 통증 2/10 이하에서만 해요."
    ],
    "yt": "calf+raise+exercise+form"
  },
  "phases": [
    {
      "key": "set",
      "dur": 0.8,
      "from": "start",
      "to": "start",
      "cue": "시작 자세를 잡아요",
      "sub": "발 앞쪽은 발판에 고정해요"
    },
    {
      "key": "move",
      "dur": 1.2,
      "from": "start",
      "to": "end",
      "cue": "뒤꿈치를 들어요",
      "sub": "발 앞쪽은 발판에 고정해요"
    },
    {
      "key": "hold",
      "dur": 1,
      "from": "end",
      "to": "end",
      "cue": "끝에서 1초 멈춰요",
      "sub": "발 앞쪽은 발판에 고정해요"
    },
    {
      "key": "return",
      "dur": 2,
      "from": "end",
      "to": "start",
      "cue": "천천히 시작 자세로 돌아와요",
      "sub": "발 앞쪽은 발판에 고정해요"
    }
  ],
  "loads": {
    "set": {
      "B:calf": 5.9,
      "B:quad": 1.3,
      "B:abs": 2.0
    },
    "move": {
      "B:calf": 9,
      "B:quad": 2,
      "B:abs": 3
    },
    "hold": {
      "B:calf": 9,
      "B:quad": 2,
      "B:abs": 3
    },
    "return": {
      "B:calf": 7.2,
      "B:quad": 1.6,
      "B:abs": 2.4
    }
  }
})
