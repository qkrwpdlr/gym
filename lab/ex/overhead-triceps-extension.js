// 오버헤드 익스텐션 — 공통 해법으로 관절·기구를 구성하는 운동별 설정.
ExerciseKit.mount({
  "kind": "overhead-triceps-extension",
  "family": "triceps",
  "meta": {
    "title": "오버헤드 익스텐션",
    "kicker": "자세 보기",
    "sub": "천천히 반복 · 반동 없이",
    "summary": [
      [
        "주",
        "삼두(긴갈래)"
      ],
      [
        "보조",
        "전완"
      ],
      [
        "버팀",
        "복부·어깨"
      ]
    ],
    "tips": [
      "팔꿈치를 머리 옆에 두고 위팔을 고정해요.",
      "케이블을 머리 뒤로 내렸다 팔꿈치를 펴요.",
      "회복 중에는 통증 2/10 이하에서만 해요."
    ],
    "yt": "overhead+triceps+extension+exercise+form"
  },
  "phases": [
    {
      "key": "set",
      "dur": 0.8,
      "from": "start",
      "to": "start",
      "cue": "시작 자세를 잡아요",
      "sub": "팔꿈치는 머리 옆에 유지해요"
    },
    {
      "key": "move",
      "dur": 1.2,
      "from": "start",
      "to": "end",
      "cue": "위팔을 고정하고 팔꿈치를 펴요",
      "sub": "팔꿈치는 머리 옆에 유지해요"
    },
    {
      "key": "hold",
      "dur": 1,
      "from": "end",
      "to": "end",
      "cue": "끝에서 1초 멈춰요",
      "sub": "팔꿈치는 머리 옆에 유지해요"
    },
    {
      "key": "return",
      "dur": 2,
      "from": "end",
      "to": "start",
      "cue": "천천히 시작 자세로 돌아와요",
      "sub": "팔꿈치는 머리 옆에 유지해요"
    }
  ],
  "loads": {
    "set": {
      "B:triceps": 5.9,
      "B:forearm": 2.0,
      "B:delt": 2.0,
      "B:abs": 2.6
    },
    "move": {
      "B:triceps": 9,
      "B:forearm": 3,
      "B:delt": 3,
      "B:abs": 4
    },
    "hold": {
      "B:triceps": 9,
      "B:forearm": 3,
      "B:delt": 3,
      "B:abs": 4
    },
    "return": {
      "B:triceps": 7.2,
      "B:forearm": 2.4,
      "B:delt": 2.4,
      "B:abs": 3.2
    }
  }
})
