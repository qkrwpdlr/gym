// EZ 컬 — 공통 해법으로 관절·기구를 구성하는 운동별 설정.
ExerciseKit.mount({
  "kind": "ez-curl",
  "family": "curl",
  "meta": {
    "title": "EZ 컬",
    "kicker": "자세 보기",
    "sub": "천천히 반복 · 반동 없이",
    "summary": [
      [
        "주",
        "이두"
      ],
      [
        "보조",
        "상완근·전완"
      ],
      [
        "버팀",
        "복부"
      ]
    ],
    "tips": [
      "팔꿈치를 몸 옆에 두고 위팔을 고정해요.",
      "허리를 젖혀 바를 튕기지 말고 천천히 내려요.",
      "회복 중에는 통증 2/10 이하에서만 해요."
    ],
    "yt": "ez+curl+exercise+form"
  },
  "phases": [
    {
      "key": "set",
      "dur": 0.8,
      "from": "start",
      "to": "start",
      "cue": "시작 자세를 잡아요",
      "sub": "몸통 반동 없이 들어요"
    },
    {
      "key": "move",
      "dur": 1.2,
      "from": "start",
      "to": "end",
      "cue": "위팔을 고정하고 팔꿈치를 굽혀요",
      "sub": "몸통 반동 없이 들어요"
    },
    {
      "key": "hold",
      "dur": 1,
      "from": "end",
      "to": "end",
      "cue": "끝에서 1초 멈춰요",
      "sub": "몸통 반동 없이 들어요"
    },
    {
      "key": "return",
      "dur": 2,
      "from": "end",
      "to": "start",
      "cue": "천천히 시작 자세로 돌아와요",
      "sub": "몸통 반동 없이 들어요"
    }
  ],
  "loads": {
    "set": {
      "B:biceps": 5.9,
      "B:forearm": 3.9,
      "B:abs": 2.0
    },
    "move": {
      "B:biceps": 9,
      "B:forearm": 6,
      "B:abs": 3
    },
    "hold": {
      "B:biceps": 9,
      "B:forearm": 6,
      "B:abs": 3
    },
    "return": {
      "B:biceps": 7.2,
      "B:forearm": 4.8,
      "B:abs": 2.4
    }
  }
})
