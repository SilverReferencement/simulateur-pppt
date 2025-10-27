# Système d'Automatisation Script.js

Ce système gère automatiquement le versionnage et la synchronisation de votre fichier `script.js`.

## 📁 Structure

```
Automatisation Création simulateur Prix PPPT/
├── script.js                  # Votre script principal
├── archive-and-update.js      # Script d'automatisation
├── update.bat                 # Lancer l'archivage et la sync
├── setup-github.bat           # Configuration initiale GitHub
└── OLD/                       # Dossier des versions archivées
    ├── script_1.js
    ├── script_2.js
    └── script_3.js
```

## 🚀 Installation

### 1. Configuration GitHub (première fois seulement)

Exécutez `setup-github.bat` pour configurer la connexion avec GitHub.

**Note:** Vous devrez peut-être configurer vos identifiants GitHub :
```bash
git config --global user.name "Votre Nom"
git config --global user.email "votre@email.com"
```

Pour l'authentification, utilisez un Personal Access Token :
1. Allez sur GitHub → Settings → Developer settings → Personal access tokens
2. Générez un nouveau token avec les permissions "repo"
3. Utilisez ce token comme mot de passe lors du push

## 📝 Utilisation

### Workflow standard :

1. **Modifiez** `script.js` avec vos changements
2. **Exécutez** `update.bat`
3. **C'est tout !** Le système va :
   - Archiver l'ancienne version dans `OLD/script_N.js`
   - Pousser la nouvelle version sur GitHub

### Ou manuellement avec Node.js :

```bash
node archive-and-update.js
```

## 🔧 Fonctionnalités

- ✅ Archivage automatique avec numérotation incrémentale
- ✅ Synchronisation GitHub automatique
- ✅ Détection intelligente du prochain numéro de version
- ✅ Création automatique du dossier OLD si nécessaire

## 📌 Notes

- Le script actuel (`script.js`) contient un simple "Hello World" pour les tests
- Les versions archivées sont conservées indéfiniment dans le dossier OLD
- Si GitHub n'est pas configuré, seul l'archivage local sera effectué

## 🔗 Repository GitHub

https://github.com/SilverReferencement/simulateur-pppt

## 🛠 Dépannage

**Erreur Git :** Si le push échoue, vérifiez :
- Vos identifiants GitHub
- Que vous avez les droits d'écriture sur le repo
- Votre connexion Internet

**Erreur Node.js :** Assurez-vous que Node.js est installé :
```bash
node --version
```
