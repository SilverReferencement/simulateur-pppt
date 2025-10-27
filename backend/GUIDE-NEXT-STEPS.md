# 🚀 Prochaines Étapes - Configuration Backend PPPT

## ✅ Ce qui est déjà fait

- ✅ Google Sheets "Devis" créé et configuré
  - ID: `1GiPN9N2rb4vRqdGamQLPNoC0i7wRQaXAon5D9slf4og`
  - URL: https://docs.google.com/spreadsheets/d/1GiPN9N2rb4vRqdGamQLPNoC0i7wRQaXAon5D9slf4og/edit

- ✅ Dossier Google Drive "PPPT - Fichiers DPE" créé
  - ID: `1M4Ho1dU9qxPyDBEqXGplv8LTHHG-qIJI`
  - URL: https://drive.google.com/drive/folders/1M4Ho1dU9qxPyDBEqXGplv8LTHHG-qIJI

- ✅ Code backend prêt et pushé sur GitHub

---

## 📋 Ce qu'il vous reste à faire

### Étape 1: Télécharger le fichier credentials.json ⏱️ 5 minutes

**Vous êtes à la ligne 128 du README, voici ce qui suit :**

#### A. Créer le Service Account (si pas encore fait)

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Sélectionnez votre projet (ou créez-en un nouveau : `pppt-simulator`)
3. Menu de gauche → **APIs & Services** → **Identifiants**
4. Cliquez sur **"Créer des identifiants"** → **"Compte de service"**
5. Remplissez :
   - Nom : `pppt-backend`
   - ID : `pppt-backend`
   - Description : `Service account pour le backend PPPT`
6. Cliquez sur **"Créer et continuer"**
7. Rôle : Sélectionnez **"Éditeur"**
8. Cliquez sur **"Continuer"** puis **"OK"**

#### B. Télécharger la clé JSON

1. Dans la liste des comptes de service, cliquez sur `pppt-backend@...`
2. Onglet **"Clés"**
3. **"Ajouter une clé"** → **"Créer une clé"**
4. Format : **JSON**
5. Cliquez sur **"Créer"**
6. Le fichier `pppt-simulator-xxxxx.json` se télécharge automatiquement

#### C. Renommer et placer le fichier

1. Renommez le fichier téléchargé en : `credentials.json`
2. Placez-le dans : `C:\Users\charl\Automatisation Création simulateur Prix PPPT\backend\config\credentials.json`

**⚠️ IMPORTANT** : Ne partagez JAMAIS ce fichier ! Il est déjà dans le `.gitignore`.

---

### Étape 2: Copier l'email du Service Account ⏱️ 1 minute

1. Ouvrez le fichier `credentials.json` que vous venez de placer
2. Cherchez la ligne `"client_email"`
3. Copiez l'email (format : `pppt-backend@pppt-simulator.iam.gserviceaccount.com`)

---

### Étape 3: Partager Google Sheets avec le Service Account ⏱️ 2 minutes

1. Ouvrez votre Google Sheets "Devis" :
   https://docs.google.com/spreadsheets/d/1GiPN9N2rb4vRqdGamQLPNoC0i7wRQaXAon5D9slf4og/edit

2. Cliquez sur **"Partager"** (bouton en haut à droite)

3. Collez l'email du Service Account (copié à l'étape 2)

4. Donnez les droits **"Éditeur"**

