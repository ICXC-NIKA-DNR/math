// node bundle.mjs  ->  ../dist/recall-standalone.html
// Inlines engine, app, card bank and KaTeX (css + fonts + js) into one file for
// hosts that can't serve sibling files. The repo version stays split.
import fs from "node:fs";
const read = (p) => fs.readFileSync(p, "utf8");
const engine = read("../recall/engine.mjs");
const names = [...engine.matchAll(/^export (?:function|const) (\w+)/gm)].map((m) => m[1]);
const engineSrc = engine.replace(/^export /gm, "") + `\nconst E = { ${names.join(", ")} };\n`;
const appSrc = read("../recall/app.mjs").replace(/^import .*$/m, "").replace(/^export /gm, "");
const bank = read("../recall/cards.json").replace(/</g, "\\u003c");
const css = read("node_modules/katex/dist/katex.min.css")
  .replace(/url\(fonts\/([^)]+?\.woff2)\)/g, (m, p) =>
    `url(data:font/woff2;base64,${fs.readFileSync("node_modules/katex/dist/fonts/" + p).toString("base64")})`)
  .replace(/,url\(fonts\/[^)]+\)\s*format\("(woff|truetype)"\)/g, "");
const html = read("../recall/index.html")
  .replace(/<link rel="stylesheet" href="https:\/\/cdnjs[^>]*>/, `<style>${css}</style>`)
  .replace(/<script defer src="https:\/\/cdnjs[^>]*><\/script>/, `<script>${read("node_modules/katex/dist/katex.min.js")}</script>`)
  .replace(/<a class="link" href="\.\.\/index\.html"[^>]*>all trainers<\/a>/, "")
  .replace(/<script type="module">[\s\S]*?<\/script>/,
    `<script type="module">\n${engineSrc}\n${appSrc}\nboot(${bank});\n</script>`);
fs.writeFileSync("../dist/recall-standalone.html", html);
console.log((html.length / 1e6).toFixed(2) + " MB");
