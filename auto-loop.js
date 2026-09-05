import chokidar from 'chokidar';
import { execSync, exec } from 'child_process';
import { OpenAI } from 'openai'; // or Anthropic / Google AI SDK
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';

const apiKey = process.env.GEMINI_API_KEY || "";
export const genAI = new GoogleGenerativeAI(apiKey);
let isSelfHealing = false;

// 1. Watch src directory for file edits
const watcher = chokidar.watch('./src', { persistent: true, ignoreInitial: true });

console.log("⚡ Auto-Healing Loop Active. Waiting for AI code updates...");

watcher.on('change', async (filePath) => {
  if (isSelfHealing) return; // Prevent infinite re-triggering while agent is fixing
 
  console.log(`\n📝 File modified: ${filePath}. Running verification...`);
  runSelfHealingLoop(filePath);
});

async function runSelfHealingLoop(filePath, attempt = 1) {
  const MAX_ATTEMPTS = 8;
  isSelfHealing = true;

  if (attempt > MAX_ATTEMPTS) {
    console.error("❌ Max fix attempts reached. Stopping loop for human review.");
    isSelfHealing = false;
    return;
  }

  // 2. Execute verification suite automatically
  try {
    execSync('npm run type-check && npm test', { stdio: 'pipe' });
    console.log("✅ Verification Passed! Code is healthy.");
    execSync('git add . && git commit -m "auto-fix: verified working state"');
    isSelfHealing = false; // Reset lock
  } catch (error) {
    // 3. Catch error output (stderr/stdout)
    const errorOutput = error.stdout?.toString() + "\n" + error.stderr?.toString();
    console.log(`⚠️ Failure detected (Attempt ${attempt}/${MAX_ATTEMPTS}). Sending error to Agent...`);

    const currentCode = fs.readFileSync(filePath, 'utf-8');

    // 4. Send error back to LLM to overwrite the file
    const response = await genAI.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an automated code repair agent. Return ONLY the fully corrected raw code. Do not wrap in markdown or explain.'
        },
        {
          role: 'user',
          content: `The file ${filePath} produced this runtime error when tested:\n\n${errorOutput}\n\nCurrent code:\n${currentCode}`
        }
      ]
    });

    // 5. Overwrite file with AI fix & trigger re-test
    const fixedCode = response.choices[0].message.content.replace(/```[a-z]*\n?/gi, '').trim();
    fs.writeFileSync(filePath, fixedCode);
   
    // Graph Loop Node: Re-run recursively
    setTimeout(() => runSelfHealingLoop(filePath, attempt + 1), 1000);
  }
}
