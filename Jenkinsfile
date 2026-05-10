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

    stage('Verify Tools') {
      steps {
        sh 'node --version || true'
        sh 'npm --version || true'
        sh 'python3 --version || python --version || true'
        sh 'docker version'
        sh 'docker compose version'
      }
    }

    stage('Build NestJS') {
      steps {
        dir('nestjs-api') {
          sh 'npm ci'
          sh 'npm run build'
        }
      }
    }

    stage('Build React') {
      steps {
        dir('react-app') {
          sh 'npm ci'
          sh 'npm run build'
        }
      }
    }

    stage('Validate FastAPI') {
      steps {
        dir('fastapi-service') {
          sh 'python3 -m py_compile main.py || python -m py_compile main.py'
        }
      }
    }

    stage('Docker Build') {
      steps {
        sh 'docker compose build'
      }
    }

    stage('Docker Push - skipped') {
      steps {
        echo 'Skipping Docker push for localhost POC. We will add Docker Hub credentials later if needed.'
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
        sh 'sleep 15'
        sh 'curl -f http://localhost:3000/coffees'
        sh '''
          curl -f -X POST http://localhost:3000/coffees \
            -H "Content-Type: application/json" \
            -d '{"type":"latte"}'
        '''
        sh 'curl -f http://localhost:3000/stats'
        sh 'curl -f http://localhost:8000/health'
      }
    }
  }

  post {
    always {
      sh 'docker compose ps || true'
    }
  }
}