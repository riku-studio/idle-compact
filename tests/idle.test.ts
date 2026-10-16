import type { On } from 'claude-code'
import { test, expect, mock } from 'claude-code/testing'

const MIN = 60_000
const turn = { answer: 'ok', durationMs: 1, isAborted: false, turnId: 't1', reason: 'answer' as const }

function world(on: On, tokens: number) {
  const calls = { compact: 0 }
  on('ui.status', () => ({ value: undefined }) as any)
  on('ui.log', () => ({ value: undefined }) as any)
  on('ui.toast', () => ({ value: undefined }) as any)
  on('turn.complete', () => ({ text: 'ok' }))
  on('turn.start', ($, e: any) => ({ turnId: e.turnId }))
  on('session.usage', () => ({ value: { startedAt: 0, context: { tokens, window: 200_000 }, rateLimits: [] } }) as any)
  on('session.compact', () => {
    calls.compact++
    return { messages: [], tokensBefore: tokens, tokensAfter: 3000 }
  })
  return calls
}

test('compacts a big idle session after 58 minutes', async ($, on) => {
  const clock = mock.clock(on)
  const calls = world(on, 120_000)
  await $.turn.complete(turn as any)
  await clock.advance(57 * MIN)
  expect(calls.compact).toBe(0)
  await clock.advance(1 * MIN)
  expect(calls.compact).toBe(1)
  await clock.advance(120 * MIN)
  expect(calls.compact).toBe(1)
})

test('a new turn resets the countdown', async ($, on) => {
  const clock = mock.clock(on)
  const calls = world(on, 120_000)
  await $.turn.complete(turn as any)
  await clock.advance(50 * MIN)
  await $.turn.start({ turnId: 't2' } as any)
  await $.turn.complete(turn as any)
  await clock.advance(50 * MIN)
  expect(calls.compact).toBe(0)
  await clock.advance(8 * MIN)
  expect(calls.compact).toBe(1)
})

test('skips a small context', async ($, on) => {
  const clock = mock.clock(on)
  const calls = world(on, 5_000)
  await $.turn.complete(turn as any)
  await clock.advance(60 * MIN)
  expect(calls.compact).toBe(0)
})
