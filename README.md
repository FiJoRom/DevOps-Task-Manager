# DevOps-Task-Manager

✅ CI/CD Übersicht
🔧 Continous Integration / Delivery (CI/CD)
 Build

 Linting

 Unit-Tests mit Coverage und Mocking

 E2E-Tests (mind. 3 sinnvolle Testfälle)

 SonarQube-Analyse inkl. Ergebnisse aus Build, Linting, Tests

 Docker Build & Push mit Versionierung

🚀 Continous Deployment
 Release auf beliebigem Host (Docker-basiert)

 Helm-Chart Deployment auf Kubernetes (optional)

 Image-Tag optional (Standard: latest)

🧾 Versionierung
Die Versionierung folgt dem Schema MAJOR.MINOR.PATCH.

PATCH: Automatisch bei jedem Commit erhöht (z. B. 0.1.3)

MINOR: Wird bei Commits mit "release" im Nachrichtentext automatisch erhöht (Patch auf 0 zurückgesetzt)

MAJOR: Nur manuell anzupassen, bei grundlegenden Änderungen oder Breaking Changes

Die aktuelle Version wird in einer version.txt gepflegt und bei jedem Build mit ins Docker-Image geschrieben.