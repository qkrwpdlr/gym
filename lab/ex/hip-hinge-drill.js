// 힙힌지 연습 — 공통 해법으로 관절·기구를 구성하는 운동별 설정.
ExerciseKit.mount({
  "kind": "hip-hinge-drill",
  "family": "hinge",
  "meta": {
    "title": "힙힌지 연습",
    "kicker": "자세 보기",
    "sub": "내리기 3초 · 엉덩이 접기",
    "summary": [
      [
        "주",
        "햄스트링·엉덩이"
      ],
      [
        "보조",
        "허벅지 앞"
      ],
      [
        "버팀",
        "허리·복부"
      ]
    ],
    "tips": [
      "벽 앞에 서서 엉덩이로 뒤쪽 벽을 찾아요.",
      "정강이는 거의 세우고 허리 모양을 유지해요.",
      "회복 중에는 통증 2/10 이하에서만 해요."
    ],
    "yt": "hip+hinge+drill+form"
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
      "dur": 3,
      "from": "start",
      "to": "end",
      "cue": "엉덩이를 뒤로 보내며 내려요",
      "sub": "엉덩이로 뒤쪽 벽을 찾아요 · 허리는 중립"
    },
    {
      "key": "hold",
      "dur": 0.7,
      "from": "end",
      "to": "end",
      "cue": "끝 범위에서 잠깐 멈춰요",
      "sub": "엉덩이로 뒤쪽 벽을 찾아요 · 허리는 중립",
      "count": false
    },
    {
      "key": "up",
      "dur": 2,
      "from": "end",
      "to": "start",
      "cue": "발바닥으로 밀며 일어나요",
      "sub": "엉덩이로 뒤쪽 벽을 찾아요 · 허리는 중립"
    }
  ],
  "loads": {
    "set": {
      "B:ham": 2.6,
      "B:glute": 2.6,
      "B:erect": 2.0,
      "B:lats": 2.6,
      "B:forearm": 0.0,
      "B:abs": 3.2
    },
    "down": {
      "B:ham": 4,
      "B:glute": 4,
      "B:erect": 3,
      "B:lats": 4,
      "B:forearm": 0,
      "B:abs": 5
    },
    "hold": {
      "B:ham": 4,
      "B:glute": 4,
      "B:erect": 3,
      "B:lats": 4,
      "B:forearm": 0,
      "B:abs": 5
    },
    "up": {
      "B:ham": 4,
      "B:glute": 4,
      "B:erect": 3,
      "B:lats": 4,
      "B:forearm": 0,
      "B:abs": 5
    }
  }
})
