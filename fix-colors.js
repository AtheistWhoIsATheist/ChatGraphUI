import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Bg colors
    content = content.replace(/bg-\[#000\]/g, 'bg-zinc-950');
    content = content.replace(/bg-\[#030303\]/g, 'bg-zinc-950');
    content = content.replace(/bg-\[#050505\]/g, 'bg-zinc-900/40');
    content = content.replace(/bg-\[#111\]/g, 'bg-white/5');
    content = content.replace(/bg-\[#222\]/g, 'bg-white/10');
    content = content.replace(/bg-\[#FF3A00\]\/[0-9]+/g, 'bg-white/10');
    content = content.replace(/bg-\[#00E5FF\]\/[0-9]+/g, 'bg-white/10');
    content = content.replace(/bg-\[#FF3A00\]/g, 'bg-zinc-200 text-black border-transparent hover:bg-zinc-300');
    content = content.replace(/bg-\[#00E5FF\]/g, 'bg-zinc-800 text-white border-transparent hover:bg-zinc-700');

    // Border colors
    content = content.replace(/border-\[#333\]/g, 'border-white/5');
    content = content.replace(/border-\[#444\]/g, 'border-white/10');
    content = content.replace(/border-\[#555\]/g, 'border-white/20');
    content = content.replace(/border-\[#FF3A00\]\/[0-9]+/g, 'border-white/10');
    content = content.replace(/border-\[#00E5FF\]\/[0-9]+/g, 'border-white/10');
    content = content.replace(/border-\[#FF3A00\]/g, 'border-white/10');
    content = content.replace(/border-\[#00E5FF\]/g, 'border-white/10');

    // Text colors
    content = content.replace(/text-\[#FF3A00\]/g, 'text-zinc-200');
    content = content.replace(/text-\[#00E5FF\]/g, 'text-zinc-300');
    content = content.replace(/text-\[#FFD700\]/g, 'text-zinc-300');
    content = content.replace(/text-\[#00FF66\]/g, 'text-zinc-300');
    content = content.replace(/text-\[#888\]/g, 'text-zinc-400');
    content = content.replace(/text-\[#555\]/g, 'text-zinc-500');
    content = content.replace(/text-\[#ccc\]/g, 'text-zinc-300');
    content = content.replace(/text-\[#eee\]/g, 'text-zinc-100');
    content = content.replace(/text-\[#fff\]/g, 'text-white');
    content = content.replace(/text-\[#000\]/g, 'text-zinc-950');

    // Shadows
    content = content.replace(/shadow-\[[^\]]*?(rgba|#)[^\]]*?\]/g, 'shadow-xl');

    // Hovers
    content = content.replace(/hover:text-\[#FF3A00\]/g, 'hover:text-white');
    content = content.replace(/hover:text-\[#00E5FF\]/g, 'hover:text-white');
    content = content.replace(/hover:border-\[#FF3A00\]/g, 'hover:border-white/20');
    content = content.replace(/hover:border-\[#00E5FF\]/g, 'hover:border-white/20');
    content = content.replace(/hover:bg-\[#FF3A00\]\/[0-9]+/g, 'hover:bg-white/10');
    content = content.replace(/hover:bg-\[#00E5FF\]\/[0-9]+/g, 'hover:bg-white/10');
    content = content.replace(/hover:bg-\[#FF3A00\]/g, 'hover:bg-white/20');
    
    // Classes
    content = content.replace(/\bneo-flat\b/g, 'rounded-xl transition duration-300 backdrop-blur-md');
    // Remove heavy borders
    content = content.replace(/\bborder-4\b/g, 'border');
    content = content.replace(/\bborder-y-4\b/g, 'border-[0.5px]');
    content = content.replace(/\bborder-x-4\b/g, 'border-[0.5px]');
    content = content.replace(/\bborder-l-4\b/g, 'border-l');
    content = content.replace(/\bborder-r-4\b/g, 'border-r');
    content = content.replace(/\bborder-t-4\b/g, 'border-t');
    content = content.replace(/\bborder-b-4\b/g, 'border-b');
    content = content.replace(/\bborder-2\b/g, 'border');
    
    // Fonts and uppercase
    content = content.replace(/\bfont-black\b/g, 'font-semibold');
    content = content.replace(/\buppercase\b/g, ''); 
    content = content.replace(/tracking-\[0\.2em\]/g, 'tracking-widest');
    content = content.replace(/tracking-\[0\.3em\]/g, 'tracking-widest');

    // Remove text color overrides
    content = content.replace(/\btext-orange-500\b/g, 'text-zinc-200');
    content = content.replace(/\btext-orange-400\b/g, 'text-zinc-300');

    fs.writeFileSync(filePath, content);
  }
});
console.log('done global replace');
