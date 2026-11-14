// 한 발 RDL — 공통 해법으로 관절·기구를 구성하는 운동별 설정.
ExerciseKit.mount({
  "kind": "single-leg-rdl",
  "family": "hinge",
  "meta": {
    "title": "한 발 RDL",
    "kicker": "자세 보기",
    "sub": "내리기 3초 · 엉덩이 접기",
    "summary": [
      [
        "주",
        "햄스트링·엉덩이"
      ],
      [
        "보조",
        "등·전완"
      ],
      [
        "버팀",
        "허리·복부"
      ]
    ],
    "tips": [
      "선 다리 무릎을 살짝 굽히고 골반을 수평으로 둬요.",
      "뒷다리를 뻗으며 몸통과 함께 움직여요.",
      "회복 중에는 통증 2/10 이하에서만 해요."
    ],
    "yt": "single+leg+rdl+form"
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
      "sub": "바는 다리 가까이 · 허리 모양을 유지해요"
    },
    {
      "key": "hold",
      "dur": 0.7,
      "from": "end",
      "to": "end",
      "cue": "끝 범위에서 잠깐 멈춰요",
      "sub": "바는 다리 가까이 · 허리 모양을 유지해요",
      "count": false
    },
    {
      "key": "up",
      "dur": 2,
      "from": "end",
      "to": "start",
      "cue": "발바닥으로 밀며 일어나요",
      "sub": "바는 다리 가까이 · 허리 모양을 유지해요"
    }
  ],
  "loads": {
    "set": {
      "S:ham": 5.2,
      "S:glute": 5.2,
      "B:erect": 3.9,
      "B:lats": 2.6,
      "B:forearm": 3.2,
      "B:abs": 3.2
    },
    "down": {
      "S:ham": 8,
      "S:glute": 8,
      "B:erect": 6,
      "B:lats": 4,
      "B:forearm": 5,
      "B:abs": 5
    },
    "hold": {
      "S:ham": 8,
      "S:glute": 8,
      "B:erect": 6,
      "B:lats": 4,
      "B:forearm": 5,
      "B:abs": 5
    },
    "up": {
      "S:ham": 8,
      "S:glute": 8,
      "B:erect": 6,
      "B:lats": 4,
      "B:forearm": 5,
      "B:abs": 5
    }
  },
  "viewBox": "32 8 136 134",
  "sided": true
})
