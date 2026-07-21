#!/usr/bin/env bash
set -euo pipefail
[[ "${CONFIRM_DEMO_SEED:-}" == yes ]] || { echo 'Refusing destructive demo seed; set CONFIRM_DEMO_SEED=yes.' >&2; exit 2; }
: "${DATABASE_URL:?Export DATABASE_URL}"; root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"; psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$root/backend/db/seed.sql"
