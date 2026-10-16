import type { Register, EngineInterface } from 'claude-code'

type Config = { idleMs: number; minTokens: number; instructions: string }

const pending: { timer?: { cancel: () => void } } = {}

function disarm($: EngineInterface) {
  pending.timer?.cancel()
  pending.timer = undefined
  $.ui.status(undefined)
}

async function compactIfWorthIt($: EngineInterface, cfg: Config) {
  pending.timer = undefined
  $.ui.status(undefined)
  try {
    const { context } = await $.session.usage()
    const tokens = context.tokens ?? 0
    if (tokens < cfg.minTokens) {
      $.ui.log(`idle-compact: skipped, context ${tokens} tokens < ${cfg.minTokens}`)
      return
    }
    const done = await $.session.compact(cfg.instructions ? { instructions: cfg.instructions } : undefined)
    if (done.skip !== undefined) {
      $.ui.log(`idle-compact: compaction skipped (${done.skip})`)
      return
    }
    const cost = done.usage
      ? ` (cache read ${done.usage.cache_read_input_tokens ?? 0}, input ${done.usage.input_tokens}, output ${done.usage.output_tokens})`
      : ''
    const msg = `idle-compact: compacted ${done.tokensBefore ?? tokens} → ${done.tokensAfter ?? '?'} tokens${cost}`
    $.ui.log(msg)
    $.ui.toast(msg)
  } catch (err) {
    // Rejects while a turn runs: the session is no longer idle, nothing to do.
    $.ui.log(`idle-compact: not compacted (${String(err)})`)
  }
}

function arm($: EngineInterface, cfg: Config) {
  disarm($)
  pending.timer = $.clock.after(cfg.idleMs, () => void compactIfWorthIt($, cfg))
  const at = new Date($.clock.now() + cfg.idleMs)
  const hhmm = `${String(at.getHours()).padStart(2, '0')}:${String(at.getMinutes()).padStart(2, '0')}`
  $.ui.status(`auto-compact at ${hhmm}`)
}

export const register: Register = (on, options) => {
  const cfg: Config = {
    idleMs: Math.max(1, Number(options.idleMinutes ?? 58)) * 60_000,
    minTokens: Number(options.minTokens ?? 30000),
    instructions: String(options.instructions ?? '').trim(),
  }

  // Any new activity cancels the pending compaction.
  on('turn.start', ($, e, next) => {
    disarm($)
    return next(e)
  })

  // The main loop's turn ended: its last request just refreshed the cache, so the clock starts now.
  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    if (e.agentId === undefined) arm($, cfg)
    return result
  })

  // A manual or automatic compaction already shrank the context.
  on('session.compact', async ($, e, next) => {
    const result = await next(e)
    if (e.trigger === 'manual' || e.trigger === 'auto') disarm($)
    return result
  })

  on('session.end', ($, e, next) => {
    disarm($)
    return next(e)
  })
}
