// После `next build` со статическим экспортом: Next сам добавляет /my_fav_novel к ссылкам и /_next,
// но не к файлам из public/ (картинки из JSON, CSS url(/art/...)). Дописываем префикс во всех
// собранных файлах, где путь начинается с /art/ сразу после кавычки или скобки.
import fs from "node:fs";
import path from "node:path";

const BASE = "/my_fav_novel";
const OUT = path.resolve(process.argv[2] ?? ".next-pages"); // distDir сборки PAGES=1
const re = /(["'`(])\/art\//g;
let files = 0;
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(html|js|css|txt|json)$/.test(e.name)) {
      const s = fs.readFileSync(p, "utf8");
      const t = s.replace(re, `$1${BASE}/art/`);
      if (t !== s) { fs.writeFileSync(p, t); files++; }
    }
  }
};
walk(OUT);
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
console.log(`pages-basepath: ${files} files patched`);
