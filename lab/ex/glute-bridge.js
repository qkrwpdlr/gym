// 브릿지 — 공통 해법으로 관절·기구를 구성하는 운동별 설정.
ExerciseKit.mount({
  "kind": "glute-bridge",
  "family": "bridge",
  "meta": {
    "title": "브릿지",
    "kicker": "자세 보기",
    "sub": "천천히 반복 · 반동 없이",
    "summary": [
      [
        "주",
        "엉덩이"
      ],
      [
        "보조",
        "햄스트링"
      ],
      [
        "버팀",
        "복부"
      ]
    ],
    "tips": [
      "뒤꿈치로 밀며 어깨·골반·무릎을 일직선으로 만들어요.",
      "허리를 젖히지 말고 당기면 높이를 낮춰요.",
      "회복 중에는 통증 2/10 이하에서만 해요."
    ],
    "yt": "glute+bridge+exercise+form"
  },
  "phases": [
    {
      "key": "set",
      "dur": 0.8,
      "from": "start",
      "to": "start",
      "cue": "시작 자세를 잡아요",
      "sub": "갈비뼈를 내리고 허리를 젖히지 않아요"
    },
    {
      "key": "move",
      "dur": 1.2,
      "from": "start",
      "to": "end",
      "cue": "뒤꿈치로 밀어 엉덩이를 들어요",
      "sub": "갈비뼈를 내리고 허리를 젖히지 않아요"
    },
    {
      "key": "hold",
      "dur": 1,
      "from": "end",
      "to": "end",
      "cue": "끝에서 1초 멈춰요",
      "sub": "갈비뼈를 내리고 허리를 젖히지 않아요"
    },
    {
      "key": "return",
      "dur": 2,
      "from": "end",
      "to": "start",
      "cue": "천천히 시작 자세로 돌아와요",
      "sub": "갈비뼈를 내리고 허리를 젖히지 않아요"
    }
  ],
  "loads": {
    "set": {
      "B:glute": 5.2,
      "B:ham": 3.2,
      "B:abs": 2.6
    },
    "move": {
      "B:glute": 8,
      "B:ham": 5,
      "B:abs": 4
    },
    "hold": {
      "B:glute": 8,
      "B:ham": 5,
      "B:abs": 4
    },
    "return": {
      "B:glute": 6.4,
      "B:ham": 4.0,
      "B:abs": 3.2
    }
  },
  "viewBox": "34 80 116 60",
  "variants": {
    "hold": {
      "meta": {
        "title": "브릿지 홀드",
        "sub": "양발 · 30초 버티기 · 높이는 편한 만큼"
      },
      "phases": [
        {
          "key": "up",
          "dur": 2,
          "from": "start",
          "to": "end",
          "cue": "엉덩이를 들어요",
          "sub": "허리를 젖히지 않아요"
        },
        {
          "key": "hold",
          "dur": 30,
          "from": "end",
          "to": "end",
          "cue": "높이를 유지해요",
          "sub": "편하게 호흡해요 · 실제 시간은 루틴을 따라요",
          "count": true
        },
        {
          "key": "down",
          "dur": 2,
          "from": "end",
          "to": "start",
          "cue": "천천히 내려요",
          "sub": "어깨와 발은 그대로 둬요"
        }
      ]
    }
  }
})
