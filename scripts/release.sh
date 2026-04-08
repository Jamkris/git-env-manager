#!/bin/bash

# git-env-manager Release Helper Script
# Usage: ./scripts/release.sh <version>
# Example: ./scripts/release.sh 1.0.0

set -e

VERSION=$1

if [ -z "$VERSION" ]; then
    echo "Usage: $0 <version>"
    echo "Example: $0 1.0.0"
    exit 1
fi

# Remove 'v' prefix if provided
VERSION="${VERSION#v}"

# Check current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
if [ "$CURRENT_VERSION" = "$VERSION" ]; then
    echo "Error: package.json is already at version $VERSION"
    echo "Specify a different version to release."
    exit 1
fi

echo "Preparing release v$VERSION... ($CURRENT_VERSION → $VERSION)"

# Update package.json via node to preserve formatting
VERSION="$VERSION" node -e '
const fs = require("node:fs");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));
pkg.version = process.env.VERSION;
fs.writeFileSync("package.json", JSON.stringify(pkg, null, "\t") + "\n");
'

# Update src/index.ts version via node (cross-platform)
VERSION="$VERSION" node << 'SCRIPT'
const fs = require("node:fs");
let content = fs.readFileSync("src/index.ts", "utf-8");
const v = process.env.VERSION;
const pattern = /\.version\s*\(\s*['"][^'"]*['"]\s*\)/;
if (!pattern.test(content)) {
  console.error("Error: could not find .version(...) in src/index.ts");
  process.exit(1);
}
content = content.replace(pattern, `.version('${v}')`);
fs.writeFileSync("src/index.ts", content);
SCRIPT

echo "Version updated to $VERSION in package.json and src/index.ts."

# Build and test
echo "Building..."
npm run build

echo "Running tests..."
npm run test:run

# Git commit and tag
git add package.json src/index.ts

if git diff --cached --quiet; then
    echo "Error: No changes to commit. Something went wrong."
    exit 1
fi

echo "Committing version bump..."
git commit -m "chore: bump version to $VERSION"

echo "Creating tag v$VERSION..."
git tag "v$VERSION"

BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo ""
echo "Done!"
echo "Next steps:"
echo "1. git push origin $BRANCH"
echo "2. git push origin v$VERSION"
if [ "$BRANCH" != "main" ]; then
    echo "3. Create a PR to merge '$BRANCH' into main"
    echo "   gh pr create --title 'chore: release v$VERSION' --body 'Bump version to $VERSION'"
    echo "4. After merge, push the tag: git push origin v$VERSION"
    echo "5. Check GitHub Actions for the Release process."
else
    echo "3. Check GitHub Actions for the Release process."
fi
