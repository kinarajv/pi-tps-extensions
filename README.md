# Token-per-sec Extensions

Real-time token throughput extensions for [pi coding agent](https://github.com/badlogic/pi-mono/).

## Extensions

### tokens-per-second

Shows real-time token throughput in the pi status bar during streaming.

| Phase | Status bar |
|-------|------------|
| First idle | `⏺ idle` |
| Idle (after usage) | `⏺ avg 156 tok/s ↑2.3k ↓8.8k` |
| Streaming | `⚡ 142 tok/s ↑12k ↓8k` |
| Finished | `⚡ 156 tok/s ↓823 (5.2s)` |

## Install

```bash
pi install npm:@kinarajv/pi-tps-extensions
```

Or manually:

```bash
cp extensions/tokens-per-second.ts ~/.pi/agent/extensions/
```

Then run `/reload` in your pi session.

## License

MIT