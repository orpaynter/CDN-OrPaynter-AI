# Quick Setup Guide for Branch Rulesets

Follow these steps to activate the branch protection ruleset for your repository.

## Prerequisites

- Repository admin access
- GitHub repository with the main branch

## Step-by-Step Setup

### 1. Navigate to Repository Settings

1. Go to your repository on GitHub: `https://github.com/orpaynter/CDN-OrPaynter-AI`
2. Click on **Settings** tab
3. In the left sidebar, click on **Rules** (under "Code and automation")
4. Click on **Rulesets**

### 2. Create New Ruleset

1. Click the **New ruleset** button
2. Select **New branch ruleset**

### 3. Configure Basic Settings

**Ruleset Name:** `main-branch-protection`

**Enforcement status:** Active

**Bypass list:** (Leave empty unless you need specific users/teams to bypass)

### 4. Target Branches

Under "Target branches":

1. Click **Add target**
2. Select **Include default branch**
   - This will automatically target your `main` branch

### 5. Branch Protection Rules

Enable the following rules by checking their boxes:

#### ✅ Restrict deletions

- Prevents the branch from being deleted

#### ✅ Require a pull request before merging

- Set **Required approvals:** `1`
- ✅ Check **Dismiss stale pull request approvals when new commits are pushed**
- ✅ Check **Require approval of the most recent reviewable push**
- ✅ Check **Require conversation resolution before merging**

#### ✅ Require status checks to pass

- ✅ Check **Require branches to be up to date before merging**
- Add the following status checks (these will appear after the CI workflow runs at least once):
  - `Quality Checks`
  - `Build`
  - `Security Audit`

#### ✅ Block force pushes

- Prevents force pushes to the branch

#### ✅ Require linear history

- Enforces a clean Git history (no merge commits)

#### Optional: Require signed commits

- Only enable if your organization requires GPG-signed commits
- ⚠️ Contributors will need to set up commit signing

### 6. Save the Ruleset

1. Review all settings
2. Click **Create** at the bottom of the page

## Verification

After creating the ruleset:

1. Try to push directly to `main` - it should be blocked
2. Create a test pull request
3. Verify that the CI checks appear and run
4. Confirm that the PR cannot be merged without:
   - Passing all status checks
   - At least 1 approval
   - All conversations resolved

## CI Workflow Status Checks

The following CI jobs will run automatically on pull requests:

| Check Name     | What it Does                              |
| -------------- | ----------------------------------------- |
| Quality Checks | Runs Prettier to check code formatting    |
| Build          | Attempts to build the Next.js application |
| Security Audit | Checks for dependency vulnerabilities     |

**Note:** The build check may fail in CI due to network dependencies (e.g., fetching data from Wikipedia). This is expected for this demo project. In production, consider mocking external dependencies or providing appropriate environment variables.

## Troubleshooting

### Status checks not appearing

- Make sure the CI workflow has run at least once
- Check the **Actions** tab to see workflow runs
- Status checks appear after the first successful workflow run

### Cannot merge after approval

- Ensure all required status checks have passed
- Verify branch is up to date with main
- Check that all conversations are resolved

### Need to bypass for emergencies

- Repository admins can be added to the bypass list
- Only do this if absolutely necessary
- Remove bypass access after the emergency

## Maintenance

### Adding New Status Checks

When adding new CI workflows:

1. Go to **Settings** → **Rules** → **Rulesets**
2. Edit the `main-branch-protection` ruleset
3. Under "Require status checks to pass", add the new check name
4. Save the ruleset

### Updating Required Approvals

If your team grows:

1. Edit the ruleset
2. Update the "Required approvals" number
3. Save changes

## Additional Resources

- [GitHub Rulesets Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- [Managing Required Status Checks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks)
- [Repository Roles](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/repository-roles-for-an-organization)

---

**Questions or Issues?** Please open an issue in the repository or contact the repository maintainers.
