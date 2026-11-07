#!/usr/bin/env bash
set -euo pipefail
echo "Checking JavaScript syntax..."
find server -type f -name '*.js' -print0 | xargs -0 -n1 node --check
echo "Checking required files..."
for service in user product order; do test -f "services/${service}/Dockerfile"; done
test -f docker-compose.yml
test -f nginx/nginx.conf
test -f monitoring/prometheus/prometheus.yml
test -f monitoring/grafana/dashboards/mern-production.json
python3 -m json.tool monitoring/grafana/dashboards/mern-production.json >/dev/null
echo "Static validation passed. The supplied project has no automated application test suite."
