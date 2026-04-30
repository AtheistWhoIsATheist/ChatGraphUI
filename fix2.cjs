const fs = require("fs");

function fixFile(path, regex, repl) {
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, "utf8");
    content = content.replace(regex, repl);
    fs.writeFileSync(path, content);
  }
}

fixFile("src/services/geminiService.ts", /const apiKey = process\.env\.GEMINI_API_KEY \|\| ';/g, "const apiKey = process.env.GEMINI_API_KEY?.trim() || ';");
fixFile("src/backend/nes2-router.ts", /const apiKey = process\.env\.GEMINI_API_KEY;/g, "const apiKey = process.env.GEMINI_API_KEY?.trim();");
fixFile("src/backend/cron-jobs.ts", /apiKey: process\.env\.GEMINI_API_KEY \|\| 'placeholder'/g, "apiKey: process.env.GEMINI_API_KEY?.trim() || 'placeholder'");
fixFile("densify-all.ts", /apiKey: process\.env\.GEMINI_API_KEY \|\| 'placeholder'/g, "apiKey: process.env.GEMINI_API_KEY?.trim() || 'placeholder'");
fixFile("test-embed.ts", /apiKey: process\.env\.GEMINI_API_KEY/g, "apiKey: process.env.GEMINI_API_KEY?.trim()");

fixFile("src/components/ThemeClusters.tsx", /const apiKey = import\.meta\.env\.VITE_GEMINI_API_KEY;/g, "const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();");
fixFile("src/components/AISynthesisPanel.tsx", /const apiKey = import\.meta\.env\.VITE_GEMINI_API_KEY;/g, "const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();");
fixFile("src/components/InsightPrompts.tsx", /const apiKey = process\.env\.GEMINI_API_KEY;/g, "const apiKey = process.env.GEMINI_API_KEY?.trim();");

console.log("Trim script executed");
