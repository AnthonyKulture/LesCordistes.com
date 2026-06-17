#!/bin/bash
#
# 🔒 SECURITY AUDIT — détecte les secrets exposés dans le repo (tree + historique git)
#
# Usage:
#   bash scripts/security-audit.sh          # working tree / HEAD (rapide — vérif quotidienne / pre-commit)
#   bash scripts/security-audit.sh --deep   # TOUTE la base d'objets git — l'audit réel : couvre
#                                           # chaque branche, tout l'historique, et les objets non référencés
#
# Exit code: 0 si aucun problème CRITIQUE, 1 sinon (utilisable en pre-commit / CI).
#
# Principes:
#   - On flague des VALEURS de secrets, jamais des NOMS de variables
#     (`Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` est correct, pas une fuite).
#   - Les clés publiques par design sont ignorées (Stripe pk_, JWT role=anon, PostHog phc_, Mapbox pk.).
#   - Les JWT sont décodés : seul role=service_role est critique.

set -uo pipefail   # PAS de -e : grep renvoie 1 quand il ne trouve rien, c'est normal

RED='\033[0;31m'; YELLOW='\033[1;33m'; GREEN='\033[0;32m'; BLUE='\033[0;34m'; NC='\033[0m'
CRITICAL=0
WARN=0

cd "$(git rev-parse --show-toplevel 2>/dev/null)" || { echo "Pas dans un repo git."; exit 2; }

# Modes : head (défaut, rapide) · deep (base d'objets complète, l'audit réel)
MODE="head"
case "${1:-}" in
    ""|--head-only) MODE="head" ;;
    --deep)         MODE="deep" ;;
    *) echo "usage: $0 [--head-only|--deep]"; exit 2 ;;
esac

# Dossiers vendorés / générés exclus du scan HEAD : aucun secret applicatif ne s'y cache.
EXCLUDES=(
    ':(exclude)node_modules/**' ':(exclude).next/**' ':(exclude)dist/**'
    ':(exclude).agent/**' ':(exclude)_bmad/**' ':(exclude)_bmad-output/**'
    ':(exclude)graphify-out/**' ':(exclude).venv-tools/**'
    ':(exclude)package-lock.json' ':(exclude)*.tsbuildinfo' ':(exclude)*.env.example'
)

# Motifs de secrets (VALEURS, pas noms de variables).
HIGH_CONF='sk_(live|test)_[0-9A-Za-z]{16,}|rk_(live|test)_[0-9A-Za-z]{16,}|whsec_[0-9A-Za-z]{16,}|re_[0-9A-Za-z]{20,}|AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16}|GOCSPX-[0-9A-Za-z_-]{20,}|AIza[0-9A-Za-z_-]{35}|gh[pousr]_[0-9A-Za-z]{30,}|xox[baprs]-[0-9A-Za-z-]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY-----'
JWT_RE='eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]+'
DB_RE='(postgres(ql)?|mysql|mongodb(\+srv)?|redis|amqps?)://[^:@/[:space:]]+:[^@/[:space:]]+@'

if [ "$MODE" = "head" ]; then
    SCOPE="working tree / HEAD"
else
    SCOPE="base d'objets git complète (tous blobs ≤1 Mo, y compris non référencés)"
fi

# Une seule passe sur TOUS les blobs de la base (deep) :
#   - cat-file --batch-all-objects = aucun parcours d'arbre (rapide même sur 100k commits)
#   - on saute les blobs > 1 Mo (lock files, bundles) et les binaires : les secrets sont du texte court
#   - émet "oid<TAB>ligne" pour toute ligne matchant le motif unifié, classé ensuite
blob_scan() {  # $1 = ERE
    git cat-file --batch-all-objects --buffer --batch-check='%(objecttype) %(objectname) %(objectsize)' 2>/dev/null \
      | awk '$1=="blob" && $3+0 <= 1048576 {print $2}' \
      | git cat-file --batch --buffer 2>/dev/null \
      | perl -se '
            local $/ = "\n";
            while (my $h = <STDIN>) {
                chomp $h;
                my ($oid,$type,$size) = split / /, $h;
                last unless defined $size;
                my $buf=""; while (length($buf) < $size) { my $n=read(STDIN,my $c,$size-length($buf)); last if !$n; $buf.=$c; }
                read(STDIN, my $nl, 1);
                next unless $type eq "blob";
                next if index($buf, "\0") >= 0;            # binaire
                for my $line (split /\n/, $buf) {
                    next if length($line) > 4000;
                    print "$oid\t$line\n" if $line =~ /$pat/;
                }
            }
        ' -- -pat="$1"
}

# En deep : on précalcule UNE passe (motif unifié) + la map oid→chemin (git rev-list --objects, ~1s).
DEEP_HITS=""; PATH_MAP=""
if [ "$MODE" = "deep" ]; then
    DEEP_HITS="$(blob_scan "$HIGH_CONF|$JWT_RE|$DB_RE")"
    PATH_MAP="$(git rev-list --all --objects 2>/dev/null | awk 'NF==2')"
