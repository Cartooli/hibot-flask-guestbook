#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesPath = path.join(__dirname, '../hibot-code/templates.json');
const dryRun = process.argv.includes('--dry-run');
const push = process.argv.includes('--push');

if (!dryRun && !push) {
  console.error('Usage: node generate-template-readmes.js [--dry-run|--push]');
  process.exit(1);
}

const templates = JSON.parse(fs.readFileSync(templatesPath, 'utf8'));
const tutorialsUrl = 'https://code.hibot.space/edtech-tutorials.html';

function generateReadme(template) {
  const { name, title, description, stack, quickStart, repo } = template;

  return `# ${name}

> ${description}

Built with **${stack}**.

## Quick Start

${quickStart.map((step, i) => `${i + 1}. ${step}`).join('\n')}

## What You'll Learn

- Core concepts of ${stack}
- How ${name} is structured
- How to customize and deploy your own version

## See It Live

Open the demo and see it in action, then rebuild it your way on [code.hibot.space](${tutorialsUrl}).

## License

MIT. See LICENSE for details.

---

**Part of the [Hi Bot Code](https://code.hibot.space) starter templates.** Clone this, make it yours, and ship it.
`;
}

async function main() {
  console.log(`📝 Generating READMEs for ${templates.length} templates...\n`);

  for (const template of templates) {
    const { id, name, repo } = template;
    const readme = generateReadme(template);
    const repoPath = path.join(__dirname, '../../starter-templates', name);
    const readmePath = path.join(repoPath, 'README.md');

    if (dryRun) {
      console.log(`[DRY-RUN] Would update ${name}/README.md:`);
      console.log('---');
      console.log(readme);
      console.log('---\n');
      continue;
    }

    if (push) {
      // Verify repo directory exists
      if (!fs.existsSync(repoPath)) {
        console.error(`❌ Error: ${repoPath} not found`);
        process.exit(1);
      }

      try {
        // Write README
        fs.writeFileSync(readmePath, readme, 'utf8');
        console.log(`✓ Generated ${name}/README.md`);

        // Git operations
        execSync('git add README.md', { cwd: repoPath });

        // Check if there are changes to commit
        try {
          execSync('git diff --cached --exit-code', { cwd: repoPath, stdio: 'pipe' });
          console.log(`  (no changes to commit)`);
          continue;
        } catch {
          // Changes exist, proceed with commit
        }

        const commitMsg = 'docs: Update README from source of truth';
        execSync(`git commit -m "${commitMsg}"`, { cwd: repoPath });
        console.log(`✓ Committed to ${name}`);

        execSync('git push origin main', { cwd: repoPath });
        console.log(`✓ Pushed ${name} to GitHub\n`);
      } catch (err) {
        console.error(`❌ Error processing ${name}:`, err.message);
        process.exit(1);
      }
    }
  }

  if (dryRun) {
    console.log('✓ Dry-run complete. READMEs would be generated as shown above.');
    console.log('\nRun with --push to actually update repos:');
    console.log('  node scripts/generate-template-readmes.js --push');
  } else {
    console.log('✓ All READMEs updated and pushed!');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
