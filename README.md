# lang-keeper

A Claude Code plugin that keeps Claude writing to you in your language.

When a turn runs long, Claude Code nudges the model with an English reminder ("say in a few words what you're doing"). In a Japanese, Korean or Chinese conversation the model often answers that nudge in English, so the short progress notes switch language in the middle of the work.

lang-keeper does two things:

- adds one line in your language to that reminder, asking for the note in your language
- adds a short `replyLanguage` block at the start of the conversation saying the same thing

It does not translate anything and does not touch code, commands, tool output or subagents.

## Which language

By default it follows the language you write in, judged by the script of your own prompts: kana means Japanese, Hangul means Korean, Han characters alone mean Chinese. When you write in English it changes nothing.

To fix the language, set the `language` option (for example `日本語` or `Korean`) in `/plugin`.

## Install

```
/plugin marketplace add tsurutanmen/lang-keeper
/plugin install lang-keeper@lang-keeper
```

Restart Claude Code after installing.

## Limits

- It adds a request. The model can still drift now and then.
- Only the reminder named `silent_turn_reminder` is changed. Other engine reminders are left as they are.
- Tested with `claude plugin test` (5 tests, including one that checks an English prompt changes nothing). Not yet measured on a large number of real sessions.

---

## 日本語

Claude Code は作業が長くなると、英語で「今なにをしているか一言で」と催促します。日本語で話していても、その一言だけ英語になることがあります。lang-keeper は、その催促に「ひとことは日本語で書く」という一行を足し、会話の最初にも同じことを書き添えます。

言語は自分が打った文字から決めます。かなが入っていれば日本語です。英語で話しかけたときは何も変えません。`/plugin` の設定で `language` に言語名を入れると固定できます。

## License

MIT
