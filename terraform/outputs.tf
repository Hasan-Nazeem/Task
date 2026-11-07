output "instance_id" {
  value = aws_instance.app.id
}

output "instance_name" {
  value = aws_instance.app.tags["Name"]
}

output "public_ip" {
  value = aws_instance.app.public_ip
}

output "application_url" {
  value = "http://${aws_instance.app.public_ip}"
}

output "ecr_registry" {
  value = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com"
}

output "ecr_repository_urls" {
  value = {
    for name, repo in aws_ecr_repository.app :
    name => repo.repository_url
  }
}

output "jenkins_ecr_push_policy_arn" {
  value = aws_iam_policy.jenkins_ecr_push.arn
}

output "ec2_role_name" {
  value = aws_iam_role.ec2.name
}