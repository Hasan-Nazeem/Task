# MERN E-commerce – Vamshi DevOps Assignment

This repository keeps the supplied MERN e-commerce application and prepares its backend for three independently running services. The work is focused on DevOps: Docker, Docker Compose, Nginx routing, Jenkins, ECR, Terraform, Prometheus, Grafana, deployment verification and rollback.

## 1. Service layout

| Service | Existing routes assigned | Container |
|---|---|---|
| User Service | `/api/auth`, `/api/user`, `/api/address`, `/api/newsletter`, `/api/contact`, `/api/merchant` | `user-service` |
| Product Service | `/api/product`, `/api/category`, `/api/brand`, `/api/review`, `/api/wishlist` | `product-service` |
| Order Service | `/api/cart`, `/api/order` | `order-service` |
| Frontend | Existing React application | `client` |

The existing frontend continues to call `/api`. Nginx sends each API route group to its matching service. Socket.IO support chat is routed to User Service.

**Architecture note:** this is a practical assignment-level service decomposition of the supplied code. The services run as separate processes and containers, but currently share the same MongoDB database and existing Mongoose models because the supplied application was originally a single backend. This avoids a risky rewrite of the e-commerce features. A full production microservices redesign would later give each service data ownership and use APIs/events for cross-service operations.

## 2. Important code changes

- Added `server/service-entry.js`, which starts only the route group assigned to `SERVICE_NAME`.
- Added three service Dockerfiles under `services/user`, `services/product`, and `services/order`.
- Kept the original `server/index.js` as a compatibility entry point.
- Updated `server/utils/db.js` to await MongoDB connection and fail startup if the database is unavailable.
- Added `/health` and `/metrics` endpoints to each service.
- Reworked `docker-compose.yml` to run three backend services, frontend, Nginx, MongoDB and monitoring.
- Added persistent MongoDB, Prometheus and Grafana volumes.
- Added health checks, restart policies and service dependencies.
- Added Terraform for EC2, security group, EC2 IAM role/profile, ECR repositories and Jenkins ECR push policy.
- Added Jenkins pipeline to validate, build, tag, push, deploy and verify all images.
- Added deployment health verification and automatic rollback to the last successful image tag.

No real secrets are included. Create the deployment `.env` file yourself.

## 3. Prerequisites

- AWS account and AWS CLI configured for the Terraform operator.
- Terraform 1.5+.
- Existing EC2 key pair if SSH access is required.
- Jenkins agent on the deployment EC2 (or adapt the deployment stage to SSH to a separate host).
- Jenkins agent has Docker Engine/Compose, AWS CLI, Git, Node.js and permission to run Docker.
- Jenkins execution identity has ECR push permissions.
- GitHub repository webhook configured to notify Jenkins.

## 4. Terraform – provision AWS infrastructure

Terraform uses the account's **default VPC** and first available subnet. Confirm that your AWS account has a default VPC before applying.

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`:
- Set `ssh_cidr` to your public IP with `/32`.
- Set `admin_cidr` to your trusted public IP with `/32`.
- Set `key_name` to your existing EC2 key pair.
- Review the EC2 instance type and disk size.

Run:

```bash
terraform init
terraform fmt -recursive
terraform validate
terraform plan -out=tfplan
terraform apply tfplan
terraform output
```

Terraform creates:
- One Ubuntu 24.04 EC2 instance.
- A security group (HTTP public; SSH/Grafana/Prometheus restricted to supplied CIDRs).
- An EC2 IAM role and instance profile with ECR pull permissions.
- Three ECR repositories for the microservices: `user-service`, `product-service`, and `order-service`. The existing `frontend` ECR repository from the original project is reused; Terraform grants Jenkins push access to it but does not recreate it.
- A Jenkins ECR push policy. Attach this policy to the IAM role/user used by Jenkins.

The EC2 user-data installs Docker Engine and the Docker Compose plugin. After first boot, reconnect by SSH so the `ubuntu` user's Docker group membership is active.

### Terraform state

The starter configuration uses local Terraform state. Keep `terraform.tfstate`, `terraform.tfstate.backup`, `.terraform/` and `tfplan` private and out of Git. For team use, move state to an encrypted, versioned S3 bucket with a DynamoDB lock table (create the backend resources first, then configure the S3 backend).

### Cleanup

```bash
terraform destroy
```

This deletes the EC2/ECR infrastructure. ECR repositories may contain images; ensure you understand the effect before destroying. Back up any required application data first.

## 5. Configure the EC2 deployment directory

On the EC2 instance:

```bash
sudo mkdir -p /opt/mern-production
sudo chown -R jenkins:jenkins /opt/mern-production
```

If Jenkins runs under another Linux account, replace `jenkins` with that account.

Copy `.env.example` to `/opt/mern-production/.env` and configure it:

```bash
cp .env.example /opt/mern-production/.env
nano /opt/mern-production/.env
```

At minimum set:
- A long random `JWT_SECRET`.
- `GRAFANA_ADMIN_PASSWORD`.
- Correct MongoDB URI. The Compose default is the local persistent MongoDB container.
- Set `CLIENT_URL` to your actual public IP/domain (not `localhost`) if password-reset or social-login redirects are used. Update Google/Facebook callback URLs to match your registered provider settings.
- Third-party mail/social/AWS settings only if those features are needed.

Do not commit `.env`. Do not put AWS access keys in the file. Prefer the EC2 instance role for AWS access.

Generate a secure JWT secret on the host:

```bash
openssl rand -hex 32
```

## 6. Build and run

The Jenkins pipeline builds and publishes versioned images. To build manually:

```bash
export AWS_REGION=ap-south-1
export ECR_REGISTRY=<ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com
export IMAGE_TAG=build-manual

docker build -t frontend:${IMAGE_TAG} ./client
docker build -f services/user/Dockerfile -t user-service:${IMAGE_TAG} .
docker build -f services/product/Dockerfile -t product-service:${IMAGE_TAG} .
docker build -f services/order/Dockerfile -t order-service:${IMAGE_TAG} .
```

Tag and push the three backend images to their Terraform-created ECR repositories. Push the frontend image to the existing `frontend` ECR repository. If that repository does not exist in your account, create it once with `aws ecr create-repository --repository-name frontend --region ap-south-1`.

## 7. Jenkins configuration

Create a Pipeline job pointing to this GitHub repository and use `Jenkinsfile`.

Jenkins agent requirements:
- Docker Engine and Docker Compose plugin.
- AWS CLI.
- Node.js (for static syntax validation).
- Git.
- Docker socket access for the Jenkins user.
- AWS identity with `ecr:GetAuthorizationToken` and ECR push actions on the four repositories.
- Write access to `/opt/mern-production`.

If Jenkins runs on the same EC2 created by Terraform, attach the Terraform output `jenkins_ecr_push_policy_arn` to the EC2 role. If Jenkins runs elsewhere, attach it to the Jenkins agent's IAM role/user instead. Avoid long-lived AWS access keys where possible.

### GitHub webhook

In GitHub repository → Settings → Webhooks → Add webhook:
- Payload URL: `http://<JENKINS_PUBLIC_DNS_OR_IP>:8081/github-webhook/` (use the actual Jenkins port and DNS).
- Content type: `application/json`.
- Events: Just the push event (add pull-request event if your job uses PR builds).
- Save webhook.

In Jenkins, enable the GitHub hook trigger for GITScm polling if available. The Jenkinsfile also includes a five-minute SCM polling fallback. The Terraform security group does not expose Jenkins port 8081; if using a webhook, publish Jenkins securely through HTTPS/reverse proxy and allow GitHub webhook traffic according to your network policy. Polling works without inbound Jenkins webhook access.

Pipeline stages:
1. Checkout.
2. JavaScript/config validation.
3. Build frontend and three service images.
4. Authenticate to ECR.
5. Push versioned images.
6. Copy deployment configuration to EC2 deployment directory.
7. Pull, deploy, health-check and verify.

The supplied source has no real automated test suite. The pipeline therefore performs JavaScript syntax and configuration checks; it does not invent application tests or change application features.

## 8. Deploy and verify

The Jenkins pipeline uses tags like `build-17`. It does not run `docker compose down` before deployment.

On the EC2 host, verify:

```bash
cd /opt/mern-production
docker compose ps
docker compose logs --tail=100 user-service
docker compose logs --tail=100 product-service
docker compose logs --tail=100 order-service
docker compose logs --tail=100 nginx
curl -i http://localhost/
curl -i http://localhost/api/product/list
```

If this is a fresh database and you want the sample admin/products, run the seed script once (not on every container restart):

```bash
docker compose exec -T user-service npm run seed:db -- admin@example.com admin123
```

**Warning:** the supplied seed script deletes existing Product, Brand and Category documents before recreating demo records. Run it only against a fresh/test database after taking a backup. Change the sample admin password immediately if you use seeded credentials.

The product endpoint may require query parameters or database seed data; an HTTP 400 from an incomplete query is not necessarily a service outage. Confirm each service's internal readiness:

```bash
docker compose exec -T user-service node -e "require('http').get('http://localhost:3000/health',r=>{r.pipe(process.stdout);process.exitCode=r.statusCode===200?0:1})"
docker compose exec -T product-service node -e "require('http').get('http://localhost:3000/health',r=>{r.pipe(process.stdout);process.exitCode=r.statusCode===200?0:1})"
docker compose exec -T order-service node -e "require('http').get('http://localhost:3000/health',r=>{r.pipe(process.stdout);process.exitCode=r.statusCode===200?0:1})"
```

The health endpoint returns 200 only when that service can connect to MongoDB.

## 9. Rollback

The deployment script records the last successful image tag in `/opt/mern-production/.last-successful-image-tag`. If the new release fails health checks, it attempts to redeploy the previous successful tag.

Manual rollback:

```bash
export ECR_REGISTRY=<ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com
export DEPLOY_DIR=/opt/mern-production
./scripts/rollback.sh build-16
```

Replace `build-16` with a tag that exists in the frontend repository and all three service repositories.

## 10. Monitoring and logs

Compose starts Node Exporter, Prometheus and Grafana. Prometheus scrapes host metrics and the `/metrics` endpoints from all three backend services.

URLs:
- Grafana: `http://<EC2_PUBLIC_IP>:3001` (admin credentials from `.env`).
- Prometheus: `http://<EC2_PUBLIC_IP>:9090`.
- Application: `http://<EC2_PUBLIC_IP>/`.

Grafana dashboard: **MERN Production Overview**.

Useful commands:

```bash
docker compose logs -f
docker compose logs --tail=100 user-service
docker compose logs --tail=100 product-service
docker compose logs --tail=100 order-service
docker stats
df -h
free -h
top
```

## 11. Failure simulation and troubleshooting evidence

Perform only in a test window.

```bash
docker compose ps
docker compose stop product-service
docker compose logs --tail=100 product-service
curl -i http://localhost/api/product/list
docker compose start product-service
docker compose ps
```

Capture screenshots for:
- Three backend services and frontend running/healthy in `docker compose ps`.
- ECR repositories with versioned image tags.
- Successful Jenkins pipeline stages.
- Terraform plan/apply output.
- Grafana dashboard showing host and application metrics.
- Failure simulation and recovery logs.

Do not present screenshots until you have run the deployment in your AWS account. The `evidence/` folder lists the evidence still to collect.

## 12. Security reminders

- Never commit `.env`, credentials, private keys or Terraform state.
- Restrict SSH, Grafana and Prometheus ingress to trusted IPs.
- Use EC2/Jenkins IAM roles rather than embedded AWS keys.
- Rotate JWT and Grafana secrets before deployment.
- For production use, put Grafana/Prometheus behind VPN or an authenticated reverse proxy; security-group restrictions are only the first layer.
- Shared MongoDB is an assignment simplification. Plan service-owned data boundaries before treating this as a mature microservices platform.
