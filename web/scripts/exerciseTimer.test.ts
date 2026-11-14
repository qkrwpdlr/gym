import assert from 'node:assert/strict'
import test from 'node:test'
import { parseTimedReps, timerRemaining } from '../src/exerciseTimer.ts'

test('time prescriptions distinguish duration from rep counts and tempo cues', () => {
  assert.deepEqual(parseTimedReps('30초'), { min: 30, max: 30 })
  assert.deepEqual(parseTimedReps('10초'), { min: 10, max: 10 })
  assert.deepEqual(parseTimedReps('10–20분'), { min: 600, max: 1200 })
  assert.deepEqual(parseTimedReps('1분 30초'), { min: 90, max: 90 })
  for (const reps of ['30', '10–12', 'AMRAP', '3초 내리기', '0초', '20–10분', '']) assert.equal(parseTimedReps(reps), null)
})

test('absolute deadlines catch up after backgrounding and paused timers remain paused', () => {
  assert.equal(timerRemaining({ remaining: 30, endTime: 31_000 }, 1_000), 30)
  assert.equal(timerRemaining({ remaining: 30, endTime: 31_000 }, 30_001), 1)
  assert.equal(timerRemaining({ remaining: 30, endTime: 31_000 }, 40_000), 0)
  assert.equal(timerRemaining({ remaining: 18, endTime: null }, 40_000), 18)
})
