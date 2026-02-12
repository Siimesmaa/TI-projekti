# GitHub Actions Workflows

## Overview

This directory contains GitHub Actions workflow configurations for the TI-projekti repository.

## Workflows

### `git-setup.yml` - Git Setup with Full History

**Purpose**: Ensures complete git history is available to prevent git operation failures.

**Problem it Solves**: 
When using shallow clones (default GitHub Actions behavior), certain git operations fail with errors like:
```
fatal: path 'README.md' exists on disk, but not in '703c9dbf24e59d94980d7d6e102c3f54e6334076'
```

This happens because:
- By default, GitHub Actions checks out only the latest commit (`fetch-depth: 1`)
- Tools like Copilot agents, code review tools, and CI/CD processes often need access to historical commits
- Commands like `git show <commit-sha>` fail when the commit isn't in the shallow clone

**Solution**:
This workflow uses `fetch-depth: 0` which:
- ✅ Fetches complete git history
- ✅ Makes all commits, branches, and tags available
- ✅ Enables git operations on any commit in the repository
- ✅ Supports code review and analysis tools that need historical context

**Usage**:

#### As a Reusable Workflow

Reference this workflow from another workflow:

```yaml
jobs:
  setup:
    uses: ./.github/workflows/git-setup.yml
  
  your-job:
    needs: setup
    runs-on: ubuntu-latest
    steps:
      # Your steps here - git history is now available
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      # ... other steps
```

#### Manual Trigger

You can manually trigger this workflow from the Actions tab to test git setup.

#### In Your Own Workflow

Alternatively, include the setup directly in your workflow:

```yaml
jobs:
  your-job:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout with full history
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Fetch all tags and branches
        run: |
          git fetch --tags --force
          git fetch --all
      
      # Your other steps
```

## Best Practices

### When to Use Full History

Use `fetch-depth: 0` when:
- Running code review tools (e.g., Copilot agents, reviewdog)
- Performing security scans that analyze code changes
- Generating changelogs or release notes
- Running tools that compare against previous commits
- Analyzing git history for metrics or reports

### When Shallow Clones Are Fine

Use default shallow clone when:
- Only building/testing current commit
- Deploying static files
- Running simple checks that don't need history

### Performance Considerations

- **Shallow clone** (`fetch-depth: 1`): Faster, uses less bandwidth, suitable for most CI tasks
- **Full history** (`fetch-depth: 0`): Slower, more bandwidth, necessary for historical analysis

Choose based on your workflow's needs.

## Configuration Details

### Git Safe Directory

The workflow configures git safe directory to avoid ownership warnings:
```bash
git config --global --add safe.directory "$GITHUB_WORKSPACE"
```

This is necessary when running git operations in GitHub Actions runners.

### Fetching Strategy

1. **Checkout with full history**: `fetch-depth: 0`
2. **Fetch tags**: `git fetch --tags --force` (ensures all tags are available)
3. **Fetch branches**: `git fetch --all` (ensures all remote branches are available)

This combination ensures complete repository state for any git operation.

## Troubleshooting

### Error: "fatal: path exists on disk, but not in commit"

**Cause**: Shallow clone doesn't have the referenced commit.

**Solution**: Use this workflow or add `fetch-depth: 0` to your checkout step.

### Error: "unknown revision or path not in the working tree"

**Cause**: Tag or branch not fetched.

**Solution**: Run `git fetch --tags --all` after checkout.

## Contributing

When adding new workflows:
1. Document the workflow's purpose in this README
2. Use clear, descriptive names
3. Add comments explaining non-obvious configurations
4. Test workflows before merging

## References

- [GitHub Actions Checkout Documentation](https://github.com/actions/checkout)
- [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Reusable Workflows](https://docs.github.com/en/actions/using-workflows/reusing-workflows)
