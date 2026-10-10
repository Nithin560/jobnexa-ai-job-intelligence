# GITHUB_WORKFLOW.md — How to commit and push in this project

> **For the AI agent:** these rules are mandatory. Read this file at the start of every session, after `PLAN.md`. When a rule here conflicts with a shortcut, follow the rule. If you cannot follow a rule, stop and tell the owner why.

Owner GitHub: `Nithin560` · Repo: `job-intelligence` · Default branch: `main`

---

## 1. The 10 rules (short version)

1. `main` always works. Never commit directly to `main`; work on a branch `day-N/<short-name>`.
2. One logical change per commit. Small commits, many per day.
3. Run the tests **before** every commit. Never commit a red test run unless the message says `wip` and you are on a branch.
4. Look before you stage: run `git status` and `git diff`. Stage **named files**, never `git add .` or `git add -A` blindly.
5. Never commit secrets, `.env`, API keys, database dumps, `node_modules/`, `.venv/`, or personal data. Only `.env.example` with dummy values.
6. Commit messages follow Conventional Commits (section 4).
7. Push after every commit or small group of commits. Unpushed work is lost work.
8. Never force-push (`--force`) and never rewrite history that is already pushed.
9. Before you stop: commit, push, update the status block in `PLAN.md`, push again.
10. If something unexpected shows up in `git status` (files you did not touch), stop and ask instead of committing it.

---

## 2. One-time setup (first session only)

Run these once, on the owner's machine.

```bash
# 1. Identify yourself (use the email attached to your GitHub account)
git config --global user.name  "Nithin"
git config --global user.email "<your-github-email>"
git config --global init.defaultBranch main
git config --global pull.rebase true        # keeps history linear when pulling

# 2. Log in to GitHub (pick HTTPS, log in via browser)
gh auth login

# 3. Create the project folder and repo
mkdir job-intelligence && cd job-intelligence
git init
```

Create the first files **before** the first commit:

- `.gitignore` (must include: `.env`, `.venv/`, `__pycache__/`, `node_modules/`, `dist/`, `*.log`, `*.sqlite3`, `*.dump`, `pgdata/`, `.idea/`, `.vscode/` (except shared settings), `.DS_Store`)
- `.env.example` (dummy values only)
- `README.md`, `PLAN.md`, `GITHUB_WORKFLOW.md`
- `docs/` with the project documentation PDF

```bash
git add .gitignore .env.example README.md PLAN.md GITHUB_WORKFLOW.md docs/
git status                       # confirm nothing unexpected is staged
git commit -m "chore: initial project setup with plan and docs"

# Create the empty GitHub repo and push (private first; make public when ready)
gh repo create Nithin560/job-intelligence --private --source=. --remote=origin --push
```

If the repo was already created on github.com instead:

```bash
git remote add origin https://github.com/Nithin560/job-intelligence.git
git push -u origin main
```

Optional but useful: turn on branch protection for `main` on GitHub (Settings → Branches) so nothing is pushed straight to it.

---

## 3. Branch workflow (one branch per day)

| Step | Command |
|---|---|
| Start from a fresh `main` | `git switch main && git pull` |
| Create the day's branch | `git switch -c day-1/foundation` |
| First push of the branch | `git push -u origin day-1/foundation` |
| Later pushes | `git push` |

Branch names: `day-<N>/<short-kebab-name>`, matching `PLAN.md` (for example `day-3/connectors-scan`). For a fix inside a day, use `fix/<short-name>` and merge it into the day branch or `main`.

---

## 4. Commit message format

```
<type>(<scope>): <short summary in imperative mood>

<optional body: what changed and WHY, wrapped at ~72 chars>

<optional footer: refs, breaking changes>
```

**Rules for the summary line:** imperative ("add", not "added"), lower-case after the colon, no full stop, 72 characters or fewer.

**Types**

| Type | Use for |
|---|---|
| `feat` | a new capability |
| `fix` | a bug fix |
| `test` | adding or fixing tests only |
| `docs` | README, PLAN.md, docs/ only |
| `refactor` | restructure with no behaviour change |
| `chore` | tooling, config, dependencies, `.gitignore` |
| `build` | Docker, Compose, packaging |
| `ci` | GitHub Actions |
| `perf` | performance improvement |
| `wip` | unfinished work saved to a branch (never merged as-is) |

**Scopes** (use the closest one): `api`, `db`, `auth`, `connector`, `scan`, `pipeline`, `match`, `search`, `admin`, `frontend`, `infra`, `tests`, `docs`.

---

## 5. The commit loop (repeat for every small piece of work)

```bash
# 1. Run the tests (backend; also run frontend tests/lint once the frontend exists)
pytest

# 2. See exactly what changed
git status
git diff

# 3. Stage only the files that belong to this change
git add backend/app/connectors/ backend/app/tests/test_connectors.py

# 4. Check what is staged. Confirm no .env, no secrets, no stray files
git diff --staged

# 5. Commit
git commit -m "feat(connector): add fixture connector and registry"

# 6. Push
git push
```

---

## 6. End-of-day routine (do all of it, in order)

```bash
# 1. Tests green
pytest

# 2. Tick finished checkboxes in PLAN.md and update the "Current status" block
git add PLAN.md
git commit -m "docs: update PLAN.md status for day N"
git push

# 3. Open a pull request into main
gh pr create --base main --head day-N/<short-name> --title "Day N: <what was built>"

# 4. Merge PR
gh pr merge --merge --delete-branch

# 5. Sync main and tag the day
git switch main
git pull
git tag day-N-complete
git push origin day-N-complete
```
