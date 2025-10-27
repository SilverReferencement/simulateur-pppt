# Système d'Automatisation Simulateur PPPT

Ce système gère automatiquement le versionnage et la synchronisation de vos fichiers du simulateur PPPT.

## 📁 Structure

```
Automatisation Création simulateur Prix PPPT/
├── script.js                  # Logique du simulateur
├── index.html                 # Interface du simulateur
├── styles.css                 # Design moderne 2025
├── archive-and-update.js      # Script d'automatisation intelligent
├── update.bat                 # Lancer l'archivage et la sync
├── setup-github.bat           # Configuration initiale GitHub
└── OLD/                       # Dossier des versions archivées
    ├── script_1.js, script_2.js, script_3.js, script_4.js
    ├── index_1.html, index_2.html
    └── styles_1.css, styles_2.css
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

1. **Modifiez** vos fichiers (`script.js`, `index.html`, ou `styles.css`)
2. **Exécutez** `update.bat`
3. **C'est tout !** Le système va :
   - ✅ Détecter automatiquement les fichiers modifiés avec Git
   - ✅ Archiver uniquement les fichiers qui ont changé
   - ✅ Créer des versions séparées par fichier (script_4.js, index_2.html, styles_3.css)
   - ✅ Pousser automatiquement sur GitHub

### Ou manuellement avec Node.js :

```bash
node archive-and-update.js
```

### 🎯 Archivage intelligent

Le système archive **uniquement les fichiers modifiés** :
- Si vous modifiez seulement `script.js` → seul `script_N.js` est archivé
- Si vous modifiez `index.html` et `styles.css` → `index_N.html` et `styles_N.css` sont archivés
- Si aucun fichier n'est modifié → aucun archivage (message de confirmation)

Chaque fichier a sa propre numérotation indépendante !

## 🔧 Fonctionnalités

### Système d'archivage
- ✅ Détection automatique des fichiers modifiés via Git
- ✅ Archivage intelligent (uniquement les fichiers changés)
- ✅ Numérotation indépendante par fichier
- ✅ Création automatique du dossier OLD si nécessaire

### Simulateur PPPT
- ✅ Design moderne 2025 avec dégradés et animations
- ✅ Slider interactif pour sélectionner 1-300 lots
- ✅ Toggle DPE (Diagnostic de Performance Énergétique)
- ✅ Intégration Google Sheets pour tarifs dynamiques
- ✅ Calcul automatique avec interpolation linéaire (40-250 lots)
- ✅ Prix plafonnés : 4990€ sans DPE, 7490€ avec DPE (250+ lots)
- ✅ Téléchargement de devis
- ✅ Responsive design

### Synchronisation
- ✅ Push automatique sur GitHub après modification
- ✅ Messages de commit détaillés
- ✅ Gestion des erreurs et messages informatifs

## 📌 Notes

- Les versions archivées sont conservées indéfiniment dans le dossier OLD
- Chaque fichier (script.js, index.html, styles.css) a sa propre série de versions
- Si GitHub n'est pas configuré, seul l'archivage local sera effectué
- Le simulateur charge les tarifs depuis Google Sheets en temps réel

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
