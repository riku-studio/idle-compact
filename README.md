# idle-compact

[English](README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md)

A mod for Claude Code / Claude Desktop that automatically runs `/compact` when a session has been idle for almost an hour, just before its prompt cache expires (58 minutes by default). When you return, only a summary needs to be reloaded instead of the full context.

- Starts a countdown after each turn in the main conversation ends. A new turn cancels the countdown, which restarts when that turn ends.
- Skips compaction when the context is below the threshold (30,000 tokens by default).
- Compacts only once per idle period. Manual `/compact` or automatic compaction also cancels the countdown.
- Shows a notification when compaction finishes, including the token counts before and after compaction and the token usage of compaction itself.

## Installation

From GitHub: [riku-studio/idle-compact](https://github.com/riku-studio/idle-compact)

```bash
claude plugin install idle-compact --marketplace riku-studio/idle-compact
```

Or enter `/plugin install idle-compact --marketplace riku-studio/idle-compact` in a Claude Code terminal session.

From a Git URL or a local folder:

```bash
claude plugin marketplace add <git-url-or-folder-path>
```

```bash
claude plugin install idle-compact@idle-compact-local
```

In Claude Desktop: click the + next to the input box, choose Plugins → Add marketplace, enter the repository or path, then choose Add plugin.

## Configuration

| Option | Default | Description |
| --- | --- | --- |
| `idleMinutes` | 58 | Minutes to wait after the last turn ends before compacting; should be less than 60 |
| `minTokens` | 30000 | Skip compaction when the context is below this token count |
| `instructions` | Empty | Summary instructions passed to compaction, equivalent to the text after `/compact` |

Example: `claude plugin install idle-compact@idle-compact-local --config idleMinutes=55`

## Notes

- Compaction itself reads the full context (at the cached-input rate) and generates a summary. If you never return to the session, that cost is wasted.
- Compaction loses details.
- The timer runs in the session process. It will not fire after the app closes or the session process stops.

## Testing

```bash
claude plugin test .
```
