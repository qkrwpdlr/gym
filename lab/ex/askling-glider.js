// 아스클링 글라이더 — 공통 해법으로 관절·기구를 구성하는 운동별 설정.
ExerciseKit.mount({
  "kind": "askling-glider",
  "family": "glider",
  "meta": {
    "title": "아스클링 글라이더",
    "kicker": "회복 · L-프로토콜",
    "sub": "뒤로 미끄러지기 3초 · 팔로 복귀 · 통증 전 멈춤",
    "summary": [
      [
        "주",
        "다친 다리 햄스트링"
      ],
      [
        "보조",
        "엉덩이·중둔근"
      ],
      [
        "버팀",
        "팔·복부"
      ]
    ],
    "tips": [
      "다친 다리 뒤꿈치에 체중을 두고 반대 발을 뒤로 밀어요.",
      "통증 전에 멈추고 두 팔의 도움으로 돌아와요.",
      "회복 중에는 통증 2/10 이하에서만 해요."
    ],
    "yt": "Askling+glider+L+protocol"
  },
  "phases": [
    {
      "key": "set",
      "dur": 0.8,
      "from": "start",
      "to": "start",
      "cue": "시작 자세를 잡아요",
      "sub": "뒤로 미끄러지기 3초 · 팔로 복귀 · 통증 전 멈춤"
    },
    {
      "key": "down",
      "dur": 3,
      "from": "start",
      "to": "end",
      "cue": "반대 발을 뒤로 미끄러뜨려요",
      "sub": "다친 다리 뒤꿈치에 체중 · 통증 전에 멈춰요"
    },
    {
      "key": "hold",
      "dur": 0.7,
      "from": "end",
      "to": "end",
      "cue": "끝 범위에서 잠깐 멈춰요",
      "sub": "다친 다리 뒤꿈치에 체중 · 통증 전에 멈춰요",
      "count": false
    },
    {
      "key": "up",
      "dur": 2,
      "from": "end",
      "to": "start",
      "cue": "두 팔의 도움으로 돌아와요",
      "sub": "다친 다리 뒤꿈치에 체중 · 통증 전에 멈춰요"
    }
  ],
  "loads": {
    "set": {
      "S:ham": 5.2,
      "S:glute": 3.9,
      "S:gmed": 2.6,
      "B:biceps": 2.6,
      "B:abs": 2.6,
      "B:erect": 2.6
    },
    "down": {
      "S:ham": 8,
      "S:glute": 6,
      "S:gmed": 4,
      "B:biceps": 4,
      "B:abs": 4,
      "B:erect": 4
    },
    "hold": {
      "S:ham": 8,
      "S:glute": 6,
      "S:gmed": 4,
      "B:biceps": 4,
      "B:abs": 4,
      "B:erect": 4
    },
    "up": {
      "S:ham": 8,
      "S:glute": 6,
      "S:gmed": 4,
      "B:biceps": 4,
      "B:abs": 4,
      "B:erect": 4
    }
  },
  "sided": true
})
