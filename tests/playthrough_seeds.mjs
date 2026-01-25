import { runPlaythrough } from "./playthrough.mjs";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function parseArgs(argv) {
  // Back-compat: positional args [n] [seedBase]
  const out = {
    n: argv[0] ? Number(argv[0]) : 20,
    seedBase: argv[1] ? Number(argv[1]) : 1000
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--seeds") {
      out.n = Number(argv[i + 1]);
      i++;
    } else if (a === "--seed-base") {
      out.seedBase = Number(argv[i + 1]);
      i++;
    }
  }

  if (!Number.isFinite(out.n) || out.n <= 0) out.n = 20;
  if (!Number.isFinite(out.seedBase)) out.seedBase = 1000;
  out.n = Math.floor(out.n);
  return out;
}

function main() {
  const { n, seedBase } = parseArgs(process.argv.slice(2));

  const failures = [];

  for (let i = 0; i < n; i++) {
    const seed = seedBase + i;
    try {
      runPlaythrough({ seed, silent: true });
    } catch (e) {
      failures.push({ seed, error: e && e.message ? e.message : String(e || "unknown error") });
    }
  }

  assert(failures.length === 0, `多种子通关失败: ${JSON.stringify(failures.slice(0, 5))}`);
  console.log(`PASS: 多种子通关测试 (${n} seeds from ${seedBase})`);
}

try {
  main();
} catch (e) {
  console.error("FAIL:", e && e.stack ? e.stack : e);
  process.exitCode = 1;
}
