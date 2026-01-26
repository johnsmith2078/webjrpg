import fs from "node:fs";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function extractLogwrapBlock(css) {
  const match = css.match(/\.logwrap\s*\{[^}]*\}/);
  return match ? match[0] : "";
}

function testLogwrapMaxHeight() {
  const css = fs.readFileSync(new URL("../styles.css", import.meta.url), "utf8");
  const block = extractLogwrapBlock(css);
  assert(block, "未找到 .logwrap 样式块");
  assert(/max-height:\s*min\(30vh/.test(block), "PC 端 logwrap 最大高度应为 30vh");
}

try {
  testLogwrapMaxHeight();
  console.log("PASS: logwrap_height");
} catch (e) {
  console.error("FAIL: logwrap_height", e && e.stack ? e.stack : e);
  process.exitCode = 1;
}
