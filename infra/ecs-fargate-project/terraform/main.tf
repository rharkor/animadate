terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.41"
    }
  }

  #? Variables are not available in the backend block
  backend "s3" {
    bucket = "animadate-terra-config"
    key    = "terraform.tfstate"
    region = "eu-west-1"
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile
}

module "global" {
  source = "./modules/global"

  project_name = var.project_name
  az_count     = var.az_count
  region       = var.aws_region
}

module "project" {
  source = "./modules/project"

  count = length(var.task_definitions)

  private_subnets  = module.global.private_subnets
  public_subnets   = module.global.public_subnets
  lb_sg_id         = module.global.lb_sg_id
  ecs_sg_id        = module.global.ecs_sg_id
  vpc_id           = module.global.vpc_id
  ecs_cluster_id   = module.global.ecs_cluster_id
  ecs_cluster_name = module.global.ecs_cluster_name
  region           = var.aws_region

  identifier         = "${var.task_definitions[count.index].task_name}-${var.project_name}"
  cpu                = var.task_definitions[count.index].cpu
  memory             = var.task_definitions[count.index].memory
  desired_count      = var.task_definitions[count.index].desired_count
  min_capacity       = var.task_definitions[count.index].min_capacity
  max_capacity       = var.task_definitions[count.index].max_capacity
  scale_in_cooldown  = var.task_definitions[count.index].scale_in_cooldown
  scale_out_cooldown = var.task_definitions[count.index].scale_out_cooldown
}
