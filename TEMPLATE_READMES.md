# Template README Auto-Generation

This system keeps the READMEs in the five starter-template repos synchronized with `hibot-code/templates.json` — the single source of truth for template metadata.

## How It Works

1. **Source of truth**: `hibot-code/templates.json` contains metadata for all five templates (name, description, tech stack, quick-start steps, etc.)

2. **Generation**: A Node.js script parses the JSON and generates README.md for each template repo

3. **Automation**: GitHub Actions runs the script automatically when `templates.json` or `edtech-tutorials.html` changes on main

## Local Testing

### Dry-run (inspect what would be generated)

```bash
cd hibot-code
npm run generate-templates:dry
```

This prints the generated READMEs to stdout without modifying any files.

### Push (actually update repos)

```bash
cd hibot-code
npm run generate-templates:push
```

This will:
1. Generate README.md for each template based on `templates.json`
2. Commit the changes to each repo's main branch
3. Push to GitHub

**Requirements:**
- All five template repos must be checked out in `starter-templates/`
- You must have git credentials configured (SSH key or GitHub CLI)
- Or set `GITHUB_TOKEN` env var for HTTPS auth

```bash
export GITHUB_TOKEN=ghp_...
npm run generate-templates:push
```

## GitHub Actions

The workflow `.github/workflows/update-template-readmes.yml` automatically runs when:
- `hibot-code/templates.json` changes
- `hibot-code/edtech-tutorials.html` changes
- On manual trigger via `workflow_dispatch`

The workflow uses the repo's default `GITHUB_TOKEN` to authenticate and push to the template repos.

## Updating Template Data

To update a template's description, tech stack, or quick-start steps:

1. Edit `hibot-code/templates.json`
2. Test locally: `npm run generate-templates:dry`
3. Inspect the output
4. Push to main
5. GitHub Actions automatically updates all template repos

If you need to update `edtech-tutorials.html`, you'll also want to keep its template descriptions in sync with `templates.json` for consistency.

## Files

- **`hibot-code/templates.json`** — metadata source of truth
- **`scripts/generate-template-readmes.js`** — generator script (supports --dry-run, --push)
- **`.github/workflows/update-template-readmes.yml`** — GitHub Actions automation
- **`hibot-code/package.json`** — npm scripts for local runs
