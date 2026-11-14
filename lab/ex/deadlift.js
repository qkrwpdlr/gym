// 데드리프트 — 공통 해법으로 관절·기구를 구성하는 운동별 설정.
ExerciseKit.mount({
  "kind": "deadlift",
  "family": "hinge",
  "meta": {
    "title": "데드리프트",
    "kicker": "자세 보기",
    "sub": "바닥에서 시작 · 몸 가까이 들고 내리기",
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
      "바를 발 중앙 위에 두고 정강이 가까이 붙여요.",
      "바닥을 밀며 일어나고 위에서 허리를 젖히지 않아요.",
      "회복 중에는 통증 2/10 이하에서만 해요."
    ],
    "yt": "deadlift+form"
  },
  "phases": [
    {
      "key": "set",
      "dur": 1,
      "from": "end",
      "to": "end",
      "cue": "바닥에서 긴장을 만들어요",
      "sub": "원판이 바닥에 닿은 채 시작해요"
    },
    {
      "key": "up",
      "dur": 1.5,
      "from": "end",
      "to": "start",
      "cue": "바닥에서 바를 들어요",
      "sub": "바를 몸 가까이 · 엉덩이와 어깨가 함께 올라와요"
    },
    {
      "key": "hold",
      "dur": 0.6,
      "from": "start",
      "to": "start",
      "cue": "곧게 서요",
      "sub": "허리를 뒤로 젖히지 않아요"
    },
    {
      "key": "down",
      "dur": 2,
      "from": "start",
      "to": "end",
      "cue": "엉덩이를 접으며 바닥에 내려요",
      "sub": "바를 몸 가까이 · 엉덩이부터 접어요"
    }
  ],
  "loads": {
    "set": {
      "B:ham": 5.2,
      "B:glute": 5.2,
      "B:erect": 3.9,
      "B:lats": 2.6,
      "B:forearm": 3.2,
      "B:abs": 3.2
    },
    "up": {
      "B:ham": 8,
      "B:glute": 8,
      "B:erect": 6,
      "B:lats": 4,
      "B:forearm": 5,
      "B:abs": 5
    },
    "hold": {
      "B:ham": 8,
      "B:glute": 8,
      "B:erect": 6,
      "B:lats": 4,
      "B:forearm": 5,
      "B:abs": 5
    },
    "down": {
      "B:ham": 8,
      "B:glute": 8,
      "B:erect": 6,
      "B:lats": 4,
      "B:forearm": 5,
      "B:abs": 5
    }
  }
})