fi
resolve_oid() { local p; p="$(awk -v o="$1" '$1==o{$1="";sub(/^ /,"");print;exit}' <<<"$PATH_MAP")"; echo "${p:-(objet non référencé — git gc le purgera)}"; }

# scan_lines PATTERN → "loc : ligne"  (loc = path:ligne en head, chemin en deep)
scan_lines() {
    if [ "$MODE" = "deep" ]; then
        printf '%s\n' "$DEEP_HITS" | while IFS=$'\t' read -r oid line; do
            [ -z "${oid:-}" ] && continue
            printf '%s' "$line" | grep -qE "$1" && printf '%s : %s\n' "$(resolve_oid "$oid")" "$line"
        done
    else
        git grep -nIE "$1" HEAD -- "${EXCLUDES[@]}" 2>/dev/null | sed -E 's/^HEAD://'
    fi
}
# scan_tokens PATTERN → sous-chaînes uniques (JWT)
scan_tokens() {
    if [ "$MODE" = "deep" ]; then
        printf '%s\n' "$DEEP_HITS" | cut -f2- | grep -oE "$1" | sort -u
    else
        git grep -hIoE "$1" HEAD -- "${EXCLUDES[@]}" 2>/dev/null | sort -u
    fi
}
# locate_token TOKEN → où il apparaît
locate_token() {
    if [ "$MODE" = "deep" ]; then
        printf '%s\n' "$DEEP_HITS" | grep -F "$1" | cut -f1 | sort -u \
            | while read -r oid; do [ -n "$oid" ] && echo "      → $(resolve_oid "$oid")"; done | sort -u | head -10
    else
        git grep -lF "$1" HEAD -- "${EXCLUDES[@]}" 2>/dev/null | sed -E 's/^HEAD:(.*)/      → \1/' | sort -u | head -10
    fi
}

# Masque les secrets dans la sortie affichée.
redact() {
    sed -E \
        -e 's/(sk_(live|test)_|rk_(live|test)_|whsec_|re_|AKIA|ASIA|GOCSPX-|AIza|gh[pousr]_|xox[baprs]-)[A-Za-z0-9_/+-]{4,}/\1[REDACTED]/g' \
        -e 's/(eyJ[A-Za-z0-9_-]{6})[A-Za-z0-9_.-]+/\1…[JWT]/g' \
        -e 's#(://[^:@/ ]+:)[^@/ ]+@#\1[REDACTED]@#g'
}

