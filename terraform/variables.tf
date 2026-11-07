variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Project and EC2 name"
  type        = string
  default     = "Task"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "c7i-flex.large"
}

variable "key_name" {
  description = "Existing AWS key pair"
  type        = string
  default     = "Hasan-key"
}

variable "ssh_cidr" {
  description = "SSH access CIDR"
  type        = string
  default     = "0.0.0.0/0"
}

variable "admin_cidr" {
  description = "Admin IP for Grafana and Prometheus"
  type        = string
}

variable "root_volume_gb" {
  description = "EC2 root volume size in GB"
  type        = number
  default     = 30
}