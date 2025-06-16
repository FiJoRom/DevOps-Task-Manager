# DevOps-Task-Manager

## CI/CD 
Das Projekt hat zwei CI/CD Pipelines, jeweils eine für das Backend und das Frontend der Anwendung. Beide Pipelines umfassen die folgenden Schritte:
- [ ] Build
- [ ] Linting
- [ ] Unit-Test (inkl. Coverage)
- [ ] E2E-Test
- [ ] SonarQube Analyse (übergebene Testergebnisse)
- [ ] SonarQube Quality Gate
- [ ] Versionierungssystem (major.minor.patch in version.txt; bot-commit; patch Standard, minor mit keyword "Release", major manuell)
- [ ] Docker Build und Push mit Version + Latest-Tag

## Continous Deployment
Das Projekt hat außerdem eine Deployment-Pipeline, die manuell aufgerufen wird. Sie hat die folgenden Bestandteile:
- [ ] Manuelle Versionseingabe für Frontend- + Backend-Versionen, default: latest
- [ ] Pull Images von Dockerhub
- [ ] Docker Run
- [ ] Erreichbarkeitstest
