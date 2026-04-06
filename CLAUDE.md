You are a senior software architect. Your task is to fully audit, clean, and refactor this project. Work methodically through each phase below. After each phase, summarize what was done before moving to the next.

---

## PHASE 1 — Project Audit

1. List all files and folders in the project root. Identify:
   - Unused or duplicate files (configs, assets, scripts)
   - Dead code (unused functions, components, variables)
   - Orphaned files not imported anywhere
   - Inconsistent naming conventions (mixed camelCase / kebab-case / snake_case)
   - Oversized files that should be split

2. Read package.json (or equivalent). Identify:
   - Unused dependencies (not imported anywhere in the codebase)
   - Outdated or redundant devDependencies
   - Missing or incorrect scripts

3. Check for:
   - .env files accidentally committed
   - Hardcoded secrets, API keys, or credentials in the code
   - Large binary files or build artifacts that should be in .gitignore

---

## PHASE 2 — File & Folder Structure Cleanup

1. Propose and apply a clean folder structure adapted to this project type.
2. Remove all empty folders.
3. Remove all files that serve no purpose (e.g. *.bak, *.orig, temp files, duplicate configs).
4. Consolidate duplicated logic into shared utilities or services.
5. Ensure .gitignore is complete and correct for this stack. Add any missing entries (node_modules, .env, dist, .DS_Store, etc.).

---

## PHASE 3 — Code Refactoring

1. Rename files and variables to follow a single consistent convention throughout the project.
2. Break down any function or component longer than 80 lines into smaller, focused units.
3. Replace all magic numbers and hardcoded strings with named constants.
4. Remove all commented-out code blocks.
5. Standardize import ordering (external libs → internal modules → relative imports).
6. If a linter config exists (.eslintrc, .prettierrc, etc.), enforce it. If not, create a sensible one for this stack and apply it.

---

## PHASE 4 — GitHub & Git Cleanup

1. Run: `git worktree list` — identify and remove all stale or merged worktrees with `git worktree remove` and `git worktree prune`.
2. Run: `git branch -a` — list all local and remote branches. For each branch:
   - Check if it has been merged into main/master
   - If merged and stale: delete locally with `git branch -d` and remotely with `git push origin --delete`
   - If unmerged but abandoned (no commits in 30+ days): flag it for manual review
3. Run: `git remote prune origin` to clean up remote tracking refs that no longer exist.
4. Check for large files in git history using: `git rev-list --objects --all | sort -k 2 | uniq` — flag anything unexpectedly large.
5. Verify the default branch name and that the remote origin is correctly set.

---

## PHASE 5 — Final Verification

1. Run the project's test suite (if any). All tests must pass.
2. Run the build command. The build must succeed with no errors or warnings.
3. Run the linter. Zero errors, zero warnings.
4. Produce a clean summary report with:
   - Files deleted
   - Files renamed or moved
   - Dependencies removed
   - Branches and worktrees cleaned
   - Remaining TODOs or items requiring manual decision

Do not skip any phase. If you are uncertain about deleting something, ask before proceeding.
