# Branch Protection and Rulesets

This document describes the recommended branch protection rules and rulesets for the CDN-OrPaynter-AI repository.

## Overview

Branch rulesets help enforce best practices for code quality, security, and collaboration. This repository uses GitHub Branch Rulesets to protect the `main` branch and ensure all changes go through proper review and validation.

## Recommended Ruleset Configuration

### Ruleset Name: `main-branch-protection`

**Target Branches:** `main`

### Rules to Enable

#### 1. Require Pull Request Before Merging

- **Required approving reviews:** 1
- **Dismiss stale pull request approvals when new commits are pushed:** Yes
- **Require review from Code Owners:** No (unless CODEOWNERS file is added)
- **Require approval of the most recent reviewable push:** Yes

#### 2. Require Status Checks to Pass

Required status checks before merging:

- `Lint` (from CI workflow)
- `Build` (from CI workflow)
- `Security Check` (from CI workflow)

**Configuration:**

- **Require branches to be up to date before merging:** Yes
- This ensures the branch has the latest changes from main before merging

#### 3. Block Force Pushes

- Prevent force pushes to the main branch
- Protects commit history integrity

#### 4. Restrict Deletions

- Prevent the main branch from being deleted
- Critical for repository stability

#### 5. Require Linear History

- **Recommended:** Yes
- Enforces a clean, linear Git history
- Requires squash merging or rebase merging (no merge commits)

#### 6. Require Signed Commits (Optional)

- **Recommended for high-security environments:** Yes
- **For general development:** Optional
- Verifies commit authenticity with GPG signatures

#### 7. Require Conversation Resolution Before Merging

- **Recommended:** Yes
- Ensures all PR comments are addressed before merging

## Setting Up the Ruleset

### Via GitHub UI (Recommended)

1. Navigate to your repository on GitHub
2. Go to **Settings** → **Rules** → **Rulesets**
3. Click **New ruleset** → **New branch ruleset**
4. Configure with the settings above:
   - **Ruleset Name:** `main-branch-protection`
   - **Enforcement status:** Active
   - **Target branches:** Add branch → Include default branch
   - **Branch protections:** Enable all recommended rules above
5. Click **Create** to save

### Branch Protection Rules Summary

```yaml
# Conceptual representation of the ruleset
ruleset:
  name: main-branch-protection
  target:
    branches:
      - main
  enforcement: active

  rules:
    require_pull_request:
      required_approving_review_count: 1
      dismiss_stale_reviews: true
      require_last_push_approval: true

    require_status_checks:
      strict: true
      checks:
        - Lint
        - Build
        - Security Check

    block_force_pushes: true
    restrict_deletions: true
    require_linear_history: true
    require_conversation_resolution: true
    require_signed_commits: false # Set to true if needed
```

## CI/CD Integration

The `.github/workflows/ci.yml` workflow provides the required status checks:

- **Lint:** Runs ESLint to ensure code quality
- **Build:** Verifies the Next.js application builds successfully
- **Security:** Checks for known vulnerabilities in dependencies

These checks must pass before a PR can be merged to main.

## Development Workflow

With these rulesets in place, the recommended workflow is:

1. Create a feature branch from `main`

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit regularly

   ```bash
   git add .
   git commit -m "Your commit message"
   ```

3. Push your branch and create a Pull Request

   ```bash
   git push origin feature/your-feature-name
   ```

4. Ensure all CI checks pass (Lint, Build, Security)

5. Request review from a team member

6. Address any review comments

7. Once approved and all checks pass, squash and merge the PR

## Benefits

- **Code Quality:** Ensures linting and builds pass before merging
- **Security:** Prevents vulnerable dependencies from being introduced
- **Collaboration:** Requires code review, promoting knowledge sharing
- **History Integrity:** Prevents force pushes and maintains clean history
- **Stability:** Protects the main branch from accidental deletions

## Maintenance

- Review and update ruleset configuration as team practices evolve
- Add additional status checks as new CI workflows are introduced
- Adjust review requirements based on team size and velocity
- Consider enabling signed commits for compliance requirements

## Additional Resources

- [GitHub Rulesets Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- [Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Required Status Checks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks)
