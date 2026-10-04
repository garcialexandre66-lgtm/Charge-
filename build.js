/* Assemble site/index.html from src/ (files in name order, separated by a blank line). Usage: node build.js */
const fs=require('fs'),path=require('path');
const dir=path.join(__dirname,'src');
const parts=fs.readdirSync(dir).filter(f=>/^\d.*\.(html|js)$/.test(f)).sort().map(f=>fs.readFileSync(path.join(dir,f),'utf8'));
fs.writeFileSync(path.join(__dirname,'site','index.html'),parts.join('\n'));
console.log('site/index.html',parts.join('\n').length,'octets');
