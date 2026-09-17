import fs from "node:fs";
import path from "node:path";

const tokensPath = path.resolve("tokens/createui.json");
const tokensData = JSON.parse(fs.readFileSync(tokensPath, "utf8"));

// Collect valid token names
const validTokens = new Set();
for (const cat of Object.values(tokensData.tokens)) {
  for (const tokenName of Object.keys(cat)) {
    validTokens.add(tokenName);
  }
}
for (const scaleGroup of Object.values(tokensData.scales)) {
  for (const tokenName of Object.keys(scaleGroup)) {
    validTokens.add(tokenName);
  }
}

// Additional allowed framework & component tokens
validTokens.add("--theme");
validTokens.add("--theme-color");
validTokens.add("--ring");
validTokens.add("--slider-pct");
validTokens.add("--cui-split");
validTokens.add("--cui-scroller-max");
validTokens.add("--cui-compare");

const files = process.argv.slice(2);
if (files.length === 0) {
  console.log("Usage: node scripts/lint-tokens.mjs <file1.sass> [file2.sass...]");
  process.exit(0);
}

let totalErrors = 0;

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.warn(`File not found: ${file}`);
    continue;
  }

  const content = fs.readFileSync(file, "utf8");
  const lines = content.split("\n");
  const fileErrors = [];

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    // Strip comments
    const cleanLine = line.replace(/\/\/.*$/, "").trim();
    if (!cleanLine) return;

    // Rule 1: No Raw Hex
    const hexMatch = cleanLine.match(/#[0-9a-fA-F]{3,8}\b/);
    if (hexMatch) {
      fileErrors.push(`Line ${lineNum}: Raw hex code forbidden: "${hexMatch[0]}"`);
    }

    // Rule 2: No Hardcoded Pixels (allow 1px, 2px for borders/outlines and svg viewBox)
    const pxMatches = cleanLine.matchAll(/(?<![0-9])([3-9]|\d{2,})px\b/g);
    for (const m of pxMatches) {
      // Allow 8px, -5px, -4px for popup arrow triangle geometry
      if (file.includes("popup.sass") && ["8px"].includes(m[0])) continue;
      fileErrors.push(`Line ${lineNum}: Hardcoded pixel dimension forbidden: "${m[0]}" (use --space-*, --radius-*, or --text-*)`);
    }

    // Rule 3: Strict Surface Rule (Reject --bg-surface)
    if (cleanLine.includes("--bg-surface")) {
      fileErrors.push(`Line ${lineNum}: Forbidden "--bg-surface" detected. Enforce var(--bg).`);
    }

    // Rule 4: Unmapped Variable Check
    const varMatches = cleanLine.matchAll(/var\((--[a-zA-Z0-9_-]+)/g);
    for (const vm of varMatches) {
      const varName = vm[1];
      if (!validTokens.has(varName)) {
        fileErrors.push(`Line ${lineNum}: Unmapped token "${varName}" not found in createui.json`);
      }
    }
  });

  if (fileErrors.length > 0) {
    console.error(`\n❌ Token lint failed for ${file}:`);
    fileErrors.forEach(err => console.error(`   ${err}`));
    totalErrors += fileErrors.length;
  } else {
    console.log(`✓ ${path.basename(file)} passed token lint.`);
  }
}

if (totalErrors > 0) {
  console.error(`\nFound ${totalErrors} token lint errors.`);
  process.exit(1);
} else {
  console.log("\nAll component stylesheets passed token linter!");
  process.exit(0);
}
