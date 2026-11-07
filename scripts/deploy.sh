#!/usr/bin/env bash
set -Eeuo pipefail
DEPLOY_DIR="${DEPLOY_DIR:-/opt/mern-production}"
IMAGE_TAG="${IMAGE_TAG:?IMAGE_TAG is required}"
ECR_REGISTRY="${ECR_REGISTRY:?ECR_REGISTRY is required}"
COMPOSE=(docker compose --project-directory "$DEPLOY_DIR" -f "$DEPLOY_DIR/docker-compose.yml")
STATE_FILE="$DEPLOY_DIR/.last-successful-image-tag"

if [[ ! -f "$DEPLOY_DIR/.env" ]]; then
  echo "Missing $DEPLOY_DIR/.env. Copy .env.example and configure secrets first."
  exit 1
fi

wait_for_health() {
  local services=(user-service product-service order-service client)
  local attempt status cid service
  for attempt in $(seq 1 40); do
    local all_healthy=true
    for service in "${services[@]}"; do
      cid=$("${COMPOSE[@]}" ps -q "$service")
      if [[ -z "$cid" ]]; then all_healthy=false; break; fi
      status=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$cid")
      if [[ "$status" != "healthy" ]]; then all_healthy=false; break; fi
    done
    if [[ "$all_healthy" == true ]]; then return 0; fi
    sleep 5
  done
  return 1
}

deploy_tag() {
  export IMAGE_TAG="$1"
  export ECR_REGISTRY
  if ! "${COMPOSE[@]}" config >/dev/null; then return 1; fi
  if ! "${COMPOSE[@]}" pull; then return 1; fi
  if ! "${COMPOSE[@]}" up -d --remove-orphans; then return 1; fi
  wait_for_health
}

PREVIOUS_TAG=""
if [[ -f "$STATE_FILE" ]]; then PREVIOUS_TAG="$(cat "$STATE_FILE")"; fi

echo "Deploying image tag: $IMAGE_TAG"
if deploy_tag "$IMAGE_TAG"; then
  printf '%s' "$IMAGE_TAG" > "$STATE_FILE"
  echo "Deployment successful: $IMAGE_TAG"
  "${COMPOSE[@]}" ps
else
  echo "Deployment failed health checks."
  if [[ -n "$PREVIOUS_TAG" ]]; then
    echo "Attempting rollback to previous successful tag: $PREVIOUS_TAG"
    if deploy_tag "$PREVIOUS_TAG"; then
      echo "Rollback successful: $PREVIOUS_TAG"
    else
      echo "Rollback failed. Inspect Docker Compose logs immediately."
    fi
  else
    echo "No previous successful tag is recorded; manual recovery is required."
  fi
  "${COMPOSE[@]}" logs --tail=100 || true
  exit 1
fi
