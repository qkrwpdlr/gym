// 클로즈그립 벤치 — 공통 해법으로 관절·기구를 구성하는 운동별 설정.
ExerciseKit.mount({
  "kind": "close-grip-bench",
  "family": "bench",
  "meta": {
    "title": "클로즈그립 벤치",
    "kicker": "자세 보기",
    "sub": "천천히 반복 · 반동 없이",
    "summary": [
      [
        "주",
        "삼두·가슴"
      ],
      [
        "보조",
        "앞어깨"
      ],
      [
        "버팀",
        "등·복부"
      ]
    ],
    "tips": [
      "어깨너비 정도로 잡고 손목 아래에 팔꿈치를 둬요.",
      "가슴 아래쪽에 닿고 팔꿈치를 과하게 벌리지 않아요.",
      "회복 중에는 통증 2/10 이하에서만 해요."
    ],
    "yt": "close+grip+bench+exercise+form"
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
      "B:chest": 4.5,
      "B:triceps": 5.9,
      "B:delt": 3.9,
      "B:lats": 2.0,
      "B:abs": 2.0,
      "B:quad": 1.3
    },
    "down": {
      "B:chest": 7,
      "B:triceps": 9,
      "B:delt": 6,
      "B:lats": 3,
      "B:abs": 3,
      "B:quad": 2
    },
    "hold": {
      "B:chest": 7,
      "B:triceps": 9,
      "B:delt": 6,
      "B:lats": 3,
      "B:abs": 3,
      "B:quad": 2
    },
    "up": {
      "B:chest": 7,
      "B:triceps": 9,
      "B:delt": 6,
      "B:lats": 3,
      "B:abs": 3,
      "B:quad": 2
    }
  }
})
