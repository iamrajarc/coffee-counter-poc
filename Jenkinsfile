pipeline {
  agent any

  options {
    timestamps()
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Verify Docker Tools') {
      steps {
        sh 'git --version'
        sh 'docker version'
        sh 'docker compose version'
      }
    }

    stage('Docker Build') {
      steps {
        sh 'docker compose build'
      }
    }

    stage('Docker Push - skipped') {
      steps {
        echo 'Skipping Docker push for localhost POC. Docker registry credentials will be added later.'
      }
    }

    stage('Deploy with Docker Compose') {
      steps {
        sh 'docker compose down --remove-orphans'
        sh 'docker compose up -d'
      }
    }

    stage('Smoke Test') {
      steps {
        sh 'sleep 20'

        sh 'curl -f http://host.docker.internal:3000/coffees'

        sh '''
          curl -f -X POST http://host.docker.internal:3000/coffees \
            -H "Content-Type: application/json" \
            -d '{"type":"latte"}'
        '''

        sh 'curl -f http://host.docker.internal:3000/stats'
        sh 'curl -f http://host.docker.internal:8000/health'
      }
    }
  }

  post {
    always {
      sh 'docker compose ps || true'
    }
  }
}