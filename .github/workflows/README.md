# GitHub Actions Workflows

## npm Publish Workflow

This workflow automatically publishes the package to npm when a version tag is pushed.

### Setup

1. **Create an npm access token:**
   - Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   - Click "Generate New Token" → Choose "Automation" (for CI/CD)
   - **Important:** Copy the token immediately (you won't see it again!)
   - The token should start with `npm_` (e.g., `npm_xxxxxxxxxxxxx`)

2. **Add the token to GitHub Secrets:**
   - Go to your GitHub repository: `https://github.com/YOUR_USERNAME/handsontable-editor`
   - Click **Settings** (top menu)
   - Click **Secrets and variables** → **Actions** (left sidebar)
   - Click **New repository secret**
   - **Name:** `NPM_TOKEN` (must be exactly this)
   - **Secret:** Paste your npm token
   - Click **Add secret**

**⚠️ Note:** After adding the secret, the workflow will use it automatically on the next run. You don't need to restart the failed workflow - just push a new tag or re-run it.

### Usage

#### Automatic Publishing (Recommended)

1. **Ensure lockfile is up to date:**
   ```bash
   pnpm install
   git add pnpm-lock.yaml
   git commit -m "chore: update lockfile"
   ```

2. Update the version in `package.json`:
   ```json
   {
     "version": "2.1.0"
   }
   ```

3. Commit and push the changes:
   ```bash
   git add package.json
   git commit -m "chore: bump version to 2.1.0"
   git push
   ```

4. Create and push a version tag:
   ```bash
   git tag v2.1.0
   git push origin v2.1.0
   ```

   The workflow will automatically:
   - Verify the lockfile is in sync with package.json
   - Verify the version matches the tag
   - Build the package
   - Publish to npm

#### Manual Publishing

You can also trigger the workflow manually:

1. Go to Actions tab in GitHub
2. Select "Publish to npm" workflow
3. Click "Run workflow"
4. Enter the version tag (e.g., `v2.1.0`)
5. Click "Run workflow"

### Workflow Triggers

- **Automatic**: When a tag matching `v*.*.*` pattern is pushed (e.g., `v1.0.0`, `v2.1.3`)
- **Manual**: Via GitHub Actions UI (workflow_dispatch)

### Version Verification

The workflow ensures that:
- The tag version matches the version in `package.json`
- Build artifacts are generated successfully
- Only valid versions are published

### Troubleshooting

#### Version Mismatch Error

If you see an error like `package.json version (2.0.2) does not match tag version (2.0.3)`, it means the tag was created but the package.json wasn't updated in that commit. To fix:

```bash
# 1. Make sure package.json has the correct version
# Edit package.json and set version to match your tag (e.g., "2.0.3")

# 2. Commit the version change
git add package.json
git commit -m "chore: bump version to 2.0.3"
git push

# 3. Delete the incorrect tag (both locally and remotely)
git tag -d v2.0.3
git push origin --delete v2.0.3

# 4. Create a new tag pointing to the correct commit
git tag v2.0.3
git push origin v2.0.3
```

**Important:** Always update `package.json` version BEFORE creating the tag!

#### Lockfile Out of Sync Error

If you see an error like `Cannot install with "frozen-lockfile" because pnpm-lock.yaml is not up to date`, it means your lockfile doesn't match your `package.json`. To fix:

```bash
# Update the lockfile
pnpm install

# Commit the updated lockfile
git add pnpm-lock.yaml
git commit -m "chore: update lockfile"
git push

# Then create your tag
git tag v2.1.0
git push origin v2.1.0
```

#### NPM Authentication Error

If you see an error like `npm error need auth This command requires you to be logged in`, it means the `NPM_TOKEN` secret is not configured. To fix:

1. **Create an npm token** (see Setup section above)
2. **Add it to GitHub Secrets** as `NPM_TOKEN`
3. **Re-run the workflow** or push a new tag

The error `NODE_AUTH_TOKEN: ` (empty) in the logs indicates the secret is missing.

### Notes

- The workflow uses `pnpm` version 9 (matches lockfile format)
- Build runs automatically before publish (via `prepublishOnly` script)
- Published package includes: `dist/`, `src/`, and `examples/` directories
- Always ensure `pnpm-lock.yaml` is committed and up to date before creating release tags
- **Required:** You must configure `NPM_TOKEN` secret before publishing will work

