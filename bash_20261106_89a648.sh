#!/usr/bin/env bash
# ============================================================
# LABOPC — Script de déploiement
# © M.Belarbi — Tous droits réservés.
# ============================================================
# Usage :
#   ./deploy.sh              → incrémente la version patch (1.0.0 → 1.0.1)
#   ./deploy.sh minor        → incrémente la version minor (1.0.0 → 1.1.0)
#   ./deploy.sh major        → incrémente la version major (1.0.0 → 2.0.0)
#   ./deploy.sh patch "msg"  → incrémente + message de commit personnalisé
#   ./deploy.sh --dry-run    → simule sans publier
# ============================================================

set -e  # arrêt en cas d'erreur
set -u  # arrêt si variable non définie

# ---------- Couleurs ----------
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

# ---------- Bannière ----------
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}  ${BOLD}LABOPC — Déploiement automatisé${NC}         ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}  © M.Belarbi                              ${BLUE}║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# ---------- Parsing des arguments ----------
BUMP_TYPE="patch"
COMMIT_MSG=""
DRY_RUN=false

for arg in "$@"; do
  case "$arg" in
    major|minor|patch) BUMP_TYPE="$arg" ;;
    --dry-run) DRY_RUN=true ;;
    *) [ -z "$COMMIT_MSG" ] && COMMIT_MSG="$arg" || true ;;
  esac
done

# ---------- Vérifications préalables ----------
if [ ! -f "version.json" ]; then
  echo -e "${RED}❌ Erreur : version.json introuvable.${NC}"
  echo -e "   Ce script doit être exécuté à la racine du projet labopc/."
  exit 1
fi

if [ ! -f "sw.js" ]; then
  echo -e "${RED}❌ Erreur : sw.js introuvable.${NC}"
  exit 1
fi

if [ ! -f "manifest.json" ]; then
  echo -e "${RED}❌ Erreur : manifest.json introuvable.${NC}"
  exit 1
fi

if ! command -v jq &> /dev/null; then
  echo -e "${RED}❌ Erreur : 'jq' est requis (installer : brew install jq / apt install jq).${NC}"
  exit 1
fi

# Vérifier qu'on est bien dans un dépôt git (sauf dry-run)
if [ "$DRY_RUN" = false ]; then
  if ! git rev-parse --is-inside-work-tree &> /dev/null; then
    echo -e "${RED}❌ Erreur : ce dossier n'est pas un dépôt git.${NC}"
    exit 1
  fi

  if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Des modifications non commitées sont présentes.${NC}"
    read -p "   Continuer quand même ? (o/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[OoYy]$ ]]; then
      echo -e "${RED}Déploiement annulé.${NC}"
      exit 1
    fi
  fi

  # Branche courante
  BRANCH=$(git rev-parse --abbrev-ref HEAD)
  echo -e "🌿 Branche : ${CYAN}${BRANCH}${NC}"
fi

# ---------- Lire la version actuelle ----------
CURRENT_VERSION=$(jq -r '.version' version.json)
echo -e "📦 Version actuelle : ${CYAN}${CURRENT_VERSION}${NC}"

if [[ ! "$CURRENT_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo -e "${RED}❌ Format de version invalide dans version.json (attendu : X.Y.Z).${NC}"
  exit 1
fi

IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"

# ---------- Calculer la nouvelle version ----------
case "$BUMP_TYPE" in
  major) MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0 ;;
  minor) MINOR=$((MINOR + 1)); PATCH=0 ;;
  patch) PATCH=$((PATCH + 1)) ;;
  *) echo -e "${RED}❌ Type de bump inconnu : $BUMP_TYPE${NC}"; exit 1 ;;
esac

NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"
NEW_CACHE_VERSION="labopc-v${NEW_VERSION}"
TODAY=$(date +%Y-%m-%d)

echo -e "🆕 Nouvelle version : ${GREEN}${BOLD}${NEW_VERSION}${NC}"
echo -e "   Cache SW        : ${CYAN}${NEW_CACHE_VERSION}${NC}"
echo -e "   Type de bump    : ${BUMP_TYPE}"

