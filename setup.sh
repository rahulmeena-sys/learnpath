#!/usr/bin/env bash
set -e

echo ""
echo "LearnPath — dev setup"
echo "====================="

# ── 1. Node.js ──────────────────────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo "✗ Node.js not found. Install LTS from https://nodejs.org"
  exit 1
fi
NODE_MAJOR=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "✗ Node.js 18+ required (found $(node -v))"
  exit 1
fi
echo "✓ Node $(node -v)  npm $(npm -v)"

# ── 2. Git ───────────────────────────────────────────────────────────────────
if ! command -v git &>/dev/null; then
  echo "✗ git not found. Install from https://git-scm.com"
  exit 1
fi
echo "✓ git $(git --version | awk '{print $3}')"

# ── 3. .env ──────────────────────────────────────────────────────────────────
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo ""
  echo "⚠  .env created from .env.example"
  echo "   Fill in EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY,"
  echo "   and DATABASE_URL — get these from the team — then re-run ./setup.sh"
  exit 0
fi

# Check required vars are not placeholder values
source .env 2>/dev/null || true
if [[ -z "$EXPO_PUBLIC_SUPABASE_URL" || "$EXPO_PUBLIC_SUPABASE_URL" == *"your-project"* ]]; then
  echo "✗ .env is missing real EXPO_PUBLIC_SUPABASE_URL"
  echo "  Get the values from the team and update .env"
  exit 1
fi
if [[ -z "$DATABASE_URL" || "$DATABASE_URL" == *"yourpassword"* ]]; then
  echo "✗ .env is missing real DATABASE_URL"
  echo "  Get the values from the team and update .env"
  exit 1
fi
echo "✓ .env looks good"

# ── 4. npm install ────────────────────────────────────────────────────────────
echo ""
echo "Installing dependencies..."
npm install --silent
echo "✓ Dependencies installed"

# ── 5. DB setup ───────────────────────────────────────────────────────────────
echo ""
echo "Setting up database..."
node --env-file=.env scripts/setup-db.mjs

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo "✅ All done. Start the app:"
echo ""
echo "   npm run web       → browser (fastest, use this for dev)"
echo "   npm run android   → Android device or emulator"
echo ""
