# CI/CD Lab: Notes

A running log of everything we do in `~/WORK3`. Newest entry at the bottom.
- `STEPS.md` = the plan (what we will do).
- `NOTES.md` = this log (what we actually did, and why).

---

## Glossary
Grows as we learn new terms.

| Term | Meaning |
|---|---|
| **CI** (Continuous Integration) | Every push, GitHub automatically runs the tests. Broken code is caught immediately. |
| **CD** (Continuous Deployment) | When tests pass on `main`, GitHub automatically publishes the new version. |
| **Pipeline** | The chain of automated stages: test → deploy. |
| **Token** | A password-like key that `gh` uses to act as you on GitHub. |
| **Scope** | What a token is allowed to do (e.g. `repo` = read/write repos). |
| **`package.json`** | A Node project's ID card: name, settings, and named commands (scripts). |
| **npm script** | A named shortcut for a command. `npm test` runs whatever `scripts.test` says. |
| **Pure function** | Output depends only on its inputs; no screen, no network, no files. The easiest kind of code to test. |
| **`export` / `import`** | `export` makes a function usable from other files; `import` pulls it in. |
| **Test** | A small program that runs your code and checks the answer is what you expect. |
| **Assertion** | The check inside a test: "this value must equal that". If it doesn't, the test fails. |
| **Exit code** | The number a command returns when it ends. `0` = success, anything else = failure. **CI decides green ✓ or red ✗ from this number.** |
| **Local server** | A small program that serves your folder to the browser at `http://localhost:<port>`. Browsers refuse `import` from files opened directly, so the page needs one. |
| **Port** | A numbered door on a machine. `8000` = the door our local server listens on. |
| **Repository (repo)** | A project folder whose full history is tracked by git. |
| **Commit** | A saved snapshot of the files, with a message saying what changed and why. |
| **Remote** | A copy of the repo on another machine (here: GitHub). `origin` is its default name. |
| **Push** | Upload your local commits to the remote. |
| **`.gitignore`** | A list of files and folders git must never track. |
| **Workflow** | A YAML file in `.github/workflows/` that tells GitHub what to run automatically. |
| **Trigger (`on:`)** | The event that starts a workflow: a push, a pull request, a schedule... |
| **Job** | A group of steps that runs on one fresh machine. |
| **Runner** | The machine GitHub lends you to run a job (`ubuntu-latest` = a fresh Linux VM, deleted afterwards). |
| **Step** | One action inside a job, run top to bottom. If one fails, the job stops and turns red. |
| **Action (`uses:`)** | A ready-made step someone else wrote, e.g. `actions/checkout`. `@v7` = which version. |
| **YAML** | The file format of workflows. Indentation (spaces, never tabs) defines structure. |
| **Run** | One execution of a workflow. Each push to `main` or PR update creates a new run. |
| **Branch** | A parallel line of commits. You change things on a branch without touching `main`. |
| **Pull request (PR)** | A request to merge a branch into `main`. CI runs on it, so you see ✓/✗ before merging. |
| **Status check** | The ✓/✗ a CI job reports on a commit or PR. |
| **Merge** | Bring a branch's commits into `main`. |
| **Test coverage (idea)** | Which mistakes your tests can actually catch. A test that passes no matter what protects nothing. |
| **Merge commit** | A commit with two parents that joins a branch into `main`. Keeps the branch's history visible. |
| **Remote-tracking branch** | Your local copy of what a GitHub branch looked like at the last fetch, e.g. `origin/break-it`. It can go stale. |
| **Prune** | Delete remote-tracking branches whose GitHub branch no longer exists. |
| **Ruleset** | GitHub rules that protect a branch, e.g. "no merge unless CI passes". |

---

## 2026-09-29: Session 1 (Planning)

### What we did
- Picked a learning project: a tiny tip-calculator web page with a CI/CD pipeline.
- Wrote the step-by-step plan in `STEPS.md` (3 parts, 8 phases, ~1h45).
- Checked the machine is ready.

### Decisions
| Decision | Choice | Why |
|---|---|---|
| Language | JavaScript (confirmed) | Zero dependencies; ends in a live web page |
| Tests | Node's built-in runner (`node --test`) | Nothing to install |
| CI | GitHub Actions | Built into GitHub, free for public repos |
| CD | GitHub Pages | Free hosting; you can see the deploy result |
| GitHub login | HTTPS via `gh auth login` | The SSH key is not registered on GitHub |
| Repo | `fsideris/cicd-lab`, public | Pages is free only for public repos on the free plan |
| Working method | Claude writes each file and explains it line by line; you run the commands | You learn by doing, with the meaning next to every line |