# Décode le payload d'un JWT et renvoie son rôle (ex: "role":"service_role").
jwt_role() {
    local payload="${1#*.}"; payload="${payload%%.*}"
    payload="$(printf '%s' "$payload" | tr '_-' '/+')"
    while [ $(( ${#payload} % 4 )) -ne 0 ]; do payload="${payload}="; done
    printf '%s' "$payload" | base64 -d 2>/dev/null | grep -oE '"role" *: *"[a-z_]+"' | head -1
}

crit() { echo -e "${RED}❌ CRITIQUE: $1${NC}"; CRITICAL=$((CRITICAL+1)); }
warn() { echo -e "${YELLOW}⚠️  ATTENTION: $1${NC}"; WARN=$((WARN+1)); }
ok()   { echo -e "${GREEN}✓ $1${NC}"; }

echo "================================================"
echo "🔒 SECURITY AUDIT"
echo "   Périmètre: $SCOPE"
echo "================================================"
echo ""

# ── 1. Fichiers .env actuellement trackés (le signal le plus fort) ───────────────
echo -e "${BLUE}📋 [1/7] Fichiers .env trackés${NC}"
tracked_env="$(git ls-files | grep -E '(^|/)\.env' | grep -vE '\.env\.example$' || true)"
if [ -n "$tracked_env" ]; then
    crit "fichier(s) .env suivi(s) par git :"
    echo "$tracked_env" | sed 's/^/      /'
else
    ok "Aucun fichier .env tracké (hors .env.example)"
fi
echo ""

# ── 2. Autres fichiers de secrets trackés ────────────────────────────────────────
echo -e "${BLUE}📋 [2/7] Fichiers de secrets trackés (.pem, .key, credentials…)${NC}"
secret_files="$(git ls-files | grep -iE '\.(pem|key|pfx|p12|keystore|jks)$|(^|/)(credentials|secrets?|serviceaccount)\.(json|ya?ml)$|(^|/)\.npmrc$|id_rsa' || true)"
if [ -n "$secret_files" ]; then
    crit "fichier(s) potentiellement sensible(s) tracké(s) :"
    echo "$secret_files" | sed 's/^/      /'
else
    ok "Aucun fichier de secret tracké"
fi
echo ""

# ── 3. Couverture .gitignore ──────────────────────────────────────────────────────
echo -e "${BLUE}📋 [3/7] Configuration .gitignore${NC}"
if [ -f .gitignore ] && grep -qE '^\s*\.env(\.\*|\*)?\s*$' .gitignore; then
    ok ".gitignore couvre les fichiers .env*"
else
    warn ".gitignore devrait ignorer tous les .env* (ex: '.env' + '.env.*' + '!.env.example')"
fi
echo ""

# ── 4. Secrets haute-confiance (valeurs) ─────────────────────────────────────────
echo -e "${BLUE}📋 [4/7] Secrets haute-confiance dans $SCOPE${NC}"
hc_hits="$(scan_lines "$HIGH_CONF" | sort -u)"
if [ -n "$hc_hits" ]; then
    crit "secret(s) haute-confiance détecté(s) :"
    echo "$hc_hits" | redact | sed 's/^/      /' | head -40
    n=$(echo "$hc_hits" | wc -l | tr -d ' '); [ "$n" -gt 40 ] && echo "      … (+$((n-40)) autres)"
else
    ok "Aucun secret haute-confiance (Stripe sk_/whsec_, AWS, clés privées, OAuth…)"
fi
echo ""

# ── 5. JWT — décodage du rôle (service_role = critique, anon = OK) ────────────────
echo -e "${BLUE}📋 [5/7] JWT (Supabase…) — décodage du rôle${NC}"
jwt_list="$(scan_tokens "$JWT_RE")"
jwt_bad=0; jwt_anon=0
if [ -n "$jwt_list" ]; then
    while IFS= read -r tok; do
        [ -z "$tok" ] && continue
        role="$(jwt_role "$tok")"
        case "$role" in
            *service_role*)
                jwt_bad=$((jwt_bad+1))
                crit "JWT role=service_role exposé (bypass RLS). Présent dans :"
                locate_token "$tok"
                ;;
            *anon*|*authenticated*) jwt_anon=$((jwt_anon+1)) ;;
        esac
    done <<< "$jwt_list"
fi
[ "$jwt_bad" -eq 0 ] && ok "Aucun JWT service_role exposé (${jwt_anon} JWT anon/authenticated ignorés — publics par design)"
echo ""

# ── 6. Chaînes de connexion DB avec mot de passe ─────────────────────────────────
echo -e "${BLUE}📋 [6/7] Chaînes de connexion DB avec credentials${NC}"
db_hits="$(scan_lines "$DB_RE" \
    | grep -viE ':(password|pass|pwd|user|xxx+|changeme|your[_-]?\w*|<[^>]+>|\$\{|example)@' \
    | sort -u)"
if [ -n "$db_hits" ]; then
    warn "chaîne(s) de connexion avec credentials (vérifier si placeholder) :"
    echo "$db_hits" | redact | sed 's/^/      /' | head -20
else
    ok "Aucune chaîne de connexion avec mot de passe réel"
fi
echo ""

# ── 7. Hygiène GitHub (visibilité, secret scanning, push protection) ─────────────
echo -e "${BLUE}📋 [7/7] Hygiène GitHub${NC}"
if command -v gh >/dev/null 2>&1; then
    slug="$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)"
    if [ -n "$slug" ]; then
        vis="$(gh repo view --json visibility -q .visibility 2>/dev/null)"
        echo "      repo: $slug — visibilité: ${vis:-?}"
        ss="$(gh api "repos/$slug" -q '.security_and_analysis.secret_scanning.status' 2>/dev/null || echo "")"
        pp="$(gh api "repos/$slug" -q '.security_and_analysis.secret_scanning_push_protection.status' 2>/dev/null || echo "")"
        if [ "$vis" = "PUBLIC" ]; then
            [ "$ss" = "enabled" ] && ok "Secret Scanning activé" || warn "Secret Scanning désactivé (gratuit sur repo public → Settings ▸ Code security)"
            [ "$pp" = "enabled" ] && ok "Push Protection activé" || warn "Push Protection désactivée (bloque les futurs commits de secrets)"
        else
            ok "Repo non public"
        fi
    else
        echo "      (gh non authentifié — hygiène GitHub non vérifiée)"
    fi
else
    echo "      (gh CLI absent — hygiène GitHub non vérifiée)"
fi
echo ""

# ── Résumé ───────────────────────────────────────────────────────────────────────
echo "================================================"
echo "📊 RÉSUMÉ"
echo "================================================"
if [ "$CRITICAL" -eq 0 ] && [ "$WARN" -eq 0 ]; then
    echo -e "${GREEN}✅ Tous les contrôles passent.${NC}"
elif [ "$CRITICAL" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARN avertissement(s), 0 critique.${NC}"
else
    echo -e "${RED}❌ $CRITICAL problème(s) CRITIQUE(S), $WARN avertissement(s).${NC}"
    echo ""
    echo "ACTIONS:"
    echo "  1. RÉGÉNÉRER toute clé exposée (la supprimer du repo ne suffit pas une fois publique)."
    echo "  2. Retirer le fichier du suivi (git rm --cached) + .gitignore."
    echo "  3. Purger l'historique (git filter-repo / filter-branch) puis force-push."
    echo "  4. Activer Secret Scanning + Push Protection (Settings ▸ Code security)."
fi
echo ""
[ "$CRITICAL" -gt 0 ] && exit 1 || exit 0
