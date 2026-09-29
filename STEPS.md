# CI/CD Lab: Steps

**Project:** a tiny tip-calculator web page.
**Stack:** plain JavaScript, Node's built-in test runner (zero dependencies), GitHub Actions (CI), GitHub Pages (CD).
**Repo:** `github.com/fsideris/cicd-lab` (public: GitHub Pages is free for public repos).

**The idea behind everything:**
- **CI** = GitHub runs your tests on every push.
- **CD** = if the tests pass on `main`, GitHub publishes the site.

Total: about 1h45. Fine to split across two sessions (Part A+B, then Part C).

---

## Part A: Build it locally (~40 min)

### Phase 0: Setup (10 min)
- [x] `gh auth login` → GitHub.com → HTTPS → Login with a web browser
      *Why:* lets `git push` and `gh` act as your `fsideris` account. Your SSH key is not registered on GitHub, so HTTPS is simpler.
- [x] `git config --global init.defaultBranch main`
      *Why:* new repos start on `main`, same as GitHub.
- [x] `code .` from `~/WORK3`

Already done: git identity is `fsider` / `fotis019@gmail.com`.

### Phase 1: The app (20 min)
| File | Meaning |
|---|---|
| `package.json` | Project ID card. Defines the `npm test` command. |
| `src/tip.js` | The logic: `calcTip(bill, percent)`. |
| `test/tip.test.js` | Proves the logic works. |
| `index.html` | The page people see. |

- [x] `npm test` → all tests pass
- [x] `python3 -m http.server 8000` → open http://localhost:8000

*Why:* CI never does anything you cannot run by hand. Get it working locally first.

### Phase 2: Git + GitHub (10 min)
- [x] Create `.gitignore`
- [x] `git init` → first commit
- [x] `gh repo create cicd-lab --public --source=. --push`

*Why:* the pipeline runs on GitHub, so the code has to live there.

---

## Part B: CI (~35 min)

### Phase 3: First workflow (20 min)
| File | Meaning |
|---|---|
| `.github/workflows/pipeline.yml` | Job `test`: checkout → set up Node → `npm test`. Runs on every push and pull request. |

- [x] Push → `gh run watch` (or the Actions tab) → green ✓

*Concepts:* workflow, trigger (`on:`), job, runner, step, action (`uses:`).

### Phase 4: Watch CI catch a bug (10 min)
- [x] New branch `break-it`, make the math wrong, push, open a pull request
- [x] See the red ✗ on the pull request
- [x] Fix it, push → green ✓ → merge

*Concepts:* branch, pull request, status check.

### Phase 5: Protect `main` (5 min)
- [ ] Settings → Rules → require the `test` check to pass before merging

*Concept:* CI becomes a gate, not a suggestion.

---

## Part C: CD (~30 min)

### Phase 6: Auto-deploy to GitHub Pages (20 min)
- [ ] Settings → Pages → Source: **GitHub Actions**
- [ ] Add a `deploy` job to `pipeline.yml`: `needs: test`, runs only on `main`
- [ ] Push → site live at https://fsideris.github.io/cicd-lab/

*Concepts:* stages (`needs:`), conditions (`if:`), permissions, environments, artifacts.

### Phase 7: The full loop (10 min)
- [ ] Change the page text on a branch → pull request → CI ✓ → merge → auto-deploy → see it live

This is CI/CD end to end.

---

## Later (optional)
- Lint step
- Matrix builds (several Node versions)
- Dependency caching
- Secrets
- Manual approval before deploy
