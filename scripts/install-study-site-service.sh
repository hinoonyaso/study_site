#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NODE_BIN="$(command -v node)"
PORT="${PORT:-4173}"
HOST="${HOST:-0.0.0.0}"
BASE_PATH="${BASE_PATH:-/study_site/}"
SERVICE_DIR="${HOME}/.config/systemd/user"
SERVICE_FILE="${SERVICE_DIR}/physical-ai-study-site.service"

cd "${ROOT_DIR}"
npm run build

mkdir -p "${SERVICE_DIR}"
cat > "${SERVICE_FILE}" <<SERVICE
[Unit]
Description=Physical AI Study Site static server
After=network.target

[Service]
Type=simple
WorkingDirectory=${ROOT_DIR}
Environment=NODE_ENV=production
Environment=HOST=${HOST}
Environment=PORT=${PORT}
Environment=BASE_PATH=${BASE_PATH}
ExecStart=${NODE_BIN} ${ROOT_DIR}/scripts/serve-static.mjs --host ${HOST} --port ${PORT} --base ${BASE_PATH}
Restart=always
RestartSec=2

[Install]
WantedBy=default.target
SERVICE

systemctl --user daemon-reload
systemctl --user enable --now physical-ai-study-site.service

if command -v loginctl >/dev/null 2>&1; then
  loginctl enable-linger "${USER}" >/dev/null 2>&1 || true
fi

systemctl --user --no-pager status physical-ai-study-site.service
