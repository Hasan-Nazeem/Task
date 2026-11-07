# Assignment evidence to capture after AWS deployment

Do not add fabricated screenshots. Capture these from your own AWS/Jenkins/EC2 environment:

1. Terraform `plan` and successful `apply` output.
2. EC2 instance details and security group ingress restrictions.
3. ECR showing `frontend`, `user-service`, `product-service`, `order-service` with build tags.
4. Jenkins successful pipeline stage view.
5. `docker compose ps` showing frontend and all three backend services healthy.
6. Nginx/API route verification from browser or `curl`.
7. Grafana MERN Production Overview dashboard.
8. Prometheus Targets page showing Node Exporter and all three app services UP.
9. Simulated product-service stop, logs/error observation, and recovery.
10. Rollback demonstration or documented rollback command.
