import { runPlaythrough } from "./playthrough.mjs";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function parseArgs(argv) {
  // Back-compat: positional args [n] [seedBase]
  const out = {
    n: argv[0] ? Number(argv[0]) : 20,
    seedBase: argv[1] ? Number(argv[1]) : 1000,
    classId: null,
    ending: "seal",
    ch3Ending: "reset"
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--seeds") {
      out.n = Number(argv[i + 1]);
      i++;
    } else if (a === "--seed-base") {
      out.seedBase = Number(argv[i + 1]);
      i++;
    } else if (a === "--class") {
      out.classId = argv[i + 1] ? String(argv[i + 1]) : null;
      i++;
    } else if (a === "--ending") {
      out.ending = argv[i + 1] ? String(argv[i + 1]) : "seal";
      i++;
    } else if (a === "--ch3-ending") {
      out.ch3Ending = argv[i + 1] ? String(argv[i + 1]) : "reset";
      i++;
    }
  }

  if (!Number.isFinite(out.n) || out.n <= 0) out.n = 20;
  if (!Number.isFinite(out.seedBase)) out.seedBase = 1000;
  out.n = Math.floor(out.n);
  return out;
}

function main() {
  const { n, seedBase, classId, ending, ch3Ending } = parseArgs(process.argv.slice(2));

  const failures = [];

  for (let i = 0; i < n; i++) {
    const seed = seedBase + i;
    try {
      runPlaythrough({ seed, silent: true, classId, ending, ch3Ending });
    } catch (e) {
      failures.push({ seed, error: e && e.message ? e.message : String(e || "unknown error") });
    }
  }

  assert(failures.length === 0, `多种子通关失败: ${JSON.stringify(failures.slice(0, 5))}`);
  const cls = classId ? ` class=${classId}` : "";
  const end = ending ? ` ending=${ending}` : "";
  console.log(`PASS: 多种子通关测试 (${n} seeds from ${seedBase})${cls}${end}`);
}

try {
  main();
} catch (e) {
  console.error("FAIL:", e && e.stack ? e.stack : e);
  process.exitCode = 1;
}
