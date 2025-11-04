#!/usr/bin/env bash
# b_path:: scripts/add-catalog-dep.sh
# Helper script to add dependencies to catalog instead of package.json
# Usage: ./scripts/add-catalog-dep.sh <package-name>

set -e

if [ -z "$1" ]; then
  echo "❌ Error: Package name required"
  echo "Usage: $0 <package-name>"
  echo "Example: $0 lodash"
  exit 1
fi

PACKAGE=$1
TEMP_DIR=$(mktemp -d)
TEMP_PKG="$TEMP_DIR/package.json"

echo "📦 Installing $PACKAGE temporarily to get version..."

# Create temp package.json
cat > "$TEMP_PKG" << 'EOF'
{
  "name": "temp",
  "private": true,
  "dependencies": {}
}
EOF

# Try to install the package
cd "$TEMP_DIR"
if ! pnpm add "$PACKAGE" --silent 2>/dev/null; then
  echo "❌ Error: Package '$PACKAGE' not found in npm registry"
  rm -rf "$TEMP_DIR"
  exit 1
fi

# Extract version using jq
if ! command -v jq &> /dev/null; then
  echo "❌ Error: jq is required but not installed"
  echo "Install: brew install jq"
  rm -rf "$TEMP_DIR"
  exit 1
fi

VERSION=$(jq -r ".dependencies[\"$PACKAGE\"]" "$TEMP_PKG")
rm -rf "$TEMP_DIR"

if [ -z "$VERSION" ] || [ "$VERSION" = "null" ]; then
  echo "❌ Error: Could not determine package version"
  exit 1
fi

cd - > /dev/null

echo "✅ Found version: $VERSION"

# Quote package name if it starts with @
QUOTED_PACKAGE="$PACKAGE"
if [[ "$PACKAGE" == @* ]]; then
  QUOTED_PACKAGE="\"$PACKAGE\""
fi

# Check if already exists in catalog
if grep -q "^  $PACKAGE:" pnpm-workspace.yaml 2>/dev/null || grep -q "^  \"$PACKAGE\":" pnpm-workspace.yaml 2>/dev/null; then
  echo "⚠️  Package already exists in catalog. Updating..."
  # Update existing entry (macOS and Linux compatible)
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/^  \"\\?$PACKAGE\"\\?:.*$/  $QUOTED_PACKAGE: $VERSION/" pnpm-workspace.yaml
  else
    sed -i "s/^  \"\\?$PACKAGE\"\\?:.*$/  $QUOTED_PACKAGE: $VERSION/" pnpm-workspace.yaml
  fi
else
  echo "➕ Adding new entry to catalog..."
  # Add to catalog section (after the 'catalog:' line)
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "/^catalog:/a\\
  $QUOTED_PACKAGE: $VERSION
" pnpm-workspace.yaml
  else
    sed -i "/^catalog:/a\\  $QUOTED_PACKAGE: $VERSION" pnpm-workspace.yaml
  fi
fi

# Sort the catalog entries alphabetically
echo "🔤 Sorting catalog entries..."
TEMP_FILE=$(mktemp)

# Extract header (packages section + catalog: line)
sed -n '1,/^catalog:/p' pnpm-workspace.yaml > "$TEMP_FILE"

# Extract and sort catalog entries (skip catalog: line, sort, then append)
sed -n '/^catalog:/,/^$/p' pnpm-workspace.yaml | \
  tail -n +2 | \
  grep -v '^$' | \
  sort > "$TEMP_FILE.sorted"

# Append sorted entries
cat "$TEMP_FILE.sorted" >> "$TEMP_FILE"

# Replace original file
mv "$TEMP_FILE" pnpm-workspace.yaml
rm -f "$TEMP_FILE.sorted"

echo ""
echo "✅ Added $PACKAGE: $VERSION to catalog"
echo ""
echo "📦 Next steps:"
echo "  1. Run: pnpm install"
echo "  2. Add to your package.json: \"$PACKAGE\": \"catalog:\""
echo ""
