pipeline {
  agent any
  stages {
    stage('Checkout') {
      steps { git branch: 'main', url: 'https://github.com/HaseebAhmad24-collab/deployment-log-tracker.git' }
    }
    stage('Install & Build') {
      steps {
        sh 'cd backend && npm install'
        sh 'cd frontend && npm install && npm run build'
      }
    }
    stage('Deploy to EC2') {
      steps {
        sshagent(['app-server-ssh-key']) {
          sh '''
            ssh -o StrictHostKeyChecking=no ubuntu@100.24.255.88 "
              cd deployment-log-tracker &&
              git pull origin main &&
              cd backend && npm install &&
              cd ../frontend && npm install && npm run build &&
              pm2 restart deployment-log-backend
            "
          '''
        }
      }
    }
    stage('Verify') {
      steps {
        sh 'curl -f http://haseebxdev.online/api/logs || exit 1'
      }
    }
  }
}