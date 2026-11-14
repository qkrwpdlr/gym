// OHP — 공통 해법으로 관절·기구를 구성하는 운동별 설정.
ExerciseKit.mount({
  "kind": "ohp",
  "family": "ohp",
  "meta": {
    "title": "OHP",
    "kicker": "자세 보기",
    "sub": "천천히 반복 · 반동 없이",
    "summary": [
      [
        "주",
        "앞·옆어깨"
      ],
      [
        "보조",
        "삼두"
      ],
      [
        "버팀",
        "복부·엉덩이"
      ]
    ],
    "tips": [
      "배와 엉덩이에 힘을 주고 갈비뼈를 들지 않아요.",
      "바가 얼굴을 지나면 머리를 바 아래로 넣어요.",
      "회복 중에는 통증 2/10 이하에서만 해요."
    ],
    "yt": "ohp+exercise+form"
  },
  "phases": [
    {
      "key": "set",
      "dur": 0.8,
      "from": "start",
      "to": "start",
      "cue": "시작 자세를 잡아요",
      "sub": "갈비뼈가 들리지 않게 배에 힘을 줘요"
    },
    {
      "key": "move",
      "dur": 1.2,
      "from": "start",
      "to": "end",
      "cue": "바를 머리 위로 밀어요",
      "sub": "갈비뼈가 들리지 않게 배에 힘을 줘요"
    },
    {
      "key": "hold",
      "dur": 1,
      "from": "end",
      "to": "end",
      "cue": "끝에서 1초 멈춰요",
      "sub": "갈비뼈가 들리지 않게 배에 힘을 줘요"
    },
    {
      "key": "return",
      "dur": 2,
      "from": "end",
      "to": "start",
      "cue": "천천히 시작 자세로 돌아와요",
      "sub": "갈비뼈가 들리지 않게 배에 힘을 줘요"
    }
  ],
  "loads": {
    "set": {
      "B:delt": 5.9,
      "B:sdelt": 4.5,
      "B:triceps": 4.5,
      "B:traps": 3.2,
      "B:abs": 3.2,
      "B:glute": 2.0
    },
    "move": {
      "B:delt": 9,
      "B:sdelt": 7,
      "B:triceps": 7,
      "B:traps": 5,
      "B:abs": 5,
      "B:glute": 3
    },
    "hold": {
      "B:delt": 9,
      "B:sdelt": 7,
      "B:triceps": 7,
      "B:traps": 5,
      "B:abs": 5,
      "B:glute": 3
    },
    "return": {
      "B:delt": 7.2,
      "B:sdelt": 5.6,
      "B:triceps": 5.6,
      "B:traps": 4.0,
      "B:abs": 4.0,
      "B:glute": 2.4
    }
  }
})
