#!/bin/bash
# setup-worktree.sh — À exécuter une fois par session dans un nouveau worktree.
# Usage : bash scripts/setup-worktree.sh (depuis la racine du worktree)
# Idempotent : safe à relancer.

set -e

WORKTREE_DIR="${1:-$(pwd)}"
MAIN_PROJECT="/Users/anthony/Documents/Anthony/Projet Web/lescordistes"
NODE_MODULES_SOURCE="$MAIN_PROJECT/.claude/worktrees/bold-ride/node_modules"
NODE_PATH="/Users/anthony/.nvm/versions/node/v22.14.0/bin"

echo "🔧 Setup worktree : $WORKTREE_DIR"

# 1. Symlink node_modules
if [ ! -e "$WORKTREE_DIR/node_modules" ]; then
    ln -s "$NODE_MODULES_SOURCE" "$WORKTREE_DIR/node_modules"
    echo "✅ node_modules → bold-ride/node_modules"
else
    echo "⏭️  node_modules déjà présent"
fi

# 2. Symlink .env.local
if [ ! -e "$WORKTREE_DIR/.env.local" ]; then
    ln -s "$MAIN_PROJECT/.env.local" "$WORKTREE_DIR/.env.local"
    echo "✅ .env.local symlink créé"
else
    echo "⏭️  .env.local déjà présent"
fi

# 3. Écrire .claude/launch.json avec le bon cwd
mkdir -p "$WORKTREE_DIR/.claude"
cat > "$WORKTREE_DIR/.claude/launch.json" <<EOF
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "lescordistes-next",
      "runtimeExecutable": "/bin/bash",
      "runtimeArgs": ["-c", "export PATH=$NODE_PATH:\$PATH && node_modules/.bin/next dev"],
      "port": 3000,
      "cwd": "$WORKTREE_DIR"
    }
  ]
}
EOF
echo "✅ .claude/launch.json configuré"

echo ""
echo "🚀 Worktree prêt. Lance le serveur avec : npm run dev (ou via preview_start 'lescordistes-next')"
