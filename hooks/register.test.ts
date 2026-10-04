import { expect, test } from 'claude-code/testing'

const NUDGE = "The user hasn't heard from you in a while — say in a few words what you're doing, then continue."

const bottom = (on: Parameters<Parameters<typeof test>[1] & ((...a: any[]) => any)>[1]) => {
  on('prompt.submit', async (_$, e) => ({ text: e.text }) as never)
  on('prompt.attachment', async (_$, e) => ({ text: e.text }))
  on('prompt.context', async (_$, e) => ({ blocks: e.blocks }))
}

test('a Japanese prompt makes the English nudge ask for Japanese', async ($, on) => {
  bottom(on as never)
  await $.prompt.submit({ text: 'ドットを再起動して' })
  const r = await $.prompt.attachment({ type: 'silent_turn_reminder', text: NUDGE, origin: { kind: 'engine' } })
  expect(r.text).toContain(NUDGE)
  expect(r.text).toContain('日本語で書く')
})

test('other reminders are left alone', async ($, on) => {
  bottom(on as never)
  await $.prompt.submit({ text: 'ドットを再起動して' })
  const r = await $.prompt.attachment({ type: 'todo_reminder', text: 'todo', origin: { kind: 'engine' } })
  expect(r.text).toBe('todo')
})

test('an English prompt changes nothing', async ($, on) => {
  bottom(on as never)
  await $.prompt.submit({ text: 'restart the dot' })
  const r = await $.prompt.attachment({ type: 'silent_turn_reminder', text: NUDGE, origin: { kind: 'engine' } })
  expect(r.text).toBe(NUDGE)
  const c = await $.prompt.context({ blocks: [] })
  expect(c.blocks.length).toBe(0)
})

test('the first message carries the language block', async ($, on) => {
  bottom(on as never)
  await $.prompt.submit({ text: 'こんにちは' })
  const c = await $.prompt.context({ blocks: [] })
  expect(c.blocks.map(b => b.name)).toContain('replyLanguage')
})

test('a fixed language wins over detection', { options: { language: 'Korean' } }, async ($, on) => {
  bottom(on as never)
  await $.prompt.submit({ text: 'ドットを再起動して' })
  const r = await $.prompt.attachment({ type: 'silent_turn_reminder', text: NUDGE, origin: { kind: 'engine' } })
  expect(r.text).toContain('in Korean')
})
