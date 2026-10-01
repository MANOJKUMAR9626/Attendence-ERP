import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const layoutsDir = path.join(__dirname, 'src/components/layout');
const files = fs.readdirSync(layoutsDir).filter(f => f.endsWith('.jsx'));

for (const file of files) {
  let content = fs.readFileSync(path.join(layoutsDir, file), 'utf8');
  
  // Wrapper bg
  content = content.replace(/bg-slate-50\/50 dark:bg-slate-950/g, 'bg-[var(--paper)] text-[var(--ink)]');
  
  // Sidebar bg
  content = content.replace(/bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800/g, 'bg-[var(--navy)] text-white border-r border-[var(--navy-soft)]');
  
  // Sidebar title
  content = content.replace(/text-slate-900 dark:text-white/g, 'text-white');
  
  // Active item in sidebar
  content = content.replace(/bg-indigo-600 text-white font-medium/g, 'bg-[var(--navy-soft)] text-white font-medium border-l-4 border-[var(--gold)] pl-2');
  
  // Inactive item in sidebar
  content = content.replace(/text-\[#1E293B\] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/g, 'text-white\/70 hover:bg-[var(--navy-soft)] hover:text-white pl-3');
  
  // Header bg
  content = content.replace(/bg-white\/80 dark:bg-slate-950\/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/g, 'bg-[var(--paper)] border-b border-[var(--rule)]');
  
  // Header title
  content = content.replace(/text-slate-700 dark:text-slate-300/g, 'text-[var(--navy)]');
  
  // Background mesh removal
  content = content.replace(/<div className="bg-mesh" \/>/g, '');
  
  fs.writeFileSync(path.join(layoutsDir, file), content);
  console.log('Patched', file);
}
