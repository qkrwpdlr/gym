// 슬라이더 레그컬 — 공통 해법으로 관절·기구를 구성하는 운동별 설정.
ExerciseKit.mount({
  "kind": "slider-leg-curl",
  "family": "slider",
  "meta": {
    "title": "슬라이더 레그컬",
    "kicker": "자세 보기",
    "sub": "천천히 반복 · 반동 없이",
    "summary": [
      [
        "주",
        "햄스트링"
      ],
      [
        "보조",
        "엉덩이·종아리"
      ],
      [
        "버팀",
        "복부"
      ]
    ],
    "tips": [
      "뒤꿈치 아래에 수건을 두고 엉덩이를 들어요.",
      "골반을 유지하며 3초간 펴고 뒤꿈치를 당겨요.",
      "회복 중에는 통증 2/10 이하에서만 해요."
    ],
    "yt": "slider+leg+curl+exercise+form"
  },
  "phases": [
    {
      "key": "set",
      "dur": 0.8,
      "from": "start",
      "to": "start",
      "cue": "시작 자세를 잡아요",
      "sub": "골반을 버티며 무릎을 펴요"
    },
    {
      "key": "move",
      "dur": 3,
      "from": "start",
      "to": "end",
      "cue": "뒤꿈치를 천천히 밀어내요",
      "sub": "골반을 버티며 무릎을 펴요"
    },
    {
      "key": "hold",
      "dur": 1,
      "from": "end",
      "to": "end",
      "cue": "끝에서 1초 멈춰요",
      "sub": "골반을 버티며 무릎을 펴요"
    },
    {
      "key": "return",
      "dur": 2,
      "from": "end",
      "to": "start",
      "cue": "천천히 시작 자세로 돌아와요",
      "sub": "골반을 버티며 무릎을 펴요"
    }
  ],
  "loads": {
    "set": {
      "B:ham": 5.9,
      "B:glute": 3.9,
      "B:calf": 2.0,
      "B:abs": 2.6
    },
    "move": {
      "B:ham": 9,
      "B:glute": 6,
      "B:calf": 3,
      "B:abs": 4
    },
    "hold": {
      "B:ham": 9,
      "B:glute": 6,
      "B:calf": 3,
      "B:abs": 4
    },
    "return": {
      "B:ham": 7.2,
      "B:glute": 4.8,
      "B:calf": 2.4,
      "B:abs": 3.2
    }
  },
  "viewBox": "34 77 120 63",
  "variants": {
    "single": {
      "meta": {
        "title": "슬라이더 · 한 발 내리기",
        "sub": "양발로 올리기 · 한 발로 3초 내리기"
      },
      "sided": true,
      "poses": {
        "start": {
          "u": 0,
          "single": 0
        },
        "raised": {
          "u": 0,
          "single": 1
        },
        "extended": {
          "u": 1,
          "single": 1
        },
        "both": {
          "u": 1,
          "single": 0
        }
      },
      "phases": [
        {
          "key": "lift",
          "dur": 0.8,
          "from": "start",
          "to": "raised",
          "cue": "양발로 올린 뒤 한 발을 들어요",
          "sub": "골반이 기울지 않게 해요"
        },
        {
          "key": "lower",
          "dur": 3,
          "from": "raised",
          "to": "extended",
          "cue": "다친 다리로 천천히 내리기",
          "sub": "반대 발은 띄워요 · 3초간 버텨요"
        },
        {
          "key": "land",
          "dur": 0.8,
          "from": "extended",
          "to": "both",
          "cue": "반대 발을 바닥에 내려요",
          "sub": "돌아올 때는 양발을 사용해요"
        },
        {
          "key": "return",
          "dur": 2,
          "from": "both",
          "to": "start",
          "cue": "양발로 당겨 돌아와요",
          "sub": "엉덩이는 편한 높이로 유지해요"
        }
      ],
      "loads": {
        "lift": {
          "S:ham": 9,
          "S:glute": 6,
          "B:abs": 4
        },
        "lower": {
          "S:ham": 9,
          "S:glute": 6,
          "B:abs": 4
        },
        "land": {
          "S:ham": 9,
          "S:glute": 6,
          "B:abs": 4
        },
        "return": {
          "S:ham": 9,
          "S:glute": 6,
          "B:abs": 4
        }
      }
    }
  }
})
