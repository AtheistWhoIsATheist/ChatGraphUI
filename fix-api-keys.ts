const fs = require('fs');

const fixFile = (path) => {
  if (!fs.existsSync(path)) return;
  let content = fs.readFileSync(path, 'utf8');
  
  // Replace: const apiKey = process.env.GEMINI_API_KEY;
  // With:    const apiKey = process.env.GEMINI_API_KEY?.replace(/^["\']|["\']$/g, '').trim();
  content = content.replace(/const apiKey = process\.env\.GEMINI_API_KEY;/g, "const apiKey = process.env.GEMINI_API_KEY?.replace(/^[\"'`]|[\"'`]$/g, '').trim();");
  
  // Replace: const apiKey = process.env.GEMINI_API_KEY || '';
  content = content.replace(/const apiKey = process\.env\.GEMINI_API_KEY \|\| '';/g, "const apiKey = process.env.GEMINI_API_KEY?.replace(/^[\"'`]|[\"'`]$/g, '').trim() || '';");

  // cron-jobs:
  content = content.replace(/apiKey: process\.env\.GEMINI_API_KEY \|\| 'placeholder'/g, "apiKey: process.env.GEMINI_API_KEY?.replace(/^[\"'`]|[\"'`]$/g, '').trim() || 'placeholder'");

  fs.writeFileSync(path, content);
};

['server.ts', 'src/services/geminiService.ts', 'src/backend/nes2-router.ts', 'src/backend/cron-jobs.ts', 'densify-all.ts', 'test-embed.ts'].forEach(fixFile);
console.log("Fixed API Keys!");
