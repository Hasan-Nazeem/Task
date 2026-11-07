resource "aws_ecr_repository" "app" {
  for_each             = local.repositories
  name                 = each.value
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
  encryption_configuration {
    encryption_type = "AES256"
  }
  tags = local.common_tags
}

resource "aws_ecr_lifecycle_policy" "app" {
  for_each   = aws_ecr_repository.app
  repository = each.value.name
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep the latest 15 tagged build images"
      selection = {
        tagStatus     = "tagged"
        tagPrefixList = ["build-"]
        countType     = "imageCountMoreThan"
        countNumber   = 15
      }
      action = { type = "expire" }
    }]
  })
}
