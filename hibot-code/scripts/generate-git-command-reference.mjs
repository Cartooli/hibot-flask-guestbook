#!/usr/bin/env node
/**
 * One-shot generator for git-command-reference.html
 * Run: node scripts/generate-git-command-reference.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'git-command-reference.html');

let idCounter = 0;
function nextId() {
  return 'cmd-' + (++idCounter);
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function card({ cmd, plain, code, note, tags = 'daily', danger = false }) {
  const cid = nextId();
  const badge = danger ? '<span class="badge bad">careful</span>' : '';
  const codeText = code || cmd;
  return `
            <details class="cmd-card" data-tags="${esc(tags)}">
              <summary><code class="cmd">${esc(cmd)}</code>${badge}<span class="chev" aria-hidden="true">&#x2304;</span></summary>
              <div class="detail-body">
                <p class="plain"><strong>In plain English:</strong> ${plain}</p>
                <div class="codebox">
                  <div class="codebar"><span>Terminal</span><button class="btn" type="button" data-copy="#${cid}">Copy</button></div>
                  <pre id="${cid}">${esc(codeText)}</pre>
                </div>
                ${note ? `<p class="note">${note}</p>` : ''}
              </div>
            </details>`;
}

function workflowCard({ title, plain, code, tags = 'workflow', danger = false }) {
  const cid = nextId();
  const badge = danger ? '<span class="badge bad">careful</span>' : '';
  return `
            <details class="cmd-card workflow-card" data-tags="${esc(tags)}">
              <summary><span class="wf-title">${esc(title)}</span>${badge}<span class="chev" aria-hidden="true">&#x2304;</span></summary>
              <div class="detail-body">
                <p class="plain"><strong>In plain English:</strong> ${plain}</p>
                <div class="codebox">
                  <div class="codebar"><span>Terminal</span><button class="btn" type="button" data-copy="#${cid}">Copy</button></div>
                  <pre id="${cid}">${esc(code)}</pre>
                </div>
              </div>
            </details>`;
}

function section({ id, num, title, intro, cards }) {
  return `
        <section class="section-block" id="${id}">
          <h2>${num}. ${title}</h2>
          <p class="section-intro">${intro}</p>
          <div class="steps">${cards.join('\n')}</div>
        </section>`;
}

const sections = [
  section({
    id: 'setup',
    num: 1,
    title: 'Setup and identity',
    intro: 'Tell Git who you are and set a few defaults before your first commit.',
    cards: [
      card({ cmd: 'git config --global user.name "Your Name"', plain: 'Sets the name that appears on your commits, like signing your work.', code: 'git config --global user.name "Your Name"', tags: 'setup' }),
      card({ cmd: 'git config --global user.email "you@example.com"', plain: 'Sets the email tied to your commits. Use the same email as your GitHub account when possible.', code: 'git config --global user.email "you@example.com"', tags: 'setup' }),
      card({ cmd: 'git config --global init.defaultBranch main', plain: 'Makes new repositories start with a branch named main instead of master.', tags: 'setup' }),
      card({ cmd: 'git config --global pull.rebase false', plain: 'When you pull, Git merges by default instead of rebasing. A simple default for beginners.', tags: 'setup' }),
      card({ cmd: 'git config --global core.editor "code --wait"', plain: 'Opens VS Code when Git needs you to write a longer message (for example during a rebase).', tags: 'setup' }),
      card({ cmd: 'git config --list', plain: 'Shows every Git setting currently in effect.', tags: 'setup daily' }),
      card({ cmd: 'git config user.name', plain: 'Shows just your configured user name.', tags: 'setup' }),
      card({ cmd: 'git config user.email', plain: 'Shows just your configured email.', tags: 'setup' }),
    ],
  }),
  section({
    id: 'starting',
    num: 2,
    title: 'Starting a repository',
    intro: 'Create a new project folder under Git, or copy an existing project from GitHub.',
    cards: [
      workflowCard({ title: 'Create a new local repo', plain: 'Make a folder, step into it, and turn it into a Git project.', code: 'mkdir my-project\ncd my-project\ngit init', tags: 'setup workflow' }),
      card({ cmd: 'git clone https://github.com/user/repo.git', plain: 'Downloads a copy of a remote repository to your computer.', tags: 'setup remote' }),
      workflowCard({ title: 'Clone into a custom folder', plain: 'Same as clone, but puts the files in a folder name you choose.', code: 'git clone https://github.com/user/repo.git my-folder\ncd my-folder', tags: 'setup remote' }),
      card({ cmd: 'git clone -b branch-name https://github.com/user/repo.git', plain: 'Clones only a specific branch instead of the default one.', tags: 'setup remote branch' }),
    ],
  }),
  section({
    id: 'status-history',
    num: 3,
    title: 'Checking status and history',
    intro: 'See what changed and browse past snapshots of your project.',
    cards: [
      card({ cmd: 'git status', plain: 'Answers: which files changed, which are staged, and which branch you are on.', tags: 'daily' }),
      card({ cmd: 'git status -s', plain: 'A shorter, one-line-per-file status view.', tags: 'daily' }),
      card({ cmd: 'git log', plain: 'Lists past commits with messages, authors, and dates.', tags: 'daily' }),
      card({ cmd: 'git log --oneline', plain: 'Compact history — one short line per commit.', tags: 'daily' }),
      card({ cmd: 'git log --oneline --graph --all --decorate', plain: 'Shows branches and merges as a text diagram — great for understanding structure.', tags: 'daily branch' }),
      card({ cmd: 'git log -5 --oneline', plain: 'Shows only the five most recent commits.', tags: 'daily' }),
      card({ cmd: 'git show <commit-hash>', plain: 'Opens one specific commit and the exact changes it introduced.', tags: 'daily' }),
    ],
  }),
  section({
    id: 'staging-commit',
    num: 4,
    title: 'Staging and committing',
    intro: 'Choose what goes into the next snapshot, then save that snapshot with a message.',
    cards: [
      card({ cmd: 'git add file.txt', plain: 'Stages one file — marks it ready for the next commit.', tags: 'daily' }),
      card({ cmd: 'git add .', plain: 'Stages every changed file in the current folder and subfolders.', tags: 'daily' }),
      card({ cmd: 'git add -u', plain: 'Stages only files Git already tracks — skips brand-new untracked files.', tags: 'daily' }),
      card({ cmd: 'git add -p', plain: 'Walks you through changes hunk by hunk so you can stage only part of a file.', tags: 'daily' }),
      card({ cmd: 'git commit -m "Describe the change"', plain: 'Saves staged changes as a permanent snapshot with a short message.', tags: 'daily' }),
      card({ cmd: 'git commit -am "Describe the change"', plain: 'Stages all tracked modified files and commits in one step. Does not include new untracked files.', note: 'Note: <code>commit -am</code> does not include new untracked files.', tags: 'daily' }),
      card({ cmd: 'git commit --amend', plain: 'Rewrites your most recent commit — useful right before you push.', tags: 'daily undo', danger: true }),
      card({ cmd: 'git commit --amend -m "New message"', plain: 'Changes only the message on your last commit.', tags: 'daily undo', danger: true }),
      workflowCard({ title: 'Add a forgotten file to last commit', plain: 'Stage the missing file and fold it into the previous commit without changing the message.', code: 'git add forgotten-file.txt\ngit commit --amend --no-edit', tags: 'daily undo', danger: true }),
    ],
  }),
  section({
    id: 'comparing',
    num: 5,
    title: 'Comparing changes',
    intro: 'See exactly what lines changed before you commit or merge.',
    cards: [
      card({ cmd: 'git diff', plain: 'Shows unstaged edits — what you changed but have not added yet.', tags: 'daily' }),
      card({ cmd: 'git diff --staged', plain: 'Shows what is staged and ready to commit. Same as <code>--cached</code>.', code: 'git diff --staged', tags: 'daily' }),
      card({ cmd: 'git diff --cached', plain: 'Alternate flag for staged changes.', tags: 'daily' }),
      card({ cmd: 'git diff main..feature-branch', plain: 'Compares two branches to see what would change if you merged.', tags: 'daily branch' }),
      card({ cmd: 'git diff <commit1> <commit2>', plain: 'Compares any two points in history.', tags: 'daily' }),
      card({ cmd: 'git diff --name-only', plain: 'Lists only file names that differ — no line-by-line detail.', tags: 'daily' }),
    ],
  }),
  section({
    id: 'branches',
    num: 6,
    title: 'Branches',
    intro: 'Work on a separate line of development without disturbing main.',
    cards: [
      card({ cmd: 'git branch', plain: 'Lists local branches. The current one is marked with an asterisk.', tags: 'branch daily' }),
      card({ cmd: 'git branch -a', plain: 'Lists local and remote branches.', tags: 'branch' }),
      card({ cmd: 'git branch feature-name', plain: 'Creates a new branch but does not switch to it yet.', tags: 'branch' }),
      card({ cmd: 'git switch feature-name', plain: 'Moves you to another branch. Modern replacement for checkout.', tags: 'branch daily' }),
      card({ cmd: 'git checkout feature-name', plain: 'Older syntax — still common — to switch branches.', tags: 'branch' }),
      card({ cmd: 'git switch -c feature-name', plain: 'Creates a branch and switches to it in one step.', tags: 'branch daily workflow' }),
      card({ cmd: 'git checkout -b feature-name', plain: 'Older syntax for create-and-switch.', tags: 'branch workflow' }),
      card({ cmd: 'git branch -m new-branch-name', plain: 'Renames the branch you are currently on.', tags: 'branch' }),
      card({ cmd: 'git branch -d branch-name', plain: 'Deletes a merged local branch safely.', tags: 'branch' }),
      card({ cmd: 'git branch -D branch-name', plain: 'Force-deletes a branch even if it is not fully merged.', tags: 'branch danger', danger: true }),
    ],
  }),
  section({
    id: 'remotes',
    num: 7,
    title: 'Working with remotes',
    intro: 'Connect your local repo to GitHub, GitLab, or another hosted copy.',
    cards: [
      card({ cmd: 'git remote -v', plain: 'Shows remote names and their URLs.', tags: 'remote' }),
      card({ cmd: 'git remote add origin https://github.com/user/repo.git', plain: 'Links your local repo to a remote named origin.', tags: 'remote setup' }),
      card({ cmd: 'git remote set-url origin https://github.com/user/repo.git', plain: 'Changes where origin points — for example after moving a repo.', tags: 'remote' }),
      card({ cmd: 'git remote remove origin', plain: 'Removes the origin remote connection.', tags: 'remote' }),
      card({ cmd: 'git fetch', plain: 'Downloads new commits from the remote without changing your files yet.', tags: 'remote daily' }),
      card({ cmd: 'git fetch --all', plain: 'Fetches from every configured remote.', tags: 'remote' }),
      card({ cmd: 'git fetch --prune', plain: 'Removes stale remote-tracking branches that were deleted on the server.', tags: 'remote' }),
    ],
  }),
  section({
    id: 'push-pull',
    num: 8,
    title: 'Push and pull',
    intro: 'Send your commits upstream or bring teammates\' work down to your machine.',
    cards: [
      card({ cmd: 'git push', plain: 'Uploads your current branch commits to the matching remote branch.', tags: 'remote daily workflow' }),
      card({ cmd: 'git push -u origin feature-name', plain: 'First push of a new branch — also sets upstream so later pushes can be just <code>git push</code>.', tags: 'remote workflow' }),
      card({ cmd: 'git push origin main', plain: 'Pushes your main branch explicitly to origin.', tags: 'remote' }),
      card({ cmd: 'git pull', plain: 'Fetches and merges remote changes into your current branch. Same as fetch + merge.', tags: 'remote daily workflow' }),
      workflowCard({ title: 'Pull = fetch + merge', plain: 'What pull does under the hood.', code: 'git fetch\ngit merge', tags: 'remote daily' }),
      card({ cmd: 'git pull --rebase', plain: 'Replays your local commits on top of remote changes for a straighter history.', code: 'git pull --rebase', tags: 'remote branch danger', danger: true }),
      workflowCard({ title: 'Pull with rebase = fetch + rebase', plain: 'Equivalent steps when you pass --rebase.', code: 'git fetch\ngit rebase origin/main', tags: 'remote' }),
      card({ cmd: 'git push --force-with-lease', plain: 'Overwrites the remote branch only if nobody else pushed since you last fetched — safer than --force.', tags: 'remote danger', danger: true }),
      card({ cmd: 'git push --force', plain: 'Overwrites remote history regardless. Can destroy teammates\' work.', note: 'Prefer <code>--force-with-lease</code> instead.', tags: 'remote danger', danger: true }),
    ],
  }),
  section({
    id: 'merging',
    num: 9,
    title: 'Merging',
    intro: 'Combine another branch into the one you are on.',
    cards: [
      workflowCard({ title: 'Merge feature into main', plain: 'Classic flow: update main, merge your feature, push.', code: 'git switch main\ngit pull\ngit merge feature-name\ngit push', tags: 'branch workflow' }),
      card({ cmd: 'git merge branch-name', plain: 'Brings another branch\'s commits into your current branch.', tags: 'branch workflow' }),
      card({ cmd: 'git merge --abort', plain: 'Cancels a conflicted merge and returns to the pre-merge state.', tags: 'branch undo' }),
      card({ cmd: 'git merge --no-ff feature-name', plain: 'Always creates a merge commit even when a fast-forward is possible — preserves branch history.', tags: 'branch' }),
    ],
  }),
  section({
    id: 'rebasing',
    num: 10,
    title: 'Rebasing',
    intro: 'Replay your commits on top of another branch for a linear history. Rewrites commits — use with care.',
    cards: [
      workflowCard({ title: 'Rebase feature onto main', plain: 'Move your branch to start from the latest main.', code: 'git switch feature-name\ngit fetch origin\ngit rebase origin/main', tags: 'branch danger workflow', danger: true }),
      workflowCard({ title: 'Continue after resolving conflicts', plain: 'After fixing conflict markers, stage files and tell Git to keep rebasing.', code: 'git add .\ngit rebase --continue', tags: 'branch undo danger', danger: true }),
      card({ cmd: 'git rebase --abort', plain: 'Stops the rebase and restores the branch to how it was before.', tags: 'branch undo danger', danger: true }),
      card({ cmd: 'git rebase -i HEAD~3', plain: 'Interactive rebase on the last three commits — squash, reorder, edit, or drop commits.', tags: 'branch danger undo', danger: true }),
      workflowCard({
        title: 'Interactive rebase actions',
        plain: 'Common verbs you pick in the rebase editor.',
        code: 'pick    use commit\nreword  change commit message\nedit    stop to amend commit\nsquash  combine with previous commit\nfixup   combine and discard message\ndrop    remove commit',
        tags: 'branch',
      }),
    ],
  }),
  section({
    id: 'undoing',
    num: 11,
    title: 'Undoing things safely',
    intro: 'Unstage, discard, reset, or revert — pick the tool that matches whether work is shared.',
    cards: [
      card({ cmd: 'git restore --staged file.txt', plain: 'Removes a file from the staging area but keeps your edits in the file.', tags: 'undo daily' }),
      card({ cmd: 'git reset HEAD file.txt', plain: 'Older way to unstage one file.', tags: 'undo' }),
      card({ cmd: 'git restore file.txt', plain: 'Throws away unstaged changes in one file — back to last commit.', tags: 'undo daily', danger: true }),
      card({ cmd: 'git checkout -- file.txt', plain: 'Older syntax to discard changes in one file.', tags: 'undo danger', danger: true }),
      card({ cmd: 'git restore .', plain: 'Discards all unstaged changes in the current directory.', tags: 'undo danger', danger: true }),
      card({ cmd: 'git reset --mixed HEAD~1', plain: 'Moves branch back one commit; changes become unstaged edits in your working folder.', tags: 'undo danger', danger: true }),
      card({ cmd: 'git reset --soft HEAD~1', plain: 'Moves branch back one commit but keeps changes staged.', tags: 'undo danger', danger: true }),
      card({ cmd: 'git reset --hard HEAD~1', plain: 'Deletes the last commit and all its changes from your working tree.', note: 'Dangerous. May be recoverable via reflog if recent.', tags: 'undo danger', danger: true }),
      card({ cmd: 'git revert <commit-hash>', plain: 'Creates a new commit that undoes a past commit — safe for shared history.', tags: 'undo daily workflow' }),
    ],
  }),
  section({
    id: 'stashing',
    num: 12,
    title: 'Stashing temporary work',
    intro: 'Set unfinished work aside in a drawer so you can switch branches cleanly.',
    cards: [
      card({ cmd: 'git stash', plain: 'Temporarily shelves uncommitted changes so your working tree is clean.', tags: 'daily workflow' }),
      card({ cmd: 'git stash push -m "WIP before switching branches"', plain: 'Same as stash, but labels the stash so you remember why.', tags: 'workflow' }),
      card({ cmd: 'git stash -u', plain: 'Also stashes untracked files, not just tracked edits.', tags: 'workflow' }),
      card({ cmd: 'git stash list', plain: 'Shows every saved stash.', tags: 'daily' }),
      card({ cmd: 'git stash apply', plain: 'Re-applies the latest stash but keeps a copy in the stash list.', tags: 'daily' }),
      card({ cmd: 'git stash pop', plain: 'Applies the latest stash and removes it from the list.', tags: 'daily workflow' }),
      card({ cmd: 'git stash apply stash@{2}', plain: 'Applies a specific stash by its index.', tags: 'daily' }),
      card({ cmd: 'git stash drop stash@{0}', plain: 'Deletes one stash entry.', tags: 'undo' }),
      card({ cmd: 'git stash clear', plain: 'Deletes every stash.', tags: 'danger undo', danger: true }),
    ],
  }),
  section({
    id: 'tags',
    num: 13,
    title: 'Tags and releases',
    intro: 'Mark important points in history — like v1.0.0 — for releases.',
    cards: [
      card({ cmd: 'git tag', plain: 'Lists tags in the repository.', tags: 'remote' }),
      card({ cmd: 'git tag v1.0.0', plain: 'Creates a lightweight tag at the current commit.', tags: 'remote' }),
      card({ cmd: 'git tag -a v1.0.0 -m "Release v1.0.0"', plain: 'Creates an annotated tag with a message — better for releases.', tags: 'remote' }),
      card({ cmd: 'git push origin v1.0.0', plain: 'Publishes one tag to the remote.', tags: 'remote' }),
      card({ cmd: 'git push --tags', plain: 'Pushes all local tags.', tags: 'remote' }),
      card({ cmd: 'git tag -d v1.0.0', plain: 'Deletes a tag locally.', tags: 'undo' }),
      card({ cmd: 'git push origin --delete v1.0.0', plain: 'Deletes a tag on the remote.', tags: 'remote undo' }),
    ],
  }),
  section({
    id: 'cleaning',
    num: 14,
    title: 'Cleaning files',
    intro: 'Remove untracked files Git is not managing. Read carefully before running.',
    cards: [
      card({ cmd: 'git clean -n', plain: 'Dry run — shows what would be deleted without deleting anything.', tags: 'undo' }),
      card({ cmd: 'git clean -f', plain: 'Deletes untracked files.', tags: 'danger', danger: true }),
      card({ cmd: 'git clean -fd', plain: 'Deletes untracked files and folders.', tags: 'danger', danger: true }),
      card({ cmd: 'git clean -fdx', plain: 'Also deletes ignored files like build outputs and node_modules.', note: 'Very dangerous. Can remove dependency folders and local build artifacts.', tags: 'danger', danger: true }),
    ],
  }),
  section({
    id: 'gitignore',
    num: 15,
    title: 'Tracking files and .gitignore',
    intro: 'Tell Git which files to ignore and stop tracking secrets or build output.',
    cards: [
      workflowCard({
        title: 'Create .gitignore',
        plain: 'A text file listing paths Git should never track.',
        code: 'touch .gitignore\n\n# Common entries:\nnode_modules/\n.env\n.DS_Store\ndist/\nbuild/\n*.log',
        tags: 'setup',
      }),
      card({ cmd: 'git rm --cached file.txt', plain: 'Stops tracking a file but leaves it on your disk.', tags: 'daily' }),
      workflowCard({
        title: 'Stop tracking a folder',
        plain: 'Untrack a whole directory, update gitignore, commit.',
        code: 'git rm -r --cached folder-name/\ngit add .gitignore\ngit commit -m "Update gitignore"',
        tags: 'daily',
      }),
    ],
  }),
  section({
    id: 'finding',
    num: 16,
    title: 'Finding things',
    intro: 'Search code, blame lines, and hunt commits by message or content.',
    cards: [
      card({ cmd: 'git grep "search term"', plain: 'Searches tracked files for text — like grep but respects Git\'s view of the repo.', tags: 'daily' }),
      card({ cmd: 'git blame file.txt', plain: 'Shows who last changed each line and in which commit.', tags: 'daily' }),
      card({ cmd: 'git log --grep="bug fix"', plain: 'Finds commits whose messages contain a phrase.', tags: 'daily' }),
      card({ cmd: 'git log -S "functionName"', plain: 'Finds commits that added or removed a specific string.', tags: 'daily' }),
      card({ cmd: 'git log -- file.txt', plain: 'Shows commit history that touched one file.', tags: 'daily' }),
    ],
  }),
  section({
    id: 'reflog',
    num: 17,
    title: 'Reflog: recover lost work',
    intro: 'Git keeps a journal of where your HEAD and branches have been — a safety net after mistakes.',
    cards: [
      card({ cmd: 'git reflog', plain: 'Lists recent branch movements — your undo history for local actions.', tags: 'undo daily' }),
      card({ cmd: 'git reset --hard <reflog-hash>', plain: 'Jumps your branch back to an earlier reflog entry.', tags: 'undo danger', danger: true }),
      card({ cmd: 'git branch rescue-branch <reflog-hash>', plain: 'Creates a new branch pointing at recovered work without moving your current branch.', tags: 'undo' }),
    ],
  }),
  section({
    id: 'cherry-pick',
    num: 18,
    title: 'Cherry-picking',
    intro: 'Copy one specific commit from another branch onto your current branch.',
    cards: [
      card({ cmd: 'git cherry-pick <commit-hash>', plain: 'Applies a single commit\'s changes here.', tags: 'branch' }),
      card({ cmd: 'git cherry-pick <hash1> <hash2>', plain: 'Applies several commits in order.', tags: 'branch' }),
      card({ cmd: 'git cherry-pick --abort', plain: 'Cancels a conflicted cherry-pick.', tags: 'undo' }),
    ],
  }),
  section({
    id: 'submodules',
    num: 19,
    title: 'Submodules',
    intro: 'Repos that embed other repos — common in larger projects. Optional until you need them.',
    cards: [
      card({ cmd: 'git clone --recurse-submodules https://github.com/user/repo.git', plain: 'Clones a repo and its nested sub-repositories in one go.', tags: 'remote setup' }),
      card({ cmd: 'git submodule update --init --recursive', plain: 'Fetches submodules after a plain clone.', tags: 'remote' }),
      card({ cmd: 'git submodule add https://github.com/user/library.git path/to/library', plain: 'Embeds another repo at a path inside yours.', tags: 'setup' }),
      card({ cmd: 'git submodule update --remote', plain: 'Updates submodules to the latest commit on their tracked branch.', tags: 'remote' }),
    ],
  }),
];

const workflows = [
  workflowCard({ title: 'New project to GitHub', plain: 'From empty folder to first push on main.', code: 'mkdir my-project\ncd my-project\ngit init\ngit add .\ngit commit -m "Initial commit"\ngit branch -M main\ngit remote add origin https://github.com/user/repo.git\ngit push -u origin main', tags: 'workflow setup' }),
  workflowCard({ title: 'Clone, edit, commit, push', plain: 'Day-one contributor flow on a feature branch.', code: 'git clone https://github.com/user/repo.git\ncd repo\ngit switch -c feature/my-change\n# edit files\ngit status\ngit add .\ngit commit -m "Add my change"\ngit push -u origin feature/my-change', tags: 'workflow daily' }),
  workflowCard({ title: 'Update your local main branch', plain: 'Get the latest main from the server.', code: 'git switch main\ngit pull', tags: 'workflow daily' }),
  workflowCard({ title: 'Update main (explicit)', plain: 'Safer two-step version — fetch first, then merge.', code: 'git switch main\ngit fetch origin\ngit merge origin/main', tags: 'workflow daily' }),
  workflowCard({ title: 'Create feature branch from latest main', plain: 'Start new work from an up-to-date main.', code: 'git switch main\ngit pull\ngit switch -c feature/new-thing', tags: 'workflow daily' }),
  workflowCard({ title: 'Update feature with merge', plain: 'Bring main into your feature branch via merge.', code: 'git switch feature/new-thing\ngit fetch origin\ngit merge origin/main', tags: 'workflow branch' }),
  workflowCard({ title: 'Update feature with rebase', plain: 'Replay your commits on top of latest main.', code: 'git switch feature/new-thing\ngit fetch origin\ngit rebase origin/main\ngit push --force-with-lease', tags: 'workflow branch danger', danger: true }),
  workflowCard({ title: 'Finish feature with merge', plain: 'Land the feature on main and delete the branch.', code: 'git switch main\ngit pull\ngit merge feature/new-thing\ngit push\ngit branch -d feature/new-thing', tags: 'workflow' }),
  workflowCard({ title: 'Fix mistake before committing', plain: 'Review and discard or unstage before commit.', code: 'git status\ngit diff\ngit restore file.txt\n# or unstage:\ngit restore --staged file.txt', tags: 'workflow undo daily' }),
  workflowCard({ title: 'Fix last commit before pushing', plain: 'Amend message or contents while still local.', code: 'git add .\ngit commit --amend --no-edit\n# or change message:\ngit commit --amend -m "Better commit message"', tags: 'workflow undo', danger: true }),
  workflowCard({ title: 'Undo a pushed commit safely', plain: 'Use revert — does not rewrite shared history.', code: 'git revert <commit-hash>\ngit push', tags: 'workflow undo daily' }),
  workflowCard({ title: 'Committed to main by mistake', plain: 'Rescue work onto a branch and reset main.', code: 'git branch feature/save-my-work\ngit reset --hard origin/main\ngit switch feature/save-my-work', tags: 'workflow undo danger', danger: true }),
  workflowCard({ title: 'Save work and switch branches', plain: 'Stash, switch, come back and pop.', code: 'git stash push -m "WIP"\ngit switch other-branch\n# later:\ngit switch original-branch\ngit stash pop', tags: 'workflow daily' }),
  workflowCard({ title: 'Resolve merge conflicts', plain: 'Fix markers, stage, commit.', code: 'git status\n# open conflicted files and fix them\ngit add .\ngit commit', tags: 'workflow branch' }),
  workflowCard({ title: 'Resolve rebase conflicts', plain: 'Fix, stage, continue — or abort.', code: 'git status\n# fix files\ngit add .\ngit rebase --continue\n# abort if needed:\ngit rebase --abort', tags: 'workflow branch danger', danger: true }),
  workflowCard({ title: 'Squash last 3 commits', plain: 'Interactive rebase then force-push with lease.', code: 'git rebase -i HEAD~3\n# keep first as pick, others squash or fixup\ngit push --force-with-lease', tags: 'workflow danger undo', danger: true }),
  workflowCard({ title: 'Delete local and remote branch', plain: 'Clean up after merge.', code: 'git branch -d feature/old-branch\ngit push origin --delete feature/old-branch', tags: 'workflow branch' }),
];

const dailyCombos = [
  { title: 'Where am I and what changed?', cmds: 'git branch\ngit status\ngit diff', tags: 'daily' },
  { title: 'Save my work', cmds: 'git add .\ngit commit -m "Meaningful message"', tags: 'daily workflow' },
  { title: 'Get latest code', cmds: 'git pull\n# or:\ngit fetch origin\ngit merge origin/main', tags: 'daily workflow' },
  { title: 'Start new work safely', cmds: 'git switch main\ngit pull\ngit switch -c feature/name', tags: 'workflow daily' },
  { title: 'Review before committing', cmds: 'git status\ngit diff\ngit add -p\ngit diff --staged\ngit commit -m "Message"', tags: 'daily' },
  { title: 'Push a new branch', cmds: 'git push -u origin feature/name', tags: 'workflow remote' },
  { title: 'Switch branches mid-work', cmds: 'git stash -u\ngit switch other-branch', tags: 'workflow daily' },
  { title: 'Bring branch up to date', cmds: 'git fetch origin\ngit rebase origin/main', tags: 'workflow branch danger', danger: true },
  { title: 'Undo last local commit, keep work', cmds: 'git reset --soft HEAD~1', tags: 'undo danger', danger: true },
  { title: 'Throw away all local changes', cmds: 'git reset --hard\ngit clean -fd', tags: 'danger undo', danger: true },
];

const dangerous = [
  { cmd: 'git reset --hard', alt: 'Use revert for shared commits; soft/mixed reset locally' },
  { cmd: 'git clean -fd', alt: 'Run git clean -n first (dry run)' },
  { cmd: 'git clean -fdx', alt: 'Never on a repo with local env or build dirs you need' },
  { cmd: 'git push --force', alt: 'git push --force-with-lease' },
  { cmd: 'git rebase', alt: 'Merge instead if others share your branch' },
  { cmd: 'git branch -D', alt: 'git branch -d after merge' },
  { cmd: 'git stash clear', alt: 'git stash drop stash@{n} one at a time' },
];

const toc = sections.map((s) => {
  const m = s.match(/id="([^"]+)"/);
  const h = s.match(/<h2>(\d+\. [^<]+)<\/h2>/);
  return m && h ? `<a href="#${m[1]}">${h[1]}</a>` : '';
}).filter(Boolean);

const dailyHtml = dailyCombos.map((d, i) => {
  const cid = nextId();
  const badge = d.danger ? '<span class="badge bad">careful</span>' : '';
  return `<div class="combo-item" data-tags="${d.tags}">
    <div class="combo-h">${esc(d.title)}${badge}</div>
    <div class="codebox compact">
      <div class="codebar"><span>Combo</span><button class="btn" type="button" data-copy="#${cid}">Copy</button></div>
      <pre id="${cid}">${esc(d.cmds)}</pre>
    </div>
  </div>`;
}).join('\n');

const dangerHtml = dangerous.map((d) =>
  `<div class="danger-row"><code>${esc(d.cmd)}</code><span class="danger-alt">Safer: ${esc(d.alt)}</span></div>`
).join('\n');

const beginnerWorkflowId = nextId();
const mainSectionsHtml = sections.join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <link rel="stylesheet" href="/assets/fonts/fonts.css">
  <link rel="stylesheet" href="/assets/hibot-theme.css">

  <title>Git Command Reference &amp; Cheat Sheet — Commands, Workflows &amp; Plain-English Guide | code.hibot.space</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="description" content="Git commands cheat sheet with plain-English explanations for beginners. Copy-paste reference for status, commit, branch, merge, push, pull, undo, and daily workflows." />
  <meta name="keywords" content="git cheat sheet, git commands, git for beginners, git reference, git workflow, git clone, git commit, git branch, git merge, git rebase, git pull, git push" />
  <meta name="author" content="code.hibot.space" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://code.hibot.space/git-command-reference.html" />

  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://code.hibot.space/git-command-reference.html" />
  <meta property="og:title" content="Git Command Reference &amp; Cheat Sheet" />
  <meta property="og:description" content="Everyday Git commands with plain-English explanations. Copy, search, and learn — free reference for new developers." />
  <meta property="og:image" content="https://code.hibot.space/get-started-coding-og.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Git Command Reference &amp; Cheat Sheet" />
  <meta name="twitter:description" content="Git commands with plain-English explanations. Searchable cheat sheet for beginners and daily use." />
  <meta name="twitter:image" content="https://code.hibot.space/get-started-coding-og.png" />

  <link rel="icon" type="image/svg+xml" href="favicon.svg" />
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": "Git Command Reference & Cheat Sheet",
    "description": "Searchable Git command reference with plain-English explanations, workflows, and safety notes for beginners.",
    "url": "https://code.hibot.space/git-command-reference.html",
    "author": { "@type": "Organization", "name": "code.hibot.space" },
    "about": { "@type": "Thing", "name": "Git" },
    "isAccessibleForFree": true
  }
  </script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {"@type": "Question", "name": "What does git status do?", "acceptedAnswer": {"@type": "Answer", "text": "It shows which branch you are on, which files changed, and what is staged for the next commit."}},
      {"@type": "Question", "name": "What does git pull do?", "acceptedAnswer": {"@type": "Answer", "text": "It downloads new commits from the remote and merges them into your current branch."}},
      {"@type": "Question", "name": "What is the difference between git merge and git rebase?", "acceptedAnswer": {"@type": "Answer", "text": "Merge combines branches with a merge commit. Rebase replays your commits on top of another branch for linear history but rewrites commits."}},
      {"@type": "Question", "name": "How do I undo a commit safely after pushing?", "acceptedAnswer": {"@type": "Answer", "text": "Use git revert <commit-hash> to create a new commit that undoes the change, then push."}},
      {"@type": "Question", "name": "What does git stash do?", "acceptedAnswer": {"@type": "Answer", "text": "It temporarily shelves uncommitted work so you can switch branches with a clean working tree."}}
    ]
  }
  </script>
  <style>
    :root {
      --bg: #0A0A0A; --ink: #E8E8E3; --muted: #8B95A1; --accent: #F5A524;
      --accent-dim: rgba(245,165,36,.14); --panel: #111418; --panel-2: #1B1F26;
      --border: rgba(139,149,161,.22); --border-hover: rgba(139,149,161,.45);
      --radius: 14px; --radius-sm: 8px; --shadow: 0 8px 30px rgba(0,0,0,.35);
      --font-ui: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif;
      --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Courier New", monospace;
      --good: #22c55e; --bad: #ef4444;
    }
    *, *::before, *::after { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { margin: 0; background: var(--bg); color: var(--ink); font-family: var(--font-ui); line-height: 1.6; -webkit-font-smoothing: antialiased; }
    .site-nav { position: sticky; top: 0; z-index: 100; background: rgba(10,10,10,.94); backdrop-filter: blur(16px); border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 20px; height: 50px; }
    .site-nav a.home-link { display: flex; align-items: center; gap: 7px; text-decoration: none; color: var(--accent); font-weight: 800; font-size: 14px; white-space: nowrap; margin-right: 4px; }
    .nav-divider { width: 1px; height: 18px; background: var(--border); margin: 0 10px; }
    .nav-links { display: flex; align-items: center; gap: 2px; }
    .nav-links a { color: var(--muted); font-size: 13px; font-weight: 500; padding: 5px 10px; border-radius: 6px; text-decoration: none; transition: color .15s, background .15s; white-space: nowrap; }
    .nav-links a:hover { color: var(--ink); background: rgba(255,255,255,.06); }
    .nav-links a[aria-current="page"] { color: var(--accent); }
    .wrap { max-width: 1100px; margin: 0 auto; padding: 28px 18px 60px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; margin: 12px 0 18px; flex-wrap: wrap; }
    .kicker { display: inline-flex; align-items: center; gap: 10px; color: var(--muted); letter-spacing: .12em; text-transform: uppercase; font-size: 12px; }
    .dot { width: 10px; height: 10px; border-radius: 999px; background: linear-gradient(135deg, var(--accent), #f59e0b); box-shadow: 0 0 0 4px rgba(245,165,36,.1); }
    .page-header h1 { margin: 0; font-size: clamp(28px, 4vw, 42px); line-height: 1.08; letter-spacing: -0.02em; }
    .sub { margin: 0; max-width: 72ch; color: var(--muted); font-size: 15.5px; }
    .top-actions { display: flex; gap: 10px; flex-wrap: wrap; }
    .btn { appearance: none; border: 1px solid var(--border); background: rgba(255,255,255,.04); color: var(--ink); padding: 10px 12px; border-radius: 999px; cursor: pointer; font-weight: 600; font-size: 13px; display: inline-flex; align-items: center; gap: 8px; transition: background .15s, border-color .15s; }
    .btn:hover { background: rgba(255,255,255,.07); border-color: var(--border-hover); }
    .btn.primary { border-color: rgba(245,165,36,.35); background: var(--accent-dim); }
    .grid { display: grid; grid-template-columns: 1.15fr .85fr; gap: 14px; }
    @media (max-width: 980px) { .grid { grid-template-columns: 1fr; } }
    .card { background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03)); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden; }
    .card .hd { padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border); background: rgba(0,0,0,.12); gap: 12px; }
    .card .hd h2 { margin: 0; font-size: 14px; display: flex; align-items: center; gap: 10px; }
    .card .bd { padding: 16px; }
    .pill { font-size: 12px; color: var(--muted); border: 1px solid var(--border); background: rgba(255,255,255,.04); padding: 6px 10px; border-radius: 999px; white-space: nowrap; }
    .icon { width: 18px; height: 18px; opacity: .95; }
    .toc { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 16px; }
    .toc a { font-size: 12px; padding: 6px 10px; border-radius: 999px; border: 1px solid var(--border); color: var(--muted); text-decoration: none; background: rgba(255,255,255,.03); }
    .toc a:hover { color: var(--ink); border-color: var(--border-hover); }
    .callout { padding: 14px; border-radius: var(--radius); border: 1px solid rgba(245,165,36,.22); background: var(--accent-dim); margin-bottom: 16px; }
    .callout h3 { margin: 0 0 8px; font-size: 15px; }
    .callout p { margin: 0; color: var(--muted); font-size: 14px; }
    .callout a { color: var(--accent); }
    .mental { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px; }
    .mental .mini { padding: 12px; border: 1px solid var(--border); border-radius: var(--radius); background: rgba(255,255,255,.03); }
    .mental .mini h3 { margin: 0 0 8px; font-size: 13px; }
    .mental pre { margin: 0; font-family: var(--font-mono); font-size: 12px; color: var(--muted); line-height: 1.55; white-space: pre-wrap; }
    .section-block { margin-bottom: 28px; }
    .section-block h2 { margin: 0 0 6px; font-size: 1.15rem; scroll-margin-top: 70px; }
    .section-intro { margin: 0 0 12px; color: var(--muted); font-size: 14px; max-width: 65ch; }
    .steps { display: flex; flex-direction: column; gap: 10px; }
    details { border: 1px solid var(--border); background: rgba(255,255,255,.03); border-radius: var(--radius); padding: 10px 12px; }
    summary { cursor: pointer; list-style: none; display: flex; align-items: center; justify-content: space-between; gap: 10px; font-weight: 700; user-select: none; }
    summary::-webkit-details-marker { display: none; }
    .cmd, .wf-title { font-family: var(--font-mono); font-size: 12.5px; font-weight: 600; color: var(--ink); text-align: left; word-break: break-word; }
    .chev { width: 22px; height: 22px; border-radius: 999px; border: 1px solid var(--border); display: grid; place-items: center; background: rgba(0,0,0,.12); flex-shrink: 0; transition: transform .15s; }
    details[open] .chev { transform: rotate(180deg); }
    .detail-body { margin-top: 10px; display: flex; flex-direction: column; gap: 10px; }
    .plain { margin: 0; color: var(--muted); font-size: 13.5px; }
    .note { margin: 0; color: var(--muted); font-size: 12.5px; border-left: 2px solid var(--border); padding-left: 10px; }
    .codebox { border: 1px solid var(--border-hover); background: rgba(0,0,0,.28); border-radius: var(--radius); overflow: hidden; }
    .codebox.compact pre { font-size: 11.5px; padding: 10px; }
    .codebar { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 12px; border-bottom: 1px solid var(--border); background: rgba(255,255,255,.03); color: var(--muted); font-size: 12px; }
    .codebox pre { margin: 0; padding: 12px; overflow: auto; font-family: var(--font-mono); font-size: 12.5px; color: #eaf0ff; line-height: 1.55; white-space: pre-wrap; }
    .badge { font-size: 11px; padding: 4px 8px; border-radius: 999px; border: 1px solid var(--border); background: rgba(0,0,0,.12); color: var(--muted); flex-shrink: 0; }
    .badge.bad { border-color: rgba(239,68,68,.35); background: rgba(239,68,68,.1); color: #ffd9d9; }
    .aside { position: sticky; top: 60px; display: flex; flex-direction: column; gap: 14px; }
    @media (max-width: 980px) { .aside { position: static; } }
    .search input { width: 100%; padding: 12px; border-radius: 12px; border: 1px solid var(--border); background: rgba(255,255,255,.04); color: var(--ink); outline: none; }
    .tagrow { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
    .tag { font-size: 12px; padding: 6px 10px; border-radius: 999px; border: 1px solid var(--border); background: rgba(255,255,255,.03); color: var(--muted); cursor: pointer; user-select: none; }
    .tag.active { border-color: rgba(245,165,36,.35); background: var(--accent-dim); color: var(--ink); }
    .combo-item { padding: 10px; border: 1px solid var(--border); border-radius: var(--radius); background: rgba(255,255,255,.03); margin-bottom: 10px; }
    .combo-h { font-weight: 700; font-size: 13px; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .danger-row { display: flex; flex-direction: column; gap: 4px; padding: 10px 0; border-bottom: 1px solid var(--border); font-size: 13px; }
    .danger-row:last-child { border-bottom: none; }
    .danger-row code { font-family: var(--font-mono); color: #ffd9d9; }
    .danger-alt { color: var(--muted); font-size: 12px; }
    .toast { position: fixed; bottom: 18px; left: 50%; transform: translateX(-50%); background: rgba(10,10,10,.92); border: 1px solid var(--border-hover); color: var(--ink); padding: 10px 12px; border-radius: 999px; box-shadow: var(--shadow); display: none; gap: 10px; align-items: center; font-size: 13px; z-index: 200; }
    .toast.show { display: flex; }
    .toast .ok { width: 10px; height: 10px; border-radius: 999px; background: var(--good); }
    footer { text-align: center; padding: 40px 24px; border-top: 1px solid var(--border); color: var(--muted); font-size: .875rem; }
    footer a { color: var(--accent); text-decoration: none; }
    footer a:hover { text-decoration: underline; }
    .back-top { position: fixed; bottom: 28px; right: 28px; background: var(--panel-2); border: 1px solid var(--border); border-radius: 999px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; color: var(--muted); cursor: pointer; opacity: 0; pointer-events: none; transition: opacity .2s; text-decoration: none; font-size: 18px; }
    .back-top.visible { opacity: 1; pointer-events: auto; }
    .nav-toggle { display: none; background: none; border: none; color: var(--muted); cursor: pointer; padding: 4px; margin-left: auto; }
    @media (max-width: 640px) {
      .site-nav { padding: 0 16px; flex-wrap: wrap; }
      .nav-toggle { display: flex; }
      .nav-divider { display: none; }
      .nav-links { display: none; width: 100%; order: 10; padding: 8px 0; border-top: 1px solid var(--border); }
      .site-nav.nav-open .nav-links { display: flex; flex-direction: column; align-items: flex-start; }
    }
  </style>
</head>
<body>

<nav class="site-nav" aria-label="Site navigation">
  <a href="index.html" class="home-link">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
    Hi Bot Code
  </a>
  <div class="nav-divider" aria-hidden="true"></div>
  <div class="nav-links">
    <a href="editor.html">Editor</a>
    <a href="/challenges/">Challenges</a>
    <a href="get-started-coding.html">Get Started</a>
    <a href="git-command-reference.html" aria-current="page">Git Reference</a>
    <a href="pull-requests-github.html">Pull Requests</a>
    <a href="learn.html">Learn</a>
    <a href="glossary.html">Glossary</a>
  </div>
  <button class="nav-toggle" aria-label="Menu" aria-expanded="false" onclick="this.setAttribute('aria-expanded',this.getAttribute('aria-expanded')==='false'?'true':'false');this.closest('.site-nav').classList.toggle('nav-open')"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
</nav>

<div class="wrap">
  <header class="page-header">
    <div>
      <div class="kicker"><span class="dot"></span> Free reference · No sign-up</div>
      <h1>Git Command Reference</h1>
      <p class="sub">Learn what each Git command does in plain English, copy the exact syntax, and follow safe daily workflows — whether you are brand new or need a fast lookup.</p>
    </div>
    <div class="top-actions">
      <button class="btn primary" type="button" id="copyBeginnerBtn">Copy beginner workflow</button>
      <button class="btn" type="button" id="expandAllBtn">Expand all</button>
      <button class="btn" type="button" id="collapseAllBtn">Collapse all</button>
    </div>
  </header>

  <div class="grid">
    <main class="card">
      <div class="hd"><h2>Commands &amp; workflows</h2><div class="pill" id="countPill">0 visible</div></div>
      <div class="bd" id="mainContent">
        <nav class="toc" aria-label="On this page">${toc.join('\n')}
          <a href="#mental-model">Mental model</a>
          <a href="#beginner-workflow">Beginner workflow</a>
          <a href="#workflows">Full workflows</a>
          <a href="#daily-combos">Daily combos</a>
          <a href="#dangerous">Be careful</a>
        </nav>

        <div class="callout" id="beginner-workflow">
          <h3>Beginner-safe default workflow (use ~90% of the time)</h3>
          <p>Check status, branch from updated main, commit small clear changes, push, then open a pull request. <a href="pull-requests-github.html">Learn PRs on GitHub →</a></p>
        </div>

        <div class="mental" id="mental-model">
          <div class="mini">
            <h3>Three zones</h3>
            <pre>Working directory  →  Staging area  →  Commit history
      edit              git add           git commit</pre>
          </div>
          <div class="mini">
            <h3>Local ↔ remote</h3>
            <pre>Local repo  ↔  Remote repo
 git pull      git push
 git fetch</pre>
          </div>
          <div class="mini">
            <h3>Branch flow</h3>
            <pre>main
  \\
   feature-branch

Typical rhythm:
git switch main → git pull → git switch -c feature/…
→ edit → git add . → git commit → git push -u origin feature/…
→ open pull request</pre>
          </div>
        </div>

        ${mainSectionsHtml}

        <section class="section-block" id="workflows">
          <h2>20. Common full workflows</h2>
          <p class="section-intro">End-to-end sequences you can copy when a single command is not enough.</p>
          <div class="steps">${workflows.join('\n')}</div>
        </section>

        <section class="section-block" id="daily-combos">
          <h2>21. Most useful daily combinations</h2>
          <p class="section-intro">Short command chains for recurring situations. Expand any section above for detail.</p>
          ${dailyHtml}
        </section>

        <section class="section-block" id="dangerous">
          <h2>24. Commands to be careful with</h2>
          <p class="section-intro">These can destroy or rewrite work. Prefer the safer alternatives. Before risky ops: <code>git branch backup-$(date +%Y%m%d)</code> or <code>git tag backup-before-reset</code>.</p>
          ${dangerHtml}
        </section>
      </div>
    </main>

    <aside class="aside">
      <section class="card">
        <div class="hd"><h2>Search &amp; filter</h2><div class="pill">cheat sheet</div></div>
        <div class="bd">
          <div class="search">
            <input id="search" type="search" placeholder="Search commands (e.g. stash, rebase, push)…" aria-label="Search Git commands" />
          </div>
          <div class="tagrow" id="tags">
            <span class="tag active" data-tag="all">All</span>
            <span class="tag" data-tag="setup">Setup</span>
            <span class="tag" data-tag="daily">Daily</span>
            <span class="tag" data-tag="branch">Branch</span>
            <span class="tag" data-tag="remote">Remote</span>
            <span class="tag" data-tag="undo">Undo</span>
            <span class="tag" data-tag="workflow">Workflow</span>
            <span class="tag" data-tag="danger">Danger</span>
          </div>
        </div>
      </section>
      <section class="card">
        <div class="hd"><h2>Beginner workflow</h2><div class="pill">copy</div></div>
        <div class="bd">
          <div class="codebox">
            <div class="codebar"><span>90% flow</span><button class="btn" type="button" data-copy="#${beginnerWorkflowId}">Copy</button></div>
            <pre id="${beginnerWorkflowId}">git status
git switch main
git pull
git switch -c feature/my-work
# make changes
git status
git add .
git commit -m "Describe the change"
git push -u origin feature/my-work
# open pull request on GitHub</pre>
          </div>
        </div>
      </section>
      <section class="card">
        <div class="hd"><h2>Related</h2></div>
        <div class="bd" style="font-size:13px;color:var(--muted);display:flex;flex-direction:column;gap:8px;">
          <a href="glossary/version-control-git.html">What is Git? (glossary)</a>
          <a href="pull-requests-github.html">Pull requests on GitHub</a>
          <a href="get-started-coding.html">Web dev vocabulary 101</a>
        </div>
      </section>
    </aside>
  </div>
</div>

<div class="toast" id="toast" role="status" aria-live="polite"><span class="ok" aria-hidden="true"></span><span id="toastText">Copied.</span></div>

<footer>
  <p>Part of <a href="editor.html">code.hibot.space</a> — free, no sign-up, no tracking.</p>
  <p style="margin-top:6px;font-size:.8rem">
    <a href="git-command-reference.html">Git Reference</a> &nbsp;·&nbsp;
    <a href="pull-requests-github.html">Pull Requests</a> &nbsp;·&nbsp;
    <a href="glossary/version-control-git.html">Version Control</a> &nbsp;·&nbsp;
    <a href="learn.html">Learn</a> &nbsp;·&nbsp;
    <a href="glossary.html">Glossary</a>
  </p>
</footer>

<a href="#" class="back-top" id="back-top" aria-label="Back to top">&#x2191;</a>

<script>
(function () {
  var $ = function (s, r) { r = r || document; return r.querySelector(s); };
  var $$ = function (s, r) { r = r || document; return Array.from(r.querySelectorAll(s)); };
  var toast = $("#toast"), toastText = $("#toastText"), timer;
  function showToast(msg) {
    toastText.textContent = msg;
    toast.classList.add("show");
    clearTimeout(timer);
    timer = setTimeout(function () { toast.classList.remove("show"); }, 1400);
  }
  function copyText(text) {
    var p = navigator.clipboard && navigator.clipboard.writeText
      ? navigator.clipboard.writeText(text).then(function () { showToast("Copied to clipboard."); })
      : Promise.resolve((function () {
          var ta = document.createElement("textarea");
          ta.value = text; document.body.appendChild(ta); ta.select();
          document.execCommand("copy"); ta.remove(); showToast("Copied (fallback).");
        })());
    if (p && p.catch) p.catch(function () { showToast("Copy failed."); });
  }
  $$("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var el = $(btn.getAttribute("data-copy"));
      if (el) copyText(el.textContent.trim());
    });
  });
  var beginnerPre = $("#${beginnerWorkflowId}");
  $("#copyBeginnerBtn").addEventListener("click", function () {
    if (beginnerPre) copyText(beginnerPre.textContent.trim());
  });
  var cards = $$(".cmd-card, .combo-item", $("#mainContent"));
  $("#expandAllBtn").addEventListener("click", function () {
    $$("details.cmd-card, details.workflow-card", $("#mainContent")).forEach(function (d) { d.open = true; });
    showToast("Expanded all commands.");
  });
  $("#collapseAllBtn").addEventListener("click", function () {
    $$("details.cmd-card, details.workflow-card", $("#mainContent")).forEach(function (d) { d.open = false; });
    showToast("Collapsed all commands.");
  });
  var activeTag = "all";
  var searchEl = $("#search");
  var countPill = $("#countPill");
  function norm(s) { return (s || "").toLowerCase(); }
  function tagMatch(tags) {
    if (activeTag === "all") return true;
    return norm(tags).indexOf(activeTag) !== -1;
  }
  function applyFilters() {
    var q = norm(searchEl.value);
    var n = 0;
    cards.forEach(function (el) {
      var tags = el.getAttribute("data-tags") || "";
      var text = el.textContent || "";
      var ok = tagMatch(tags) && (!q || norm(text).indexOf(q) !== -1);
      el.style.display = ok ? "" : "none";
      if (ok) n++;
    });
    countPill.textContent = n + " visible";
  }
  $$(".tag", $("#tags")).forEach(function (t) {
    t.addEventListener("click", function () {
      $$(".tag", $("#tags")).forEach(function (x) { x.classList.remove("active"); });
      t.classList.add("active");
      activeTag = t.getAttribute("data-tag");
      applyFilters();
    });
  });
  searchEl.addEventListener("input", applyFilters);
  applyFilters();
  var backTop = $("#back-top");
  window.addEventListener("scroll", function () {
    backTop.classList.toggle("visible", window.scrollY > 400);
  });
  backTop.addEventListener("click", function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();
</script>
</body>
</html>`;

fs.writeFileSync(OUT, html, 'utf8');
console.log('Wrote', OUT, '(' + (html.length / 1024).toFixed(1) + ' KB)');