### Environment check
| Check | Result |
|---|---|
| git | 2.53.0 |
| node | v24.21.0 |
| git identity | `fsider` / `fotis019@gmail.com` (already set) |
| `gh` (GitHub CLI) | Not logged in |
| SSH key on GitHub | Not registered (`Permission denied (publickey)`) |

### Commands and their meaning
| Command | Meaning |
|---|---|
| `git config --global --get user.name` | Show the name stamped on your commits |
| `git config --global --get user.email` | Show the email stamped on your commits |
| `gh auth status` | Is the GitHub CLI logged in? |
| `ssh -T git@github.com` | Does GitHub accept my SSH key? |

Side effect: the SSH test added GitHub's host key to `~/.ssh/known_hosts` (normal, harmless).

### Files
| File | Meaning |
|---|---|
| `STEPS.md` | The plan, as a checklist per phase |
| `NOTES.md` | This log |
| `prep.sh` | Pre-existing. Contains placeholder git identity. **Do not run**: it would overwrite the real identity. |

### Open items
- [x] Confirm the stack (JavaScript) and the working method
- [x] Delete `prep.sh` before Phase 2, so it does not get uploaded to the repo

### Phase 0: Setup ✓
| Command | Meaning |
|---|---|
| `gh auth login --hostname github.com --git-protocol https --web` | Log in to GitHub through the browser; git talks to GitHub over HTTPS |
| `gh auth setup-git` | Make `git push` use the `gh` login, so no password prompts |
| `git config --global init.defaultBranch main` | New repos start on branch `main`, same as GitHub |
| `gh auth status` | Confirm the login worked |

Result:
- Logged in as `fsideris`, protocol HTTPS.
- Token scopes: `repo` (read/write repos), `workflow` (allowed to push files in `.github/workflows/`, needed in Phase 3), `gist`, `read:org`.
- Git now asks `gh` for credentials (`credential.helper = gh auth git-credential`).
- Unknown: whether `fotis019@gmail.com` is added to the `fsideris` GitHub account. If not, commits will not link to your profile. Check: GitHub → Settings → Emails.

### Phase 1: The app ✓
| File | Meaning |
|---|---|
| `package.json` | Project ID card. `"test": "node --test"` defines what `npm test` runs. |
| `src/tip.js` | The logic: `calcTip(bill, percent)` returns the tip, rounded to cents. |
| `test/tip.test.js` | 3 tests that prove `calcTip` works. Run with `npm test`. |
| `index.html` | The page people see. Uses `calcTip` from `src/tip.js`. |

`package.json` line by line:
| Line | Meaning |
|---|---|
| `"name": "cicd-lab"` | The project's name. Matches the future GitHub repo. |
| `"private": true` | Blocks accidental publishing to the public npm registry. |
| `"type": "module"` | Use modern `import`/`export` syntax, the same syntax browsers use. |
| `"scripts": { "test": "node --test" }` | `npm test` runs Node's built-in test runner. It finds files in `test/` by itself. **CI will run exactly this command.** |

`src/tip.js` line by line:
| Line | Meaning |
|---|---|
| `export function calcTip(bill, percent)` | Defines the function and makes it importable by the page and the tests. |
| `const tip = bill * percent / 100;` | The math: 15% of 50 = 50 × 15 / 100 = 7.5. |
| `return Math.round(tip * 100) / 100;` | Round to cents: × 100 → round to whole number → ÷ 100. So 4.9995 becomes 5. |

Design choice: the logic lives in its own file, separate from the page. It is a pure function, so a test can check it without a browser.

`test/tip.test.js` line by line:
| Line | Meaning |
|---|---|
| `import { test } from 'node:test';` | Node's built-in test tool. `node:` = ships with Node, nothing to install. |
| `import assert from 'node:assert/strict';` | Node's built-in checker. `strict` = compare exactly (`5` is not `"5"`). |
| `import { calcTip } from '../src/tip.js';` | Pull in the function we want to test. `..` = go up one folder. |
| `test('15% of 50 is 7.5', () => { ... });` | One test: a name (shown in the output) + the code to run. |
| `assert.equal(calcTip(50, 15), 7.5);` | "Actual must equal expected." If not, this test fails. |

The 3 tests cover: the normal case (15% of 50), the rounding (33.33 → 5), and an edge case (0%).

File name matters: `node --test` automatically finds files ending in `.test.js`. That's why `package.json` needs no file list.

Ran `npm test` → 3 pass, 0 fail. `echo $?` → `0` (success exit code).

