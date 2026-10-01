import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.jsx')) results.push(file);
    }
  });
  return results;
}

const files = [...walk(path.join(__dirname, 'src/pages')), ...walk(path.join(__dirname, 'src/components'))];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Convert standard slate colors to theme CSS vars
  content = content.replace(/bg-slate-50(\/[0-9]+)?/g, 'bg-[var(--paper)]');
  content = content.replace(/bg-slate-100(\/[0-9]+)?/g, 'bg-[var(--paper-raised)]');
  content = content.replace(/bg-slate-800(\/[0-9]+)?/g, 'bg-[var(--paper-raised)]');
  content = content.replace(/bg-slate-900(\/[0-9]+)?/g, 'bg-[var(--paper-raised)]');
  content = content.replace(/bg-slate-950(\/[0-9]+)?/g, 'bg-[var(--paper)]');
  
  content = content.replace(/border-slate-200/g, 'border-[var(--rule)]');
  content = content.replace(/border-slate-300/g, 'border-[var(--rule)]');
  content = content.replace(/border-slate-700/g, 'border-[var(--rule)]');
  content = content.replace(/border-slate-800(\/[0-9]+)?/g, 'border-[var(--rule)]');
  
  content = content.replace(/text-slate-400/g, 'text-[var(--ink-soft)]');
  content = content.replace(/text-slate-500/g, 'text-[var(--ink-soft)]');
  content = content.replace(/text-slate-600/g, 'text-[var(--ink)]');
  content = content.replace(/text-slate-700/g, 'text-[var(--ink)]');
  content = content.replace(/text-slate-800/g, 'text-[var(--ink)]');
  content = content.replace(/text-slate-900/g, 'text-[var(--ink)]');
  
  // Primary Indigo to Navy
  content = content.replace(/bg-indigo-600/g, 'bg-[var(--navy)]');
  content = content.replace(/bg-indigo-50/g, 'bg-[var(--navy-soft)] text-white');
  content = content.replace(/text-indigo-600/g, 'text-[var(--navy)]');
  content = content.replace(/text-indigo-500/g, 'text-[var(--navy)]');
  content = content.replace(/hover:bg-indigo-700/g, 'hover:bg-[var(--navy-soft)]');
  content = content.replace(/ring-indigo-500/g, 'ring-[var(--navy)]');
  
  if (original !== content) {
    fs.writeFileSync(file, content);
    console.log('Patched', file);
  }
}
