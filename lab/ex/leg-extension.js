// 레그 익스텐션 — 공통 해법으로 관절·기구를 구성하는 운동별 설정.
ExerciseKit.mount({
  "kind": "leg-extension",
  "family": "seatedLeg",
  "meta": {
    "title": "레그 익스텐션",
    "kicker": "자세 보기",
    "sub": "천천히 반복 · 반동 없이",
    "summary": [
      [
        "주",
        "허벅지 앞"
      ],
      [
        "보조",
        "없음"
      ],
      [
        "버팀",
        "복부·골반"
      ]
    ],
    "tips": [
      "무릎 축을 머신 축에 맞추고 정강이 아래에 패드를 둬요.",
      "반동 없이 무릎을 펴고 엉덩이는 좌석에 붙여요.",
      "회복 중에는 통증 2/10 이하에서만 해요."
    ],
    "yt": "leg+extension+exercise+form"
  },
  "phases": [
    {
      "key": "set",
      "dur": 0.8,
      "from": "start",
      "to": "start",
      "cue": "시작 자세를 잡아요",
      "sub": "허벅지와 골반은 좌석에 고정해요"
    },
    {
      "key": "move",
      "dur": 1.2,
      "from": "start",
      "to": "end",
      "cue": "무릎을 펴요",
      "sub": "허벅지와 골반은 좌석에 고정해요"
    },
    {
      "key": "hold",
      "dur": 1,
      "from": "end",
      "to": "end",
      "cue": "끝에서 1초 멈춰요",
      "sub": "허벅지와 골반은 좌석에 고정해요"
    },
    {
      "key": "return",
      "dur": 2,
      "from": "end",
      "to": "start",
      "cue": "천천히 시작 자세로 돌아와요",
      "sub": "허벅지와 골반은 좌석에 고정해요"
    }
  ],
  "loads": {
    "set": {
      "B:quad": 5.9,
      "B:abs": 1.3
    },
    "move": {
      "B:quad": 9,
      "B:abs": 2
    },
    "hold": {
      "B:quad": 9,
      "B:abs": 2
    },
    "return": {
      "B:quad": 7.2,
      "B:abs": 1.6
    }
  },
  "viewBox": "50 50 110 87"
})