`index.html` part by part:
| Part | Meaning |
|---|---|
| `<!doctype html>`, `<meta charset>`, `<meta viewport>` | Standard page header: modern HTML, correct characters, fits phone screens. |
| `<input id="bill" type="number" value="50">` | A number box. `id` = its name, so the script can find it. `value` = starting number. |
| `<strong id="result">` | Empty spot where the tip is written. |
| `<script type="module">` | Allows `import` inside the page (same syntax as the tests). |
| `import { calcTip } from './src/tip.js';` | The page uses **the same function the tests check**. `./` = relative path, needed later for GitHub Pages. |
| `document.getElementById(...)` | Find an element on the page by its `id`. |
| `function update() { ... }` | Read both boxes → `Number(...)` turns the typed text into a number → `calcTip` → `.toFixed(2)` shows 2 decimals (7.5 → "7.50") → write the result. |
| `addEventListener('input', update)` | Re-run `update` every time you type in a box. |
| `update();` | Run once at load, so the result shows immediately. |

Split of responsibilities: `src/tip.js` = the math (tested). `index.html` = the screen (reads input, shows output).

Ran `python3 -m http.server 8000` → opened http://localhost:8000 → page showed "Tip: 7.50" and updated while typing. Stopped with Ctrl+C.

**Phase 1 result:** a working page + 3 passing tests, all on your machine.

### Phase 2: Git + GitHub ✓
| File | Meaning |
|---|---|
| `.gitignore` | Tells git which files never to track. |

`.gitignore` line by line:
| Line | Meaning |
|---|---|
| `node_modules/` | The folder where `npm install` puts downloaded packages. It can be huge and is re-downloadable, so it never goes into git. We have no packages yet; this is a guard for later. |

Checked: the repo name `cicd-lab` is free on the `fsideris` account (the only existing repo is `AKS-fotis`).

| Command | Meaning |
|---|---|
| `rm prep.sh` | Deleted the placeholder script so it would not be uploaded |
| `git init` | Turned `~/WORK3` into a git repo (creates the hidden `.git/` folder) |
| `git add .` | Staged all files for the first snapshot (`.gitignore` filters) |
| `git status` | Showed the 7 files about to be committed |
| `git commit -m "feat(app): add tip calculator with tests"` | Saved the first snapshot |
| `gh repo create cicd-lab --public --source=. --push` | Created the GitHub repo, linked it as `origin`, uploaded the commit |
| `gh repo view --web` | Opened the repo in the browser |

Result:
- Repo live: https://github.com/fsideris/cicd-lab (public, default branch `main`)
- First commit: `c85834c feat(app): add tip calculator with tests`, author `fsider <fotis019@gmail.com>`
- 7 files tracked: `.gitignore`, `NOTES.md`, `STEPS.md`, `index.html`, `package.json`, `src/tip.js`, `test/tip.test.js`

---

## Part B: CI

### Phase 3: First workflow ✓
| File | Meaning |
|---|---|
| `.github/workflows/pipeline.yml` | The pipeline. For now one job, `test`, which runs `npm test` on GitHub's machine. |

`pipeline.yml` line by line:
| Line | Meaning |
|---|---|
| `name: pipeline` | The name shown in the Actions tab. |
| `on:` | **When** to run (the triggers). |
| `push: branches: [main]` | Run on every push to `main`. |
| `pull_request:` | Run on every pull request (any branch). Together: `main` is always tested, and every proposed change is tested before it gets in. |
| `jobs:` | **What** to run. |
| `test:` | The job's name. Phase 5 will require a job called `test` to pass. |
| `runs-on: ubuntu-latest` | Borrow a fresh Linux machine from GitHub. It starts empty: no code, no Node. |
| `steps:` | The to-do list for that machine, top to bottom. |
| `uses: actions/checkout@v7` | Step 1: download your repo's code onto the machine. |
| `uses: actions/setup-node@v7` + `node-version: 24` | Step 2: install Node 24, the same version as your WSL (v24.21.0). |
| `run: npm test` | Step 3: the exact command you ran by hand. Exit code `0` → green ✓, anything else → red ✗. |

Versions: `@v7` = latest major release of both actions at the time of writing (checkout v7.0.1, setup-node v7.0.0).
Only YAML files inside `.github/workflows/` are picked up by GitHub. The folder name must be exact.

| Command | Meaning |
|---|---|
| `git status` | Showed `.github/` as new + notes modified |
| `git add .` | Staged everything |
| `git commit -m "chore(ci): add test workflow"` | Commit `0b1581f` |
| `git push` | Uploaded to `main` → this push **triggered the first pipeline run** |
| `gh run watch` | Followed the run live in the terminal |

Result: run `36547896867`, job `test` → **success** in 8 s. Log showed `tests 3, pass 3, fail 0`.

The steps GitHub showed, and what they mean:
| Step in the log | Meaning |
|---|---|
| Set up job | GitHub prepares the fresh runner |
| Run actions/checkout@v7 | Our step 1: code downloaded |
| Run actions/setup-node@v7 | Our step 2: Node 24 installed |
| Run npm test | Our step 3: tests passed |
| Post Run ... | Automatic clean-up for the actions (runs in reverse order) |
| Complete job | Runner is shut down and deleted |

