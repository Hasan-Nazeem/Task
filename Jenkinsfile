pipeline {
    agent any

    // Configure a GitHub webhook as the primary trigger. Polling is a fallback.
    triggers {
        pollSCM('H/5 * * * *')
    }

    environment {
        AWS_REGION = 'ap-south-1'
        DEPLOY_DIR = '/opt/mern-production'
        FRONTEND_REPOSITORY = 'frontend'
        USER_REPOSITORY = 'user-service'
        PRODUCT_REPOSITORY = 'product-service'
        ORDER_REPOSITORY = 'order-service'
        IMAGE_TAG = "build-${BUILD_NUMBER}"
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Validate source and configuration') {
            steps { sh './scripts/validate.sh' }
        }

        stage('Build Docker images') {
            steps {
                sh '''
                    set -e
                    docker build -t ${FRONTEND_REPOSITORY}:${IMAGE_TAG} ./client
                    docker build -f services/user/Dockerfile -t ${USER_REPOSITORY}:${IMAGE_TAG} .
                    docker build -f services/product/Dockerfile -t ${PRODUCT_REPOSITORY}:${IMAGE_TAG} .
                    docker build -f services/order/Dockerfile -t ${ORDER_REPOSITORY}:${IMAGE_TAG} .
                '''
            }
        }

        stage('Authenticate with ECR') {
            steps {
                sh '''
                    set -e
                    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
                    ECR_REGISTRY=${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                    aws ecr get-login-password --region ${AWS_REGION} | \
                      docker login --username AWS --password-stdin ${ECR_REGISTRY}
                '''
            }
        }

        stage('Tag and push images') {
            steps {
                sh '''
                    set -e
                    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
                    ECR_REGISTRY=${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                    for REPOSITORY in ${FRONTEND_REPOSITORY} ${USER_REPOSITORY} ${PRODUCT_REPOSITORY} ${ORDER_REPOSITORY}; do
                      docker tag ${REPOSITORY}:${IMAGE_TAG} ${ECR_REGISTRY}/${REPOSITORY}:${IMAGE_TAG}
                      docker push ${ECR_REGISTRY}/${REPOSITORY}:${IMAGE_TAG}
                    done
                '''
            }
        }

        stage('Prepare deployment files') {
            steps {
                sh '''
                    set -e
                    mkdir -p ${DEPLOY_DIR}
                    cp docker-compose.yml ${DEPLOY_DIR}/docker-compose.yml
                    rm -rf ${DEPLOY_DIR}/nginx ${DEPLOY_DIR}/monitoring
                    cp -R nginx ${DEPLOY_DIR}/nginx
                    cp -R monitoring ${DEPLOY_DIR}/monitoring
                    cp scripts/deploy.sh ${DEPLOY_DIR}/deploy.sh
                    chmod +x ${DEPLOY_DIR}/deploy.sh
                    test -f ${DEPLOY_DIR}/.env
                '''
            }
        }

        stage('Deploy and verify') {
            steps {
                sh '''
                    set -e
                    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
                    export ECR_REGISTRY=${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                    export IMAGE_TAG=${IMAGE_TAG}
                    export DEPLOY_DIR=${DEPLOY_DIR}
                    ${DEPLOY_DIR}/deploy.sh
                    curl --fail --retry 10 --retry-delay 3 http://localhost/
                '''
            }
        }
    }

    post {
        success { echo "Build ${IMAGE_TAG} was built, pushed and deployed." }
        failure { echo 'Pipeline failed. Review stage logs and Docker Compose logs on EC2.' }
        always { sh 'docker image prune -f || true' }
    }
}
