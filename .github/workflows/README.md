# GitHub Actions Workflows

## npm Publish Workflow

This workflow automatically publishes the package to npm when a version tag is pushed.

### Setup

1. **Create an npm access token:**
   - Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   - Click "Generate New Token" → "Automation" (for CI/CD)
   - Copy the token

2. **Add the token to GitHub Secrets:**
   - Go to your GitHub repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Your npm access token
   - Click "Add secret"

### Usage

#### Automatic Publishing (Recommended)

1. Update the version in `package.json`:
   ```json
   {
     "version": "2.1.0"
   }
   ```

2. Commit and push the changes:
   ```bash
   git add package.json
   git commit -m "chore: bump version to 2.1.0"
   git push
   ```

3. Create and push a version tag:
   ```bash
   git tag v2.1.0
   git push origin v2.1.0
   ```

   The workflow will automatically:
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

### Notes

- The workflow uses `pnpm` as the package manager
- Build runs automatically before publish (via `prepublishOnly` script)
- Published package includes: `dist/`, `src/`, and `examples/` directories

