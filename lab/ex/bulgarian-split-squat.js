// 불가리안 스플릿 스쿼트 — 공통 해법으로 관절·기구를 구성하는 운동별 설정.
ExerciseKit.mount({
  "kind": "bulgarian-split-squat",
  "family": "split",
  "meta": {
    "title": "불가리안 스플릿 스쿼트",
    "kicker": "자세 보기",
    "sub": "천천히 반복 · 반동 없이",
    "summary": [
      [
        "주",
        "앞다리 허벅지·엉덩이"
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
      "뒷발은 벤치에 가볍게 얹고 앞발로 지지해요.",
      "앞 무릎이 발끝 방향으로 움직이게 내려가요."
    ],
    "yt": "bulgarian+split+squat+exercise+form"
  },
  "phases": [
    {
      "key": "set",
      "dur": 0.8,
      "from": "start",
      "to": "start",
      "cue": "시작 자세를 잡아요",
      "sub": "뒷무릎은 바닥에 닿지 않아요"
    },
    {
      "key": "move",
      "dur": 2,
      "from": "start",
      "to": "end",
      "cue": "앞다리로 버티며 내려가요",
      "sub": "뒷무릎은 바닥에 닿지 않아요"
    },
    {
      "key": "hold",
      "dur": 1,
      "from": "end",
      "to": "end",
      "cue": "끝에서 1초 멈춰요",
      "sub": "뒷무릎은 바닥에 닿지 않아요"
    },
    {
      "key": "return",
      "dur": 2,
      "from": "end",
      "to": "start",
      "cue": "천천히 시작 자세로 돌아와요",
      "sub": "뒷무릎은 바닥에 닿지 않아요"
    }
  ],
  "loads": {
    "set": {
      "B:quad": 5.9,
      "B:glute": 5.2,
      "B:erect": 2.0,
      "B:abs": 3.9,
      "B:ham": 2.6,
      "B:calf": 2.0,
      "B:gmed": 3.9
    },
    "move": {
      "B:quad": 9,
      "B:glute": 8,
      "B:erect": 3,
      "B:abs": 6,
      "B:ham": 4,
      "B:calf": 3,
      "B:gmed": 6
    },
    "hold": {
      "B:quad": 9,
      "B:glute": 8,
      "B:erect": 3,
      "B:abs": 6,
      "B:ham": 4,
      "B:calf": 3,
      "B:gmed": 6
    },
    "return": {
      "B:quad": 7.2,
      "B:glute": 6.4,
      "B:erect": 2.4,
      "B:abs": 4.8,
      "B:ham": 3.2,
      "B:calf": 2.4,
      "B:gmed": 4.8
    }
  }
})
