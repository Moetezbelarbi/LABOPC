#!/usr/bin/env bash
# ============================================================
# LABOPC — Script de déploiement
# © M.Belarbi — Tous droits réservés.
# Usage : ./deploy.sh [patch|minor|major] ["message"]
# ============================================================
set -euo pipefail

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; CYAN='\033[0;36m'; NC='\033[0m'

BUMP_TYPE="patch"; COMMIT_MSG=""; DRY_RUN=false
for arg in "$@"; do
  case "$arg" in
    major|minor|patch) BUMP_TYPE="$arg" ;;
    --dry-run) DRY_RUN=true ;;
    *) [ -z "$COMMIT_MSG" ] && COMMIT_MSG="$arg" || true ;;
  esac
done

[ -f "version.json" ] || { echo -e "${RED}❌ version.json introuvable${NC}"; exit 1; }
[ -f "sw.js" ] || { echo -e "${RED}❌ sw.js introuvable${NC}"; exit 1; }
command -v jq >/dev/null || { echo -e "${RED}❌ jq requis${NC}"; exit 1; }

CURRENT_VERSION=$(jq -r '.version' version.json)
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"

case "$BUMP_TYPE" in
  major) MAJOR=$((MAJOR+1)); MINOR=0; PATCH=0 ;;
  minor) MINOR=$((MINOR+1)); PATCH=0 ;;
  patch) PATCH=$((PATCH+1)) ;;
esac

NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"
NEW_CACHE_VERSION="labopc-v${NEW_VERSION}"
TODAY=$(date +%Y-%m-%d)
[ -z "$COMMIT_MSG" ] && COMMIT_MSG="release: LABOPC v${NEW_VERSION}"

echo -e "${CYAN}📦 ${CURRENT_VERSION} → ${GREEN}${NEW_VERSION}${NC}"

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}DRY-RUN : aucune modification${NC}"
  exit 0
fi

jq --arg v "$NEW_VERSION" --arg d "$TODAY" --arg n "Release $NEW_VERSION" \
   '.version=$v | .date=$d | .notes=$n' version.json > version.json.tmp && mv version.json.tmp version.json

if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' -E "s|const CACHE_VERSION = '[^']*';|const CACHE_VERSION = '${NEW_CACHE_VERSION}';|" sw.js
else
  sed -i -E "s|const CACHE_VERSION = '[^']*';|const CACHE_VERSION = '${NEW_CACHE_VERSION}';|" sw.js
fi

git add -A
git commit -m "$COMMIT_MSG" || echo -e "${YELLOW}⚠️ Rien à commiter${NC}"
git push
echo -e "${GREEN}✅ Déployé : v${NEW_VERSION}${NC}"