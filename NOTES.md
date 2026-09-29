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
- [ ] Delete `prep.sh` before Phase 2, so it does not get uploaded to the repo

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

### Phase 2: Git + GitHub (in progress)
| File | Meaning |
|---|---|
| `.gitignore` | Tells git which files never to track. |

`.gitignore` line by line:
| Line | Meaning |
|---|---|
| `node_modules/` | The folder where `npm install` puts downloaded packages. It can be huge and is re-downloadable, so it never goes into git. We have no packages yet; this is a guard for later. |

Checked: the repo name `cicd-lab` is free on the `fsideris` account (the only existing repo is `AKS-fotis`).
