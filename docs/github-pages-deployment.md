# GitHub Pages Deployment Guide

Diese Anleitung erklärt, wie du deine Angular-Anwendung auf GitHub Pages deployen und Änderungen vom main Branch auf GitHub Pages übertragen kannst.

## Erstmalige Einrichtung

### 1. Privates GitHub-Repository erstellen

1. Melde dich bei [GitHub](https://github.com) an oder erstelle ein Konto, falls du noch keines hast
2. Klicke auf das "+" Symbol in der oberen rechten Ecke und wähle "New repository"
3. Gib einen Namen für dein Repository ein (z.B. "quiz-web")
4. Wähle "Private" aus
5. Klicke auf "Create repository"

### 2. Lokales Repository mit GitHub verbinden

```bash
# Repository-URL von GitHub hinzufügen (ersetze USERNAME und REPO-NAME)
git remote add origin https://github.com/USERNAME/REPO-NAME.git

# Branch umbenennen (falls nötig) und Code hochladen
git branch -M main
git push -u origin main
```

### 3. Angular CLI GH Pages installieren

Installiere das angular-cli-ghpages Paket, das den Deployment-Prozess vereinfacht:

```bash
npm install -g angular-cli-ghpages
```

## Änderungen von main auf GitHub Pages übertragen

Folge diesen Schritten, um Änderungen von deinem main Branch auf GitHub Pages zu übertragen:

### 1. Änderungen am Code vornehmen

```bash
# Stelle sicher, dass du im main Branch bist
git checkout main

# Mache deine Änderungen am Code
```

### 2. Änderungen committen und auf GitHub pushen

```bash
# Füge alle geänderten Dateien hinzu
git add .

# Erstelle einen Commit mit einer aussagekräftigen Nachricht
git commit -m "Beschreibung deiner Änderungen"

# Pushe die Änderungen auf GitHub
git push origin main
```

### 3. Anwendung für Produktion bauen

```bash
# Baue die Anwendung für Produktion
ng build --configuration production --base-href="https://USERNAME.github.io/REPO-NAME/"
```

Ersetze `USERNAME` und `REPO-NAME` mit deinem GitHub-Benutzernamen und dem Namen deines Repositories.

### 4. Auf GitHub Pages deployen

```bash
# Deploye die Anwendung auf GitHub Pages
npx angular-cli-ghpages --dir=dist/quiz-web/browser
```

Dieses Kommando führt folgende Aktionen aus:
- Erstellt eine 404.html-Datei (für Client-seitiges Routing)
- Erstellt eine .nojekyll-Datei (verhindert Jekyll-Verarbeitung)
- Klont das GitHub-Repository
- Wechselt zum gh-pages Branch
- Entfernt alle vorhandenen Dateien
- Kopiert die Dateien aus dem dist/quiz-web/browser-Verzeichnis
- Committet die Änderungen
- Pusht den gh-pages Branch auf GitHub

### 5. Überprüfen der Änderungen

Nach dem Deployment kann es einige Minuten dauern, bis die Änderungen auf GitHub Pages sichtbar sind. Du kannst den Status überprüfen, indem du:

1. Zu deinem Repository auf GitHub gehst: https://github.com/USERNAME/REPO-NAME
2. Auf den "Actions"-Tab klickst
3. Den letzten "pages build and deployment"-Workflow überprüfst

Sobald der Workflow abgeschlossen ist, sollten deine Änderungen unter https://USERNAME.github.io/REPO-NAME/ sichtbar sein.

## Automatisierung des Prozesses (optional)

Du kannst den Build- und Deployment-Prozess in einem npm-Script automatisieren, indem du folgendes in deine package.json einfügst:

```json
"scripts": {
  // andere Scripts...
  "deploy": "ng build --configuration production --base-href=\"https://USERNAME.github.io/REPO-NAME/\" && npx angular-cli-ghpages --dir=dist/quiz-web/browser"
}
```

Dann kannst du einfach `npm run deploy` ausführen, um deine Anwendung zu bauen und zu deployen.

## Fehlerbehebung

### Problem: 404-Fehler nach dem Deployment

Wenn deine Seite einen 404-Fehler zurückgibt, überprüfe Folgendes:

1. Stelle sicher, dass die GitHub Pages-Einstellungen korrekt sind:
   - Gehe zu deinem Repository > Settings > Pages
   - Source sollte auf "Deploy from a branch" gesetzt sein
   - Branch sollte "gh-pages" sein

2. Überprüfe, ob die Dateien im gh-pages Branch korrekt sind:
   ```bash
   git checkout gh-pages
   ls -la
   ```
   Es sollte eine index.html-Datei im Root-Verzeichnis geben.

3. Wenn die Dateien in einem Unterordner sind, ändere die GitHub Pages-Einstellungen oder verwende die Option `--dir=dist/quiz-web/browser` beim Deployment.

### Problem: Fehler beim Deployment

Wenn du Fehler beim Deployment erhältst, versuche Folgendes:

1. Lösche den Cache-Ordner:
   ```bash
   rm -rf node_modules/.cache/gh-pages
   ```

2. Stelle sicher, dass du die richtigen Berechtigungen für das Repository hast.

3. Überprüfe, ob der gh-pages Branch bereits existiert und ob du Schreibrechte dafür hast.