import type { Register } from 'claude-code'

// The engine nudges a quiet turn with an English reminder ("say in a few words what you're doing").
// Models tend to answer it in English even in a Japanese conversation. This plugin adds one line
// in the person's language to such reminders, and one context block at the start of the conversation.

// Engine reminders that ask the model to say something to the person
const NUDGES = new Set(['silent_turn_reminder'])

type Lang = { name: string; note: string; block: string }

const LANGS: Record<string, Lang> = {
  ja: {
    name: '日本語',
    note: '（この知らせは英語だが、ユーザーに向けて書くひとことや返事は日本語で書く）',
    block: 'ユーザーに向けて書く文章は、作業の途中のひとことも含めて、すべて日本語で書く。英語の知らせや英語の道具の出力が来ても、それにつられて英語にしない。コード・コマンド・ファイル名・識別子はそのまま。',
  },
  ko: {
    name: '한국어',
    note: '(이 알림은 영어지만, 사용자에게 쓰는 말과 답변은 한국어로 쓴다)',
    block: '사용자에게 쓰는 모든 글은 작업 중의 짧은 안내까지 포함해 한국어로 쓴다. 영어 알림이나 영어 도구 출력이 와도 영어로 바꾸지 않는다. 코드·명령어·파일 이름·식별자는 그대로 둔다.',
  },
  zh: {
    name: '中文',
    note: '（这条提醒是英文的，但写给用户的话和回答都用中文）',
    block: '写给用户的所有文字，包括工作途中的简短说明，都用中文。即使收到英文提醒或英文工具输出，也不要跟着改用英文。代码、命令、文件名和标识符保持原样。',
  },
}

const custom = (name: string): Lang => ({
  name,
  note: `(This reminder is in English, but write every message to the user in ${name}.)`,
  block: `Write every message to the user in ${name}, including short progress notes. Do not switch to English because a reminder or a tool's output is in English. Keep code, commands, file names and identifiers as they are.`,
})

// Which language the person writes in, by script. Kana means Japanese even when mixed with kanji.
const detect = (text: string): string | null => {
  if (/[぀-ヿ]/.test(text)) return 'ja'
  if (/[가-힯]/.test(text)) return 'ko'
  if (/[一-鿿]/.test(text)) return 'zh'
  return null
}

const S = { seen: null as string | null }

export const register: Register = (on, options) => {
  const fixed = String((options as { language?: string }).language ?? '').trim()
  const pick = (): Lang | null => {
    if (fixed) {
      const key = detect(fixed) ?? Object.keys(LANGS).find(k => LANGS[k].name === fixed)
      return key && LANGS[key]?.name === fixed ? LANGS[key] : custom(fixed)
    }
    return S.seen ? LANGS[S.seen] : null
  }

  on('prompt.submit', async ($, e, next) => {
    // Only what the person typed or said counts; messages from other sessions and background notices do not
    const kind = e.origin?.kind
    const byPerson = !e.origin || kind === 'composer' || kind === 'bridge' || kind === 'sdk' ||
      (kind === 'plugin' && (e.origin as { asUser?: boolean }).asUser === true)
    if (byPerson) S.seen = detect(e.text) ?? S.seen
    return next(e)
  })

  on('prompt.attachment', async ($, e, next) => {
    const lang = pick()
    if (!lang || e.agentId || e.origin.kind !== 'engine' || !NUDGES.has(e.type)) return next(e)
    return next({ ...e, text: `${e.text}\n${lang.note}` })
  })

  on('prompt.context', async ($, e, next) => {
    const r = await next(e)
    const lang = pick()
    if (!lang) return r
    return { ...r, blocks: [...r.blocks, { name: 'replyLanguage', text: lang.block }] }
  })
}
