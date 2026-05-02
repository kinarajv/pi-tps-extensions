/**
 * Tokens Per Second (TPS) Extension
 *
 * Shows real-time token throughput in the status bar during streaming.
 * Falls back to estimated TPS (chars/4) while streaming, then shows actual
 * TPS from usage.output on message_end.
 *
 * Usage: place in ~/.pi/agent/extensions/ or run with pi -e tokens-per-second.ts
 */

import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  let streaming = false;
  let streamStart = 0;
  let charsAccumulated = 0;
  let lastTps = 0;
  let totalInput = 0;
  let totalOutput = 0;
  let totalStreamTime = 0;
  let showInOut = true;

  pi.registerCommand("tps", {
    description: "Toggle showing input/output token counts in status bar",
    handler: async (_args, ctx) => {
      showInOut = !showInOut;
      const theme = ctx.ui.theme;
      const state = showInOut
        ? theme.fg("success", "ON")
        : theme.fg("dim", "OFF");
      const label = theme.fg("dim", showInOut
        ? " — showing ↑↓ token counts"
        : " — only TPS + status");
      ctx.ui.notify(`Show in/out tokens: ${state}${label}`, "info");
    },
  });

  function inOut() {
    return showInOut ? ` ↑${fmt(totalInput)} ↓${fmt(totalOutput)}` : "";
  }

  pi.on("turn_start", async (_event, ctx) => {
    streaming = false;
    streamStart = 0;
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
      ctx.ui.setStatus("tps", `⚡ ${speed}${label}${inOut()}`);
    }
  });

  pi.on("message_end", async (event, ctx) => {
    if (event.message.role !== "assistant") return;

    const elapsed = streamStart > 0 ? (performance.now() - streamStart) / 1000 : 0;
    const outputTokens = event.message.usage?.output ?? 0;
    totalInput += event.message.usage?.input ?? 0;
    totalOutput += outputTokens;
    if (elapsed > 0.1) totalStreamTime += elapsed;

    const theme = ctx.ui.theme;
    if (elapsed > 0.1 && outputTokens > 0) {
      const tps = outputTokens / elapsed;
      lastTps = tps;
      const speed = theme.fg("success", `${tps.toFixed(0)}`);
      const label = theme.fg("dim", " tok/s ");
      const time = theme.fg("dim", `(${elapsed.toFixed(1)}s)`);
      if (showInOut) {
        const out = theme.fg("accent", `↓${outputTokens}`);
        ctx.ui.setStatus("tps", `⚡ ${speed}${label}${out} ${time}`);
      } else {
        ctx.ui.setStatus("tps", `⚡ ${speed}${label}${time}`);
      }
    } else {
      ctx.ui.setStatus("tps", theme.fg("dim", `⏺ done`));
    }

    streaming = false;
  });

  function showIdle(ctx: ExtensionContext) {
    const theme = ctx.ui.theme;
    if (totalStreamTime > 0 && totalOutput > 0) {
      const avgTps = totalOutput / totalStreamTime;
      const avg = theme.fg("dim", `⏺ avg `);
      const speed = theme.fg("accent", `${avgTps.toFixed(0)}`);
      const label = theme.fg("dim", ` tok/s${inOut()}`);
      ctx.ui.setStatus("tps", `${avg}${speed}${label}`);
    } else {
      ctx.ui.setStatus("tps", theme.fg("dim", `⏺ idle`));
    }
  }

  pi.on("session_start", async (_event, ctx) => {
    showIdle(ctx);
  });

  pi.on("turn_end", async (_event, ctx) => {
    if (!streaming) showIdle(ctx);
  });
}

function fmt(n: number): string {
  if (n < 1000) return `${n}`;
  if (n < 1000000) return `${(n / 1000).toFixed(1)}k`;
  return `${(n / 1000000).toFixed(1)}M`;
}
