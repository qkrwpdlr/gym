// 워킹 런지 — 공통 해법으로 관절·기구를 구성하는 운동별 설정.
ExerciseKit.mount({
  "kind": "walking-lunge",
  "family": "split",
  "meta": {
    "title": "워킹 런지",
    "kicker": "자세 보기",
    "sub": "한 걸음 내딛기 · 내려가기 2초 · 앞발로 밀기",
    "summary": [
      [
        "주",
        "허벅지 앞·엉덩이"
      ],
      [
        "보조",
        "햄스트링·내전근"
      ],
      [
        "버팀",
        "중둔근·복부"
      ]
    ],
    "tips": [
      "앞으로 한 발 내디뎌 뒷무릎을 바닥 가까이 내려요.",
      "앞발로 밀고 뒷발을 앞으로 가져와 다음 걸음을 이어요."
    ],
    "yt": "walking+lunge+exercise+form"
  },
  "phases": [
    {
      "key": "downA",
      "dur": 2,
      "from": "start",
      "to": "downA",
      "cue": "앞다리로 버티며 내려가요",
      "sub": "뒷무릎은 바닥 직전까지"
    },
    {
      "key": "upA",
      "dur": 1,
      "from": "downA",
      "to": "start",
      "cue": "앞발로 밀어 일어나요",
      "sub": "골반을 수평으로 유지해요"
    },
    {
      "key": "stepA",
      "dur": 1.5,
      "from": "start",
      "to": "stepA",
      "cue": "뒷발을 앞으로 내디뎌요",
      "sub": "화면은 몸통을 따라가요 · 발을 번갈아 디뎌요"
    },
    {
      "key": "downB",
      "dur": 2,
      "from": "stepA",
      "to": "downB",
      "cue": "반대 다리로 내려가요",
      "sub": "무릎은 발끝 방향으로"
    },
    {
      "key": "upB",
      "dur": 1,
      "from": "downB",
      "to": "returnB",
      "cue": "앞발로 밀어 일어나요",
      "sub": "허리를 젖히지 않아요"
    },
    {
      "key": "stepB",
      "dur": 1.5,
      "from": "returnB",
      "to": "finish",
      "cue": "다음 걸음을 이어요",
      "sub": "화면은 몸통을 따라가요 · 발을 번갈아 디뎌요"
    }
  ],
  "loads": {
    "downA": {
      "B:quad": 9,
      "B:glute": 8,
      "B:gmed": 6,
      "B:abs": 5,
      "B:ham": 4
    },
    "upA": {
      "B:quad": 9,
      "B:glute": 8,
      "B:gmed": 6,
      "B:abs": 5,
      "B:ham": 4
    },
    "stepA": {
      "B:quad": 9,
      "B:glute": 8,
      "B:gmed": 6,
      "B:abs": 5,
      "B:ham": 4
    },
    "downB": {
      "B:quad": 9,
      "B:glute": 8,
      "B:gmed": 6,
      "B:abs": 5,
      "B:ham": 4
    },
    "upB": {
      "B:quad": 9,
      "B:glute": 8,
      "B:gmed": 6,
      "B:abs": 5,
      "B:ham": 4
    },
    "stepB": {
      "B:quad": 9,
      "B:glute": 8,
      "B:gmed": 6,
      "B:abs": 5,
      "B:ham": 4
    }
  },
  "poses": {
    "start": {
      "u": 0,
      "swap": 0,
      "back": 0
    },
    "downA": {
      "u": 1,
      "swap": 0,
      "back": 0
    },
    "stepA": {
      "u": 0,
      "swap": 1,
      "back": 0
    },
    "downB": {
      "u": 1,
      "swap": 1,
      "back": 1
    },
    "returnB": {
      "u": 0,
      "swap": 1,
      "back": 1
    },
    "finish": {
      "u": 0,
      "swap": 0,
      "back": 1
    }
  }
})
