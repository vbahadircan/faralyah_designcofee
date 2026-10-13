#!/usr/bin/env bash
# Manual deploy: run on the VPS from anywhere:  /opt/faralyah/deploy/deploy.sh
# Pulls main (fast-forward only), rebuilds, restarts, and waits for the app to answer.
set -euo pipefail

cd "$(dirname "$0")"
REPO_ROOT="$(git rev-parse --show-toplevel)"
BRANCH=main

# Two deploys at once would fight over the same containers.
exec 9>/tmp/faralyah-deploy.lock
flock -n 9 || { echo "Another deploy is running." >&2; exit 1; }

[ -f .env ] || { echo "deploy/.env is missing (see deploy/.env.example)." >&2; exit 1; }

PREVIOUS="$(git -C "$REPO_ROOT" rev-parse --short HEAD)"
git -C "$REPO_ROOT" fetch origin "$BRANCH"
git -C "$REPO_ROOT" merge --ff-only "origin/$BRANCH"
CURRENT="$(git -C "$REPO_ROOT" rev-parse --short HEAD)"
echo "Deploying $PREVIOUS -> $CURRENT"

docker compose config --quiet
docker compose build --pull app
docker compose up -d --remove-orphans

echo "Waiting for the app..."
for _ in $(seq 1 30); do
  if docker compose exec -T app node -e "fetch('http://localhost:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"; then
    echo "OK: app is up at $CURRENT."
    docker image prune -f >/dev/null
    exit 0
  fi
  sleep 2
done

echo "FAILED: app did not answer. Logs: docker compose logs --tail 50 app" >&2
echo "Roll back: git -C $REPO_ROOT reset --hard $PREVIOUS && $0" >&2
exit 1
