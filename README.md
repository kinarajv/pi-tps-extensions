# pi-extensions

Collection of my [pi coding agent](https://github.com/badlogic/pi-mono/) extensions.

## Extensions

### tokens-per-second

Shows real-time token throughput in the pi status bar during streaming.

| Phase | Status bar |
|-------|------------|
| Idle | `⏺ idle` |
| Streaming | `⚡ 142 tok/s ↑12k ↓8k` |
| Finished | `⚡ 156 tok/s ↓823 (5.2s)` |

## Install

```bash
pi install git:github.com/kinarajv/pi-extensions
```

Or manually:

```bash
cp extensions/tokens-per-second.ts ~/.pi/agent/extensions/
```

Then run `/reload` in your pi session.

## License

MIT