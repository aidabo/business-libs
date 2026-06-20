#!/usr/bin/env bash
# This script creates symlinks in symlinked workspace packages so that
# Node.js and TypeScript can resolve hoisted dependencies from the workspace root.
#
# Problem: packages/business and packages/stackpage are symlinks to directories
# outside the workspace root (e.g., 11-business/, 06-stackpage/). When Node/tsc
# resolves modules from the real path (11-business/estate/...), it walks up parent
# directories and never reaches the workspace root's node_modules/ where deps are hoisted.
#
# Solution: Create symlinks in each workspace package's node_modules/ pointing to
# the workspace root's node_modules/ for each dependency the package needs.
#
# Usage: bash setup-symlinks.sh
# Run from either 05-estate/ or 01-ghost-front/ root, or pass the root as argument:
#   bash setup-symlinks.sh /path/to/workspace/root

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="${1:-$(cd "$SCRIPT_DIR/.." && pwd)}"

# Find the workspace root (must have package.json with workspaces)
while [ "$WORKSPACE_ROOT" != "/" ]; do
  if [ -f "$WORKSPACE_ROOT/package.json" ] && grep -q '"workspaces"' "$WORKSPACE_ROOT/package.json" 2>/dev/null; then
    break
  fi
  WORKSPACE_ROOT="$(cd "$WORKSPACE_ROOT/.." && pwd)"
done

ROOT_NM="$WORKSPACE_ROOT/node_modules"

echo "Workspace root: $WORKSPACE_ROOT"
echo "Root node_modules: $ROOT_NM"

if [ ! -d "$ROOT_NM" ]; then
  echo "ERROR: $ROOT_NM does not exist. Run yarn install first."
  exit 1
fi

link_pkg() {
  local target="$1"  # relative path under workspace root
  local pkg="$2"     # package name to link

  local real_dir
  real_dir="$(cd "$WORKSPACE_ROOT/$target" 2>/dev/null && pwd)" || return 1
  local nm_dir="$real_dir/node_modules"

  if [ ! -d "$nm_dir" ]; then
    mkdir -p "$nm_dir"
  fi

  local dest="$nm_dir/$pkg"
  if [ -e "$dest" ]; then
    echo "  already exists: $target/node_modules/$pkg"
    return 0
  fi

  # Handle @scoped/packages
  if [[ "$pkg" == @*/* ]]; then
    local scope="${pkg%%/*}"
    mkdir -p "$nm_dir/$scope"
    ln -s "$ROOT_NM/$pkg" "$dest"
  else
    ln -s "$ROOT_NM/$pkg" "$dest"
  fi
  echo "  linked: $target/node_modules/$pkg"
}

echo "Linking dependencies..."

# @ghost-next/estate
for pkg in react react-dom @types/react @types/react-dom @heroicons/react vite @vitejs/plugin-react vite-plugin-dts tailwindcss autoprefixer; do
  link_pkg "packages/business/estate" "$pkg"
done

# @ghost-next/portal
for pkg in react react-dom @types/react @types/react-dom vite @vitejs/plugin-react vite-plugin-dts tailwindcss autoprefixer; do
  link_pkg "packages/business/portal" "$pkg"
done

echo "Done."
