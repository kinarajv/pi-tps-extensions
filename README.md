# Token-per-sec Extensions

Real-time token throughput extensions for [pi coding agent](https://github.com/badlogic/pi-mono/).

## Extensions

### tokens-per-second

Shows real-time token throughput and TTFT (Time To First Token) in the pi status bar.

**Full mode** (default):

| Phase | Status bar |
|-------|------------|
| First idle | `⏺ idle` |
| Waiting (has history) | `⏳ waiting·last 1.2s...` |
| Idle (after usage) | `⏺ avg 156 tok/s · 🕐 1.3s ↑2.3k ↓8.8k` |
| Streaming | `⚡ 142 tok/s · 🕐 1.2s ↑12k ↓8k` |
| Finished | `⚡ 156 tok/s 🕐1.2s ↓823 (5.2s)` |

**Compact mode** (`/tps compact`):

| Phase | Status bar |
|-------|------------|
| Idle | `57t/s, 2.9s ↑2.3k ↓8.8k` |
| Streaming | `142t/s, 1.2s ↑12k ↓8k` |
| Finished | `156t/s, 1.2s ↓823 (5.2s)` |

## Commands

| Command | Description |
|---------|-------------|
| `/tps` | Toggle `↑` (input) / `↓` (output) token counts on/off |
| `/tps compact` | Toggle compact mode — `57t/s, 2.9s` format, no emoji |

## Install

```bash
pi install npm:@kinarajv/pi-tps-extensions
```

Or manually:

```bash
cp extensions/tokens-per-second.ts ~/.pi/agent/extensions/
```

Then run `/reload` in your pi session.

## Metrics

| Metric | Description |
|--------|-------------|
| `tok/s` / `t/s` | Token throughput — estimated (chars/4) during stream, actual on completion |
| `🕐` / `,Xs` | TTFT (Time To First Token) — latency from prompt to first response byte |
| `↑` / `↓` | Cumulative input/output token counts (toggle with `/tps`) |
| `avg` / avg value | Session-wide running average |

## License

MIT