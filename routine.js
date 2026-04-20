// 5일 루틴 데이터
// 구조: days[dayId] = { title, day, color, sections: [{ title, meta, rest, sets: [{ name, weight, unit, reps }] }] }
window.ROUTINE = {
  day1: {
    title: 'SQUAT HEAVY',
    day: 'MON',
    tag: 'LOWER · 스쿼트',
    color: '#ff2d2d',
    sections: [
      {
        title: '워밍업',
        meta: '폼 확인 · 힘쓰지 말기',
        rest: 45,
        sets: [
          { label: 'W1', name: '스쿼트', weight: 'BAR', unit: 'kg', reps: '10' },
          { label: 'W2', name: '스쿼트', weight: '60', unit: 'kg', reps: '5' },
          { label: 'W3', name: '스쿼트', weight: '100', unit: 'kg', reps: '3' },
          { label: 'W4', name: '스쿼트', weight: '130', unit: 'kg', reps: '2' },
          { label: 'W5', name: '스쿼트', weight: '150', unit: 'kg', reps: '1' },
        ]
      },
      {
        title: '스쿼트 메인',
        meta: 'RPE 7–8 · 실패 금지',
        rest: 210,
        sets: [
          { label: 'M1', name: '스쿼트', weight: '170', unit: 'kg', reps: '5' },
          { label: 'M2', name: '스쿼트', weight: '170', unit: 'kg', reps: '5' },
          { label: 'M3', name: '스쿼트', weight: '170', unit: 'kg', reps: '5' },
          { label: 'M4', name: '스쿼트', weight: '180~185', unit: 'kg', reps: '3' },
          { label: 'M5', name: '스쿼트', weight: '180~185', unit: 'kg', reps: '3' },
        ]
      },
      {
        title: '백오프',
        meta: '가볍게 마무리',
        rest: 150,
        sets: [
          { label: 'B1', name: '스쿼트 백오프', weight: '150', unit: 'kg', reps: '5' },
          { label: 'B2', name: '스쿼트 백오프', weight: '150', unit: 'kg', reps: '5' },
          { label: 'B3', name: '스쿼트 백오프', weight: '150', unit: 'kg', reps: '5' },
        ]
      },
      {
        title: '레그프레스',
        meta: '',
        rest: 90,
        sets: [
          { label: 'L1', name: '레그프레스', weight: '180', unit: 'kg', reps: '10' },
          { label: 'L2', name: '레그프레스', weight: '180', unit: 'kg', reps: '10' },
          { label: 'L3', name: '레그프레스', weight: '180', unit: 'kg', reps: '10' },
        ]
      },
      {
        title: '레그컬',
        meta: '',
        rest: 90,
        sets: [
          { label: 'C1', name: '레그컬', weight: '45', unit: 'kg', reps: '12' },
          { label: 'C2', name: '레그컬', weight: '45', unit: 'kg', reps: '12' },
          { label: 'C3', name: '레그컬', weight: '45', unit: 'kg', reps: '12' },
        ]
      },
      {
        title: '코어',
        meta: '',
        rest: 45,
        sets: [
          { label: 'CR1', name: '케이블 크런치', weight: '', unit: '', reps: '12–15' },
          { label: 'CR2', name: '케이블 크런치', weight: '', unit: '', reps: '12–15' },
          { label: 'CR3', name: '케이블 크런치', weight: '', unit: '', reps: '12–15' },
          { label: 'PL1', name: '플랭크', weight: '', unit: '', reps: '30–45초' },
          { label: 'PL2', name: '플랭크', weight: '', unit: '', reps: '30–45초' },
          { label: 'PL3', name: '플랭크', weight: '', unit: '', reps: '30–45초' },
        ]
      },
      {
        title: '유산소',
        meta: '숨은 차지만 대화 가능',
        rest: 0,
        sets: [
          { label: 'CARDIO', name: '천국의 계단', weight: '', unit: '', reps: '10–12분' },
        ]
      }
    ]
  },

  day2: {
    title: 'BENCH HEAVY',
    day: 'TUE',
    tag: 'UPPER · 벤치',
    color: '#3da5ff',
    sections: [
      {
        title: '워밍업',
        meta: '폼 확인',
        rest: 45,
        sets: [
          { label: 'W1', name: '벤치', weight: 'BAR', unit: 'kg', reps: '10' },
          { label: 'W2', name: '벤치', weight: '40', unit: 'kg', reps: '5' },
          { label: 'W3', name: '벤치', weight: '60', unit: 'kg', reps: '3' },
          { label: 'W4', name: '벤치', weight: '80', unit: 'kg', reps: '2' },
          { label: 'W5', name: '벤치', weight: '95', unit: 'kg', reps: '1' },
        ]
      },
      {
        title: '벤치 메인',
        meta: 'RPE 7–8 · 실패 금지',
        rest: 210,
        sets: [
          { label: 'M1', name: '벤치프레스', weight: '105', unit: 'kg', reps: '5' },
          { label: 'M2', name: '벤치프레스', weight: '105', unit: 'kg', reps: '5' },
          { label: 'M3', name: '벤치프레스', weight: '105', unit: 'kg', reps: '5' },
          { label: 'M4', name: '벤치프레스', weight: '115', unit: 'kg', reps: '3' },
          { label: 'M5', name: '벤치프레스', weight: '115', unit: 'kg', reps: '3' },
        ]
      },
      {
        title: '백오프',
        meta: '',
        rest: 150,
        sets: [
          { label: 'B1', name: '벤치 백오프', weight: '95', unit: 'kg', reps: '5' },
          { label: 'B2', name: '벤치 백오프', weight: '95', unit: 'kg', reps: '5' },
          { label: 'B3', name: '벤치 백오프', weight: '95', unit: 'kg', reps: '5' },
        ]
      },
      {
        title: '클로즈그립',
        meta: '',
        rest: 150,
        sets: [
          { label: 'CG1', name: '클로즈그립 벤치', weight: '85', unit: 'kg', reps: '6' },
          { label: 'CG2', name: '클로즈그립 벤치', weight: '85', unit: 'kg', reps: '6' },
          { label: 'CG3', name: '클로즈그립 벤치', weight: '85', unit: 'kg', reps: '6' },
        ]
      },
      {
        title: '딥스',
        meta: 'AMRAP',
        rest: 90,
        sets: [
          { label: 'D1', name: '딥스', weight: 'BW', unit: '', reps: 'AMRAP' },
          { label: 'D2', name: '딥스', weight: 'BW', unit: '', reps: 'AMRAP' },
        ]
      },
      {
        title: '랫풀다운',
        meta: '',
        rest: 90,
        sets: [
          { label: 'LP1', name: '랫풀다운', weight: '80', unit: 'kg', reps: '10' },
          { label: 'LP2', name: '랫풀다운', weight: '80', unit: 'kg', reps: '10' },
          { label: 'LP3', name: '랫풀다운', weight: '80', unit: 'kg', reps: '10' },
        ]
      },
      {
        title: '레터럴',
        meta: '',
        rest: 60,
        sets: [
          { label: 'LT1', name: '레터럴 레이즈', weight: '12', unit: 'kg', reps: '15' },
          { label: 'LT2', name: '레터럴 레이즈', weight: '12', unit: 'kg', reps: '15' },
          { label: 'LT3', name: '레터럴 레이즈', weight: '12', unit: 'kg', reps: '15' },
        ]
      },
      {
        title: '유산소',
        meta: '',
        rest: 0,
        sets: [
          { label: 'CARDIO', name: '천국의 계단', weight: '', unit: '', reps: '10분' },
        ]
      }
    ]
  },

  day3: {
    title: 'RECOVERY',
    day: 'WED',
    tag: 'ACTIVE REST · 회복',
    color: '#00ff88',
    sections: [
      {
        title: '레터럴',
        meta: '가볍게',
        rest: 60,
        sets: [
          { label: 'LT1', name: '레터럴 레이즈', weight: '', unit: '', reps: '15' },
          { label: 'LT2', name: '레터럴 레이즈', weight: '', unit: '', reps: '15' },
          { label: 'LT3', name: '레터럴 레이즈', weight: '', unit: '', reps: '15' },
        ]
      },
      {
        title: '리어델트',
        meta: '',
        rest: 60,
        sets: [
          { label: 'RD1', name: '리어델트 플라이', weight: '', unit: '', reps: '15' },
          { label: 'RD2', name: '리어델트 플라이', weight: '', unit: '', reps: '15' },
          { label: 'RD3', name: '리어델트 플라이', weight: '', unit: '', reps: '15' },
        ]
      },
      {
        title: 'Face Pull',
        meta: '',
        rest: 60,
        sets: [
          { label: 'FP1', name: 'Face Pull', weight: '', unit: '', reps: '15' },
          { label: 'FP2', name: 'Face Pull', weight: '', unit: '', reps: '15' },
          { label: 'FP3', name: 'Face Pull', weight: '', unit: '', reps: '15' },
        ]
      },
      {
        title: '유산소',
        meta: '길게 천천히',
        rest: 0,
        sets: [
          { label: 'CARDIO', name: '천국의 계단', weight: '', unit: '', reps: '20–30분' },
        ]
      }
    ]
  },

  day4: {
    title: 'DEADLIFT',
    day: 'THU',
    tag: 'POSTERIOR · 데드',
    color: '#ffdd00',
    sections: [
      {
        title: '워밍업',
        meta: '',
        rest: 90,
        sets: [
          { label: 'W1', name: '데드리프트', weight: '60', unit: 'kg', reps: '5' },
          { label: 'W2', name: '데드리프트', weight: '100', unit: 'kg', reps: '3' },
          { label: 'W3', name: '데드리프트', weight: '140', unit: 'kg', reps: '2' },
          { label: 'W4', name: '데드리프트', weight: '180', unit: 'kg', reps: '1' },
        ]
      },
      {
        title: '데드 메인',
        meta: 'RPE 7–8 · 절대 실패 X',
        rest: 210,
        sets: [
          { label: 'M1', name: '데드리프트', weight: '215~220', unit: 'kg', reps: '1' },
          { label: 'M2', name: '데드리프트', weight: '185', unit: 'kg', reps: '3' },
          { label: 'M3', name: '데드리프트', weight: '185', unit: 'kg', reps: '3' },
          { label: 'M4', name: '데드리프트', weight: '185', unit: 'kg', reps: '3' },
        ]
      },
      {
        title: 'RDL',
        meta: '',
        rest: 150,
        sets: [
          { label: 'RDL1', name: '루마니안 데드', weight: '120', unit: 'kg', reps: '8' },
          { label: 'RDL2', name: '루마니안 데드', weight: '120', unit: 'kg', reps: '8' },
        ]
      },
      {
        title: '백익스텐션',
        meta: '',
        rest: 90,
        sets: [
          { label: 'BX1', name: '백익스텐션', weight: '+10', unit: 'kg', reps: '12' },
          { label: 'BX2', name: '백익스텐션', weight: '+10', unit: 'kg', reps: '12' },
          { label: 'BX3', name: '백익스텐션', weight: '+10', unit: 'kg', reps: '12' },
        ]
      },
      {
        title: '유산소',
        meta: '옵션',
        rest: 0,
        sets: [
          { label: 'CARDIO', name: '천국의 계단', weight: '', unit: '', reps: '5분 (옵션)' },
        ]
      }
    ]
  },

  day5: {
    title: 'UPPER + BACK',
    day: 'FRI',
    tag: 'VOLUME · 상체+등',
    color: '#c77dff',
    sections: [
      {
        title: '펜들레이 로우',
        meta: '',
        rest: 150,
        sets: [
          { label: 'P1', name: '펜들레이 로우', weight: '100', unit: 'kg', reps: '5' },
          { label: 'P2', name: '펜들레이 로우', weight: '110', unit: 'kg', reps: '5' },
          { label: 'P3', name: '펜들레이 로우', weight: '115', unit: 'kg', reps: '5' },
          { label: 'P4', name: '펜들레이 로우', weight: '120', unit: 'kg', reps: '5' },
          { label: 'P5', name: '펜들레이 로우', weight: '120', unit: 'kg', reps: '5' },
        ]
      },
      {
        title: '벤치',
        meta: '볼륨',
        rest: 150,
        sets: [
          { label: 'B1', name: '벤치프레스', weight: '90', unit: 'kg', reps: '8' },
          { label: 'B2', name: '벤치프레스', weight: '90', unit: 'kg', reps: '8' },
          { label: 'B3', name: '벤치프레스', weight: '90', unit: 'kg', reps: '8' },
        ]
      },
      {
        title: 'OHP',
        meta: '',
        rest: 150,
        sets: [
          { label: 'O1', name: 'OHP', weight: '65', unit: 'kg', reps: '5' },
          { label: 'O2', name: 'OHP', weight: '65', unit: 'kg', reps: '5' },
          { label: 'O3', name: 'OHP', weight: '65', unit: 'kg', reps: '5' },
        ]
      },
      {
        title: '풀업',
        meta: '',
        rest: 90,
        sets: [
          { label: 'PU1', name: '풀업', weight: 'BW', unit: '', reps: 'MAX' },
          { label: 'PU2', name: '풀업', weight: 'BW', unit: '', reps: 'MAX' },
          { label: 'PU3', name: '풀업', weight: 'BW', unit: '', reps: 'MAX' },
          { label: 'PU4', name: '풀업', weight: 'BW', unit: '', reps: 'MAX' },
        ]
      },
      {
        title: '랫풀다운',
        meta: '',
        rest: 90,
        sets: [
          { label: 'LP1', name: '랫풀다운', weight: '80~100', unit: 'kg', reps: '10' },
          { label: 'LP2', name: '랫풀다운', weight: '80~100', unit: 'kg', reps: '10' },
          { label: 'LP3', name: '랫풀다운', weight: '80~100', unit: 'kg', reps: '10' },
          { label: 'LP4', name: '랫풀다운', weight: '80~100', unit: 'kg', reps: '10' },
        ]
      },
      {
        title: '인클라인',
        meta: '',
        rest: 90,
        sets: [
          { label: 'I1', name: '인클라인 벤치', weight: '70~80', unit: 'kg', reps: '10' },
          { label: 'I2', name: '인클라인 벤치', weight: '70~80', unit: 'kg', reps: '10' },
          { label: 'I3', name: '인클라인 벤치', weight: '70~80', unit: 'kg', reps: '10' },
        ]
      },
      {
        title: '이두',
        meta: '',
        rest: 60,
        sets: [
          { label: 'BI1', name: '바벨컬', weight: '', unit: '', reps: '10' },
          { label: 'BI2', name: '바벨컬', weight: '', unit: '', reps: '10' },
          { label: 'BI3', name: '바벨컬', weight: '', unit: '', reps: '10' },
          { label: 'BI4', name: '바벨컬', weight: '', unit: '', reps: '10' },
        ]
      },
      {
        title: '삼두',
        meta: '',
        rest: 60,
        sets: [
          { label: 'TR1', name: '트라이셉스', weight: '', unit: '', reps: '10' },
          { label: 'TR2', name: '트라이셉스', weight: '', unit: '', reps: '10' },
          { label: 'TR3', name: '트라이셉스', weight: '', unit: '', reps: '10' },
          { label: 'TR4', name: '트라이셉스', weight: '', unit: '', reps: '10' },
        ]
      },
      {
        title: '유산소',
        meta: '',
        rest: 0,
        sets: [
          { label: 'CARDIO', name: '천국의 계단', weight: '', unit: '', reps: '10–15분' },
        ]
      }
    ]
  }
};
