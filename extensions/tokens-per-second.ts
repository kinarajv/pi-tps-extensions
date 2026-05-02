/**
 * Tokens Per Second (TPS) Extension
 *
 * Shows real-time token throughput in the status bar during streaming.
 * Falls back to estimated TPS (chars/4) while streaming, then shows actual
 * TPS from usage.output on message_end.
 *
 * Usage: place in ~/.pi/agent/extensions/ or run with pi -e tokens-per-second.ts
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  let streaming = false;
  let streamStart = 0;
  let charsAccumulated = 0;
  let lastTps = 0;
  let totalInput = 0;
  let totalOutput = 0;

  pi.on("session_start", async (_event, ctx) => {
    ctx.ui.setStatus("tps", ctx.ui.theme.fg("dim", "⏺ idle"));
  });

  pi.on("turn_start", async (_event, ctx) => {
    streaming = false;
    charsAccumulated = 0;
    ctx.ui.setStatus("tps", ctx.ui.theme.fg("dim", "⏳ waiting..."));
  });

  pi.on("message_update", async (event, ctx) => {
    if (event.message.role !== "assistant") return;

    if (!streaming) {
      streaming = true;
      streamStart = performance.now();
      charsAccumulated = 0;
    }

    // Count text chars in all content blocks
    let chars = 0;
    for (const block of event.message.content) {
      if (block.type === "text") chars += block.text.length;
      else if (block.type === "thinking") chars += block.thinking.length;
    }
    charsAccumulated = chars;

    const elapsed = (performance.now() - streamStart) / 1000;
    if (elapsed > 0.1) {
      const estimatedTokens = chars / 4;
      const tps = estimatedTokens / elapsed;
      lastTps = tps;

      const theme = ctx.ui.theme;
      const speed = theme.fg("accent", `${tps.toFixed(0)}`);
      const label = theme.fg("dim", " tok/s");
      const total = theme.fg("dim", ` ↑${fmt(totalInput)} ↓${fmt(totalOutput)}`);
      ctx.ui.setStatus("tps", `⚡ ${speed}${label} ${total}`);
    }
  });

  pi.on("message_end", async (event, ctx) => {
    if (event.message.role !== "assistant") return;

    const elapsed = (performance.now() - streamStart) / 1000;
    const outputTokens = event.message.usage?.output ?? 0;
    totalInput += event.message.usage?.input ?? 0;
    totalOutput += outputTokens;

    const theme = ctx.ui.theme;
    if (elapsed > 0.1 && outputTokens > 0) {
      const tps = outputTokens / elapsed;
      lastTps = tps;
      const speed = theme.fg("success", `${tps.toFixed(0)}`);
      const label = theme.fg("dim", " tok/s ");
      const time = theme.fg("dim", `(${elapsed.toFixed(1)}s)`);
      const out = theme.fg("accent", `↓${outputTokens}`);
      ctx.ui.setStatus("tps", `⚡ ${speed}${label}${out} ${time}`);
    } else {
      ctx.ui.setStatus("tps", theme.fg("dim", `⏺ done`));
    }

    streaming = false;
  });

  pi.on("turn_end", async (_event, ctx) => {
    if (!streaming) {
      const theme = ctx.ui.theme;
      ctx.ui.setStatus("tps", theme.fg("dim", `⏺ idle  ↑${fmt(totalInput)} ↓${fmt(totalOutput)}`));
    }
  });
}

function fmt(n: number): string {
  if (n < 1000) return `${n}`;
  if (n < 1000000) return `${(n / 1000).toFixed(1)}k`;
  return `${(n / 1000000).toFixed(1)}M`;
}