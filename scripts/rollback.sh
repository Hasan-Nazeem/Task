#!/usr/bin/env bash
set -euo pipefail
DEPLOY_DIR="${DEPLOY_DIR:-/opt/mern-production}"
ROLLBACK_TAG="${1:?Usage: ./scripts/rollback.sh build-TAG}"
ECR_REGISTRY="${ECR_REGISTRY:?ECR_REGISTRY is required}"
export IMAGE_TAG="$ROLLBACK_TAG"
export ECR_REGISTRY
docker compose --project-directory "$DEPLOY_DIR" -f "$DEPLOY_DIR/docker-compose.yml" pull
docker compose --project-directory "$DEPLOY_DIR" -f "$DEPLOY_DIR/docker-compose.yml" up -d --remove-orphans
printf '%s' "$ROLLBACK_TAG" > "$DEPLOY_DIR/.last-successful-image-tag"
docker compose --project-directory "$DEPLOY_DIR" -f "$DEPLOY_DIR/docker-compose.yml" ps
