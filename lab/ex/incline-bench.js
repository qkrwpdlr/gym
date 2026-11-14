// 인클라인 벤치 — 공통 해법으로 관절·기구를 구성하는 운동별 설정.
ExerciseKit.mount({
  "kind": "incline-bench",
  "family": "bench",
  "meta": {
    "title": "인클라인 벤치",
    "kicker": "자세 보기",
    "sub": "천천히 반복 · 반동 없이",
    "summary": [
      [
        "주",
        "윗가슴"
      ],
      [
        "보조",
        "앞어깨·삼두"
      ],
      [
        "버팀",
        "등·복부"
      ]
    ],
    "tips": [
      "벤치는 30~45°로 두고 발을 바닥에 붙여요.",
      "쇄골 아래 윗가슴 쪽으로 내려요.",
      "회복 중에는 통증 2/10 이하에서만 해요."
    ],
    "yt": "incline+bench+exercise+form"
  },
  "phases": [
    {
      "key": "set",
      "dur": 0.8,
      "from": "start",
      "to": "start",
      "cue": "시작 자세를 잡아요",
      "sub": "호흡을 정리하고 몸통을 고정해요"
    },
    {
      "key": "down",
      "dur": 2,
      "from": "start",
      "to": "end",
      "cue": "가슴 쪽으로 천천히 내려요",
      "sub": "가슴 아래쪽 · 날개뼈와 발은 고정해요"
    },
    {
      "key": "hold",
      "dur": 0.7,
      "from": "end",
      "to": "end",
      "cue": "끝 범위에서 잠깐 멈춰요",
      "sub": "가슴 아래쪽 · 날개뼈와 발은 고정해요",
      "count": false
    },
    {
      "key": "up",
      "dur": 2,
      "from": "end",
      "to": "start",
      "cue": "발로 밀며 바를 올려요",
      "sub": "가슴 아래쪽 · 날개뼈와 발은 고정해요"
    }
  ],
  "loads": {
    "set": {
      "B:chest": 5.2,
      "B:triceps": 4.5,
      "B:delt": 5.2,
      "B:lats": 2.0,
      "B:abs": 2.0,
      "B:quad": 1.3
    },
    "down": {
      "B:chest": 8,
      "B:triceps": 7,
      "B:delt": 8,
      "B:lats": 3,
      "B:abs": 3,
      "B:quad": 2
    },
    "hold": {
      "B:chest": 8,
      "B:triceps": 7,
      "B:delt": 8,
      "B:lats": 3,
      "B:abs": 3,
      "B:quad": 2
    },
    "up": {
      "B:chest": 8,
      "B:triceps": 7,
      "B:delt": 8,
      "B:lats": 3,
      "B:abs": 3,
      "B:quad": 2
    }
  }
})
