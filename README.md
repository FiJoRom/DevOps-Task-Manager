# DevOps-Task-Manager

## Setup
Für die Replikation wird eine .env-File im Root benötigt, welche beispielhaft die folgenden drei Einträge umfassen sollte:
- DB_USER=admin
- DB_PASSWORD=admin
- DB_NAME=taskmanager

## CI/CD 
Das Projekt hat zwei CI/CD Pipelines, jeweils eine für das Backend und das Frontend der Anwendung. Beide Pipelines umfassen die folgenden Schritte:
- [x] Build
- [x] Linting
- [x] Unit-Test (inkl. Coverage)
- [ ] E2E-Test
- [x] SonarQube Analyse (übergebene Testergebnisse)
- [x] SonarQube Quality Gate
- [x] Versionierungssystem (major.minor.patch in version.txt; bot-commit; patch Standard, minor mit keyword "Release", major manuell)
- [x] Docker Build und Push mit Version + Latest-Tag

## Continous Deployment
Das Projekt hat außerdem eine Deployment-Pipeline, die manuell aufgerufen wird. Sie hat die folgenden Bestandteile:
- [x] Manuelle Versionseingabe für Frontend- + Backend-Versionen, default: latest
- [x] Pull Images von Dockerhub
- [x] Docker Run
- [x] Erreichbarkeitstest
