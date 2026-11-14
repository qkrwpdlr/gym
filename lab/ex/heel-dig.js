// 힐 디그 · 무릎 90° — 공통 해법으로 관절·기구를 구성하는 운동별 설정.
ExerciseKit.mount({
  "kind": "heel-dig",
  "family": "heel",
  "meta": {
    "title": "힐 디그 · 무릎 90°",
    "kicker": "자세 보기",
    "sub": "무릎 90° · 10초 버티기 · 30~50% 힘",
    "summary": [
      [
        "주",
        "햄스트링(등척성)"
      ],
      [
        "보조",
        "종아리"
      ],
      [
        "버팀",
        "복부"
      ]
    ],
    "tips": [
      "누워 골반을 바닥에 두고 뒤꿈치로 눌러요.",
      "30~50% 힘으로 10초, 숨은 계속 쉬어요.",
      "회복 중에는 통증 2/10 이하에서만 해요."
    ],
    "yt": "heel+dig+exercise+form"
  },
  "phases": [
    {
      "key": "hold",
      "dur": 10,
      "from": "start",
      "to": "start",
      "cue": "뒤꿈치로 바닥 누르기",
      "sub": "골반은 바닥에 · 숨을 편하게 쉬어요",
      "count": true
    },
    {
      "key": "rest",
      "dur": 3,
      "from": "start",
      "to": "start",
      "cue": "힘을 풀어요",
      "sub": "시범은 반복돼요 · 실제 휴식은 루틴을 따라요"
    }
  ],
  "loads": {
    "hold": {
      "B:ham": 6,
      "B:calf": 3,
      "B:abs": 2
    },
    "rest": {
      "B:ham": 3.9,
      "B:calf": 2.0,
      "B:abs": 1.3
    }
  },
  "viewBox": "35 83 119 59",
  "poses": {
    "start": {
      "u": 0,
      "angle": 90
    },
    "end": {
      "u": 0,
      "angle": 90
    }
  },
  "variants": {
    "30": {
      "meta": {
        "title": "힐 디그 · 무릎 30°",
        "sub": "무릎 30° · 10초 버티기 · 90°가 편해진 뒤"
      },
      "poses": {
        "start": {
          "u": 0,
          "angle": 30
        },
        "end": {
          "u": 0,
          "angle": 30
        }
      }
    }
  }
})