5. **IMPORTANT** : Décochez "Avertir les utilisateurs" (sinon vous recevrez un email d'erreur)

6. Cliquez sur **"Partager"**

---

### Étape 4: Partager Google Drive avec le Service Account ⏱️ 2 minutes

1. Ouvrez votre dossier Google Drive "PPPT - Fichiers DPE" :
   https://drive.google.com/drive/folders/1M4Ho1dU9qxPyDBEqXGplv8LTHHG-qIJI

2. Clic droit sur le dossier → **"Partager"**

3. Collez l'email du Service Account (même email qu'à l'étape 3)

4. Donnez les droits **"Éditeur"**

5. **IMPORTANT** : Décochez "Avertir les utilisateurs"

6. Cliquez sur **"Partager"**

---

### Étape 5: Créer le fichier .env local ⏱️ 2 minutes

1. Ouvrez un terminal dans le dossier backend :
   ```bash
   cd "C:\Users\charl\Automatisation Création simulateur Prix PPPT\backend"
   ```

2. Copiez le fichier exemple :
   ```bash
   copy .env.example .env
   ```

3. Le fichier `.env` est maintenant créé avec les bons IDs déjà configurés !

**Vérifiez que le contenu est :**
```env
PORT=3000
GOOGLE_SHEETS_ID=1GiPN9N2rb4vRqdGamQLPNoC0i7wRQaXAon5D9slf4og
GOOGLE_DRIVE_FOLDER_ID=1M4Ho1dU9qxPyDBEqXGplv8LTHHG-qIJI
GOOGLE_APPLICATION_CREDENTIALS=./config/credentials.json
FRONTEND_URL=https://silverreferencement.github.io
NODE_ENV=development
```

---

### Étape 6: Installer les dépendances Node.js ⏱️ 2 minutes

1. Dans le terminal (toujours dans le dossier backend) :
   ```bash
   npm install
   ```

2. Attendez que toutes les dépendances s'installent (Express, Google APIs, Multer, etc.)

---

### Étape 7: Tester le backend localement ⏱️ 3 minutes

1. Démarrer le serveur :
   ```bash
   npm start
   ```

2. Vous devriez voir :
   ```
   🚀 Backend PPPT Simulator démarré !
   📡 Port: 3000
   🌍 Environment: development
   ```

3. Dans un autre terminal, testez l'API :
   ```bash
   npm test
   ```

4. Si tous les tests passent (✓), le backend fonctionne parfaitement ! 🎉

**En cas d'erreur :**
- Vérifiez que `credentials.json` est bien dans `backend/config/`
- Vérifiez que vous avez bien partagé Google Sheets et Drive avec le Service Account
- Vérifiez que les APIs Google Sheets et Drive sont activées dans Google Cloud Console

---

### Étape 8: Déployer sur Vercel ⏱️ 10 minutes

#### A. Créer un compte Vercel

1. Allez sur [vercel.com](https://vercel.com/)
2. Cliquez sur **"Sign Up"**
3. Choisissez **"Continue with GitHub"**
4. Autorisez Vercel à accéder à votre compte GitHub

#### B. Importer le projet

1. Dans Vercel, cliquez sur **"Add New..."** → **"Project"**
2. Sélectionnez le repository : `simulateur-pppt`
3. **Configure Project** :
   - Framework Preset : **Other**
   - Root Directory : Cliquez sur **"Edit"** et sélectionnez **`backend`**
   - Build Command : (laissez vide)
   - Output Directory : (laissez vide)
   - Install Command : `npm install`

4. Cliquez sur **"Deploy"** (ça va échouer, c'est normal - il manque les variables d'environnement)

#### C. Configurer les variables d'environnement

1. Allez dans **Settings** → **Environment Variables**

2. Ajoutez ces variables (une par une) :

   | Name | Value |
   |------|-------|
   | `PORT` | `3000` |
   | `GOOGLE_SHEETS_ID` | `1GiPN9N2rb4vRqdGamQLPNoC0i7wRQaXAon5D9slf4og` |
   | `GOOGLE_DRIVE_FOLDER_ID` | `1M4Ho1dU9qxPyDBEqXGplv8LTHHG-qIJI` |
   | `FRONTEND_URL` | `https://silverreferencement.github.io` |
   | `NODE_ENV` | `production` |

3. **IMPORTANTE - Ajouter credentials.json** :

   - Name : `GOOGLE_SERVICE_ACCOUNT_JSON`
   - Value : Ouvrez votre fichier `credentials.json` local
   - Copiez **TOUT le contenu** (du `{` au `}` final, tout le JSON)
   - Collez-le dans la valeur
   - **⚠️ Attention** : C'est un gros bloc JSON, assurez-vous de tout copier !

4. Pour chaque variable, sélectionnez **Production**, **Preview**, et **Development**

5. Cliquez sur **"Save"** pour chaque variable

#### D. Modifier le code pour utiliser la variable JSON

**Je vais faire cette modification pour vous maintenant...**

---

### Étape 9: Connecter le frontend au backend ⏱️ 5 minutes

Une fois le backend déployé sur Vercel, vous aurez une URL comme :
```
https://simulateur-pppt-backend.vercel.app
```

**Je vais préparer le code frontend pour vous, vous n'aurez qu'à mettre à jour l'URL de l'API.**

---

## 📊 Récapitulatif du Temps Total

- ⏱️ **Temps total estimé : 30-35 minutes**
- 🎯 Résultat : Backend 100% fonctionnel en production !

---

## 🆘 Besoin d'Aide ?

Si vous rencontrez un problème à une étape :

1. **Erreur "credentials not found"**
   - Vérifiez que le fichier est bien dans `backend/config/credentials.json`
   - Vérifiez qu'il s'appelle exactement `credentials.json` (pas de `.txt` à la fin)

2. **Erreur "Permission denied" Google Sheets**
   - Vérifiez que vous avez bien partagé le Sheet avec l'email du Service Account
   - Vérifiez que les droits sont "Éditeur" (pas "Lecteur")

3. **Erreur "Permission denied" Google Drive**
   - Vérifiez que vous avez partagé le **dossier** (pas un fichier)
   - Vérifiez les droits "Éditeur"

4. **Tests échouent**
   - Vérifiez que le serveur tourne (`npm start`)
   - Vérifiez les logs d'erreur dans le terminal

5. **Déploiement Vercel échoue**
   - Vérifiez que TOUTES les variables d'environnement sont configurées
   - Vérifiez que `GOOGLE_SERVICE_ACCOUNT_JSON` contient bien tout le JSON
   - Vérifiez les logs de déploiement dans Vercel

---

## ✅ Checklist Finale

Avant de passer à l'étape suivante, vérifiez que vous avez fait :

- [ ] Téléchargé `credentials.json` depuis Google Cloud
- [ ] Placé le fichier dans `backend/config/credentials.json`
- [ ] Copié l'email du Service Account
- [ ] Partagé Google Sheets "Devis" avec le Service Account (Éditeur)
- [ ] Partagé Google Drive "PPPT - Fichiers DPE" avec le Service Account (Éditeur)
- [ ] Créé le fichier `.env` local (copie de `.env.example`)
- [ ] Installé les dépendances (`npm install`)
- [ ] Testé localement (`npm start` et `npm test`)
- [ ] Créé un compte Vercel
- [ ] Importé le projet avec Root Directory = `backend`
- [ ] Configuré toutes les variables d'environnement sur Vercel
- [ ] Déployé avec succès sur Vercel

---

**🎉 Une fois ces étapes terminées, votre backend sera 100% opérationnel !**

Dites-moi quand vous avez terminé et je vous aiderai à connecter le frontend au backend.
