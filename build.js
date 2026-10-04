/* Assemble site/index.html from src/ (files in name order, separated by a newline).
   Usage: node build.js            → site/index.html
          node build.js out.html   → another file (lets several people build at the same time) */
const fs=require('fs'),path=require('path');
const dir=path.join(__dirname,'src'),out=process.argv[2]?path.resolve(process.argv[2]):path.join(__dirname,'site','index.html');
const parts=fs.readdirSync(dir).filter(f=>/^\d.*\.(html|js)$/.test(f)).sort().map(f=>fs.readFileSync(path.join(dir,f),'utf8'));
fs.writeFileSync(out,parts.join('\n'));
console.log(path.relative(process.cwd(),out),parts.join('\n').length,'octets');