**Phase 3 result:** every push to `main` is now tested automatically on a clean machine.

### Phase 4: Watch CI catch a bug ✓
Plan: pretend we forgot to run the tests. Break the math on a branch, open a PR, see CI turn red.

| Command / action | Meaning |
|---|---|
| `git switch -c break-it` | Created branch `break-it` and moved onto it |
| Edited `src/tip.js` line 3: `/ 100` → `/ 10` | The deliberate bug |
| `git add .` + `git commit -m "chore(app): break tip math on purpose"` | Commit `72fd2d9` |
| `git push -u origin break-it` | Uploaded the branch. **No CI run**: our trigger only runs on pushes to `main` |
| `gh pr create --fill` | Opened PR #1: https://github.com/fsideris/cicd-lab/pull/1 → **this triggered CI** |
| `gh pr checks --watch` | Watched the check: `test` → **fail** in 5 s |
| `gh pr view --web` | Saw the red ✗ on the PR page |

What CI reported (run `36548838795`):
| Test | Result | Why |
|---|---|---|
| 15% of 50 is 7.5 | ✖ | actual `75`, expected `7.5` |
| rounds to cents | ✖ | actual `50`, expected `5` |
| 0% tip is 0 | ✔ | 0 × anything = 0, so this test **cannot** notice a wrong divisor |

Lesson: CI caught the bug before it reached `main`, even though nobody ran the tests by hand. And: not every test catches every bug. Two tests caught it, one could not.

The fix:
| Command / action | Meaning |
|---|---|
| Edited `src/tip.js` line 3 back to `/ 100` | Undo the bug |
| `npm test` | Checked locally first: 3 pass |
| `git add .` + `git commit -m "fix(app): restore tip math"` | Commit `6a78f72` |
| `git push` | Added the fix to the PR → **CI re-ran automatically** |
| `gh pr checks --watch` | `test` → green ✓ |
| `gh pr merge --merge --delete-branch` | Merged PR #1 into `main` (merge commit `f058e3a`), deleted `break-it`, switched back to `main` |

The 4 pipeline runs so far tell the whole story:
| Run | Event | Result | What happened |
|---|---|---|---|
| `36547896867` | push to `main` | ✓ | First workflow added |
| `36548838795` | pull request | ✗ | The bug, caught |
| `36549355833` | pull request | ✓ | The fix |
| `36549487051` | push to `main` | ✓ | The merge (a merge is a push to `main`, so CI ran again) |

History after the merge (`git log --oneline --graph`):
```
*   f058e3a Merge pull request #1 from fsideris/break-it
|\
| * 6a78f72 fix(app): restore tip math
| * 72fd2d9 chore(app): break tip math on purpose
|/
* 0b1581f chore(ci): add test workflow
* c85834c feat(app): add tip calculator with tests
```

Leftover: `git branch -a` still lists `remotes/origin/break-it`, but `git ls-remote --heads origin` shows only `main` on GitHub. It is a stale local reference. Fix: `git fetch --prune`.

**Phase 4 result:** a broken change was stopped at the PR, fixed, and merged green.

**Gap found:** nothing *forces* you to wait for the green ✓. You could have merged PR #1 while it was red. Phase 5 closes that gap.

### Phase 5: Protect `main` (in progress)
Plan: a ruleset on `main` that requires a pull request and a green `test` check before anything gets in.

| Command / action | Meaning |
|---|---|
| `git fetch --prune` | Removed the stale `origin/break-it` reference. `git branch -a` now shows only `main` |
| GitHub → Settings → Rules → New branch ruleset | Created ruleset `protect-main` in the web UI |

Ruleset `protect-main` (id `24170484`), as the GitHub API reports it:
| Setting (API name) | Value | Meaning |
|---|---|---|
| `enforcement` | `active` | The rules are on |
| target `~DEFAULT_BRANCH` | `main` | Applies to the default branch |
| `bypass_actors` | none | Nobody is exempt, not even you (the repo owner) |
| `deletion` | on | `main` cannot be deleted |
| `non_fast_forward` | on | No force pushes: history on `main` cannot be rewritten |
| `pull_request`, `required_approving_review_count: 0` | on | Changes must come through a PR; no human approval needed |
| `required_status_checks`: `test` (GitHub Actions) | on | The `test` job must be green before merging |
| `require_extra_approval_for_unattributed_changes` | `true` | Unknown: GitHub default, meaning not verified |

Tip: the rules can be read any time with `gh api repos/fsideris/cicd-lab/rulesets`.
