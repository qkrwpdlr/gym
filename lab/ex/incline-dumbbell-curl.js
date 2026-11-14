// 인클라인 덤벨 컬 — 공통 해법으로 관절·기구를 구성하는 운동별 설정.
ExerciseKit.mount({
  "kind": "incline-dumbbell-curl",
  "family": "curl",
  "meta": {
    "title": "인클라인 덤벨 컬",
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
        "등·복부"
      ]
    ],
    "tips": [
      "등을 벤치에 대고 팔을 몸통 뒤에 자연스럽게 둬요.",
      "위팔을 고정하고 어깨 앞쪽이 당기면 덜 내려요."
    ],
    "yt": "incline+dumbbell+curl+exercise+form"
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
      "B:forearm": 3.2,
      "B:abs": 1.3
    },
    "move": {
      "B:biceps": 9,
      "B:forearm": 5,
      "B:abs": 2
    },
    "hold": {
      "B:biceps": 9,
      "B:forearm": 5,
      "B:abs": 2
    },
    "return": {
      "B:biceps": 7.2,
      "B:forearm": 4.0,
      "B:abs": 1.6
    }
  }
})