# Message de commit par défaut
if [ -z "$COMMIT_MSG" ]; then
  COMMIT_MSG="release: LABOPC v${NEW_VERSION}"
fi
echo -e "💬 Commit : ${CYAN}${COMMIT_MSG}${NC}"
echo ""

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}═══════════════════════════════════════════${NC}"
  echo -e "${YELLOW}   MODE DRY-RUN — Aucune modification réelle${NC}"
  echo -e "${YELLOW}═══════════════════════════════════════════${NC}"
  echo ""
  echo -e "Modifications qui seraient appliquées :"
  echo -e "  • version.json  : ${CURRENT_VERSION} → ${NEW_VERSION}"
  echo -e "  • sw.js         : CACHE_VERSION = '${NEW_CACHE_VERSION}'"
  echo -e "  • manifest.json : (inchangé, pas de champ version)"
  echo -e "  • git commit    : \"${COMMIT_MSG}\""
  echo -e "  • git push      : origin ${BRANCH:-main}"
  echo ""
  exit 0
fi

# ---------- Mise à jour de version.json ----------
echo -e "📝 Mise à jour de ${CYAN}version.json${NC}..."
jq --arg v "$NEW_VERSION" --arg d "$TODAY" --arg n "Release $NEW_VERSION" \
   '.version = $v | .date = $d | .notes = $n' \
   version.json > version.json.tmp && mv version.json.tmp version.json

# ---------- Mise à jour de sw.js ----------
echo -e "📝 Mise à jour de ${CYAN}sw.js${NC}..."
# Remplace la ligne : const CACHE_VERSION = 'labopc-vX.Y.Z';
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS nécessite un sed -i ''
  sed -i '' -E "s|const CACHE_VERSION = '[^']*';|const CACHE_VERSION = '${NEW_CACHE_VERSION}';|" sw.js
else
  sed -i -E "s|const CACHE_VERSION = '[^']*';|const CACHE_VERSION = '${NEW_CACHE_VERSION}';|" sw.js
fi

# Vérifier que la modif a bien eu lieu
if ! grep -q "CACHE_VERSION = '${NEW_CACHE_VERSION}'" sw.js; then
  echo -e "${RED}❌ Échec de la mise à jour de sw.js.${NC}"
  exit 1
fi

# ---------- Vérification de cohérence ----------
echo ""
echo -e "🔍 Vérification finale..."
echo -e "   version.json    → ${GREEN}$(jq -r '.version' version.json)${NC}"
echo -e "   sw.js           → ${GREEN}$(grep -oE "CACHE_VERSION = '[^']*'" sw.js | head -1)${NC}"

# ---------- Git commit + push ----------
echo ""
echo -e "🚀 Publication..."
git add version.json sw.js index.html manifest.json icons/ 2>/dev/null || git add version.json sw.js index.html manifest.json

if git diff --cached --quiet; then
  echo -e "${YELLOW}⚠️  Aucun changement à commiter.${NC}"
else
  git commit -m "$COMMIT_MSG"
  echo -e "${GREEN}✅ Commit créé${NC}"
fi

git push origin "$BRANCH"
echo -e "${GREEN}✅ Push vers origin/${BRANCH}${NC}"

# ---------- Résumé ----------
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║${NC}  ${BOLD}✅ Déploiement réussi${NC}                    ${GREEN}║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo -e "   Version déployée : ${BOLD}${NEW_VERSION}${NC}"
echo -e "   Cache SW         : ${NEW_CACHE_VERSION}"
echo -e "   Branche          : ${BRANCH}"
echo ""
echo -e "${YELLOW}⏳ Les utilisateurs recevront le toast de mise à jour à leur prochaine visite.${NC}"
echo -e "${YELLOW}   (détection automatique via reg.update() toutes les heures ou au retour au premier plan)${NC}"
echo ""