# Backend PPPT Simulator - Guide de Déploiement

Backend Node.js pour le simulateur PPPT avec intégration Google Sheets et Google Drive.

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Configuration Google Cloud](#configuration-google-cloud)
3. [Installation Locale](#installation-locale)
4. [Configuration des Variables d'Environnement](#configuration-des-variables-denvironnement)
5. [Déploiement sur Vercel](#déploiement-sur-vercel)
6. [API Endpoints](#api-endpoints)
7. [Tests](#tests)

---

## 🔧 Prérequis

- Node.js >= 18.0.0
- Compte Google Cloud Platform
- Compte GitHub
- Compte Vercel (pour le déploiement)

---

## ☁️ Configuration Google Cloud

### 1. Créer un Projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Cliquez sur **"Sélectionner un projet"** → **"Nouveau projet"**
3. Nommez le projet : `pppt-simulator`
4. Cliquez sur **"Créer"**

### 2. Activer les APIs Nécessaires

1. Dans le menu de gauche, allez dans **APIs & Services** → **Bibliothèque**
2. Recherchez et activez les APIs suivantes :
   - **Google Sheets API**
   - **Google Drive API**

### 3. Créer un Service Account

1. Allez dans **APIs & Services** → **Identifiants**
2. Cliquez sur **"Créer des identifiants"** → **"Compte de service"**
3. Remplissez les informations :
   - Nom : `pppt-backend`
   - ID : `pppt-backend` (généré automatiquement)
   - Description : `Service account pour le backend PPPT`
4. Cliquez sur **"Créer et continuer"**
5. Rôle : Sélectionnez **"Éditeur"** (ou créez un rôle personnalisé)
6. Cliquez sur **"Continuer"** puis **"OK"**

### 4. Télécharger la Clé JSON

1. Dans la liste des comptes de service, cliquez sur celui que vous venez de créer
2. Allez dans l'onglet **"Clés"**
3. Cliquez sur **"Ajouter une clé"** → **"Créer une clé"**
4. Sélectionnez **JSON** et cliquez sur **"Créer"**
5. Le fichier `credentials.json` se télécharge automatiquement
6. **IMPORTANT** : Renommez ce fichier en `credentials.json` et placez-le dans `backend/config/`
7. **SÉCURITÉ** : Ne commitez JAMAIS ce fichier sur GitHub !

---

## 📊 Configuration Google Sheets

### 1. Créer la Feuille de Calcul

1. Allez sur [Google Sheets](https://sheets.google.com/)
2. Créez une nouvelle feuille ou utilisez celle existante
3. Notez l'**ID de la feuille** (dans l'URL) :
   ```
   https://docs.google.com/spreadsheets/d/1GiPN9N2rb4vRqdGamQLPNoC0i7wRQaXAon5D9slf4og/edit
                                          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                          C'est l'ID à copier
   ```

### 2. Créer l'Onglet "Devis"

1. Dans votre feuille Google Sheets, créez un onglet nommé **"Devis"**
2. Les en-têtes seront créés automatiquement par le backend au premier lancement
3. Format des colonnes :
   ```
   A: Quote ID
   B: Date
   C: Email
   D: Code Postal
   E: Département
   F: Lots
   G: Immeubles
   H: DPE Inclus
   I: Prix
   J: IDF
   K: Fichier URL
   L: Fichier Nom
   M: Timestamp
   ```

### 3. Partager avec le Service Account

1. Dans Google Sheets, cliquez sur **"Partager"**
2. Copiez l'email du service account (format : `pppt-backend@pppt-simulator.iam.gserviceaccount.com`)
3. Collez-le dans le champ de partage
4. Donnez les droits **"Éditeur"**
5. Cliquez sur **"Envoyer"**

---

## 📁 Configuration Google Drive

### 1. Créer le Dossier de Stockage

1. Allez sur [Google Drive](https://drive.google.com/)
2. Créez un nouveau dossier : **"PPPT - Fichiers DPE"**
3. Notez l'**ID du dossier** (dans l'URL) :
   ```
   https://drive.google.com/drive/folders/1AbC123dEfGhIjKlMnOpQrStUvWxYz
                                           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                           C'est l'ID à copier
   ```

### 2. Partager avec le Service Account

1. Clic droit sur le dossier → **"Partager"**
2. Copiez l'email du service account
3. Collez-le et donnez les droits **"Éditeur"**
4. Cliquez sur **"Envoyer"**

---

## 💻 Installation Locale

### 1. Cloner le Projet

```bash
cd "C:\Users\charl\Automatisation Création simulateur Prix PPPT\backend"
```

### 2. Installer les Dépendances

```bash
npm install
```

### 3. Créer le Fichier .env

Copiez `.env.example` en `.env` :

```bash
copy .env.example .env
```

### 4. Configurer les Variables d'Environnement

Éditez le fichier `.env` avec vos valeurs :

```env
PORT=3000
GOOGLE_SHEETS_ID=1GiPN9N2rb4vRqdGamQLPNoC0i7wRQaXAon5D9slf4og
GOOGLE_DRIVE_FOLDER_ID=VOTRE_FOLDER_ID_ICI
GOOGLE_APPLICATION_CREDENTIALS=./config/credentials.json
FRONTEND_URL=https://silverreferencement.github.io
NODE_ENV=development
```

### 5. Placer le Fichier credentials.json

```bash
mkdir config
# Placez votre fichier credentials.json dans le dossier config/
```

### 6. Tester Localement

```bash
npm start
```

Le serveur démarre sur `http://localhost:3000`

Test health check :
```bash
curl http://localhost:3000/health
```

---

## 🚀 Déploiement sur Vercel

### 1. Préparer le Projet

1. Assurez-vous que tous les fichiers sont committés sur GitHub (SAUF credentials.json)
2. Le backend doit être dans un dossier `backend/` à la racine du repo

### 2. Créer un Compte Vercel

1. Allez sur [vercel.com](https://vercel.com/)
2. Connectez-vous avec GitHub
3. Autorisez Vercel à accéder à votre repository

### 3. Importer le Projet

1. Cliquez sur **"New Project"**
2. Sélectionnez le repository `simulateur-pppt`
3. **Root Directory** : sélectionnez `backend`
4. Cliquez sur **"Deploy"**

### 4. Configurer les Variables d'Environnement

1. Dans les settings du projet Vercel, allez dans **"Environment Variables"**
2. Ajoutez les variables suivantes :

| Key | Value | Environment |
|-----|-------|-------------|
| `PORT` | `3000` | Production |
| `GOOGLE_SHEETS_ID` | `1GiPN9N2rb4vRqdGamQLPNoC0i7wRQaXAon5D9slf4og` | Production |
| `GOOGLE_DRIVE_FOLDER_ID` | `VOTRE_FOLDER_ID` | Production |
| `FRONTEND_URL` | `https://silverreferencement.github.io` | Production |
| `NODE_ENV` | `production` | Production |

### 5. Configurer credentials.json sur Vercel

**Option A : Variables d'environnement (recommandé)**

1. Ouvrez votre fichier `credentials.json` local
2. Copiez TOUT le contenu JSON
3. Dans Vercel, créez une variable : `GOOGLE_SERVICE_ACCOUNT_JSON`
4. Collez le JSON complet comme valeur

Ensuite, modifiez `server.js` et les services pour utiliser cette variable :

```javascript
// Au lieu de :
keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,

// Utilisez :
credentials: process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
  : undefined,
keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
```

**Option B : Fichier uploadé (moins sécurisé)**

1. Ajoutez `config/credentials.json` à votre repo (dans un commit séparé)
2. **ATTENTION** : Cela expose vos credentials publiquement !
3. Non recommandé pour la production

### 6. Redéployer

Une fois les variables configurées, Vercel redéploiera automatiquement.

URL de production : `https://votre-projet.vercel.app`

---

## 📡 API Endpoints

### Health Check

```http
GET /health
```

**Réponse** :
```json
{
  "status": "ok",
  "timestamp": "2025-10-27T12:00:00.000Z",
  "environment": "production"
}
```

### Récupérer Tous les Devis

```http
GET /api/quotes
```

**Réponse** :
```json
{
  "success": true,
  "count": 42,
  "data": [...]
}
```

### Récupérer un Devis Spécifique

```http
GET /api/quotes/:quoteId
```

**Exemple** :
```http
GET /api/quotes/DEVIS-001
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "Quote ID": "DEVIS-001",
    "Email": "client@example.com",
    "Prix": "1990",
    ...
  }
}
```

### Sauvegarder un Devis

```http
POST /api/save-quote
Content-Type: multipart/form-data
```

**Body (form-data)** :
- `email` (string, required) : Email du client
- `postalCode` (string, required) : Code postal (5 chiffres)
- `lots` (number, required) : Nombre de lots (min: 1)
- `buildings` (number, required) : Nombre d'immeubles (1-10)
- `includeDPE` (boolean, required) : DPE inclus ou non
- `price` (number, required) : Prix calculé
- `department` (string, optional) : Département
- `isIDF` (boolean, optional) : Est en Île-de-France
- `dpeFile` (file, optional) : Fichier DPE (PDF, JPG, PNG, max 10MB)

**Réponse** :
```json
{
  "success": true,
  "quoteId": "DEVIS-042",
  "message": "Devis enregistré avec succès",
  "fileUploaded": true
}
```

**Erreur** :
```json
{
  "success": false,
  "error": "Email invalide",
  "errors": [...]
}
```

---

## 🧪 Tests

### Test API Complet

```bash
npm test
```

Ou manuellement :

```bash
node test/test-api.js
```

### Tests Individuels avec cURL

**1. Health Check**
```bash
curl http://localhost:3000/health
```

**2. Récupérer les devis**
```bash
curl http://localhost:3000/api/quotes
```

**3. Sauvegarder un devis (sans fichier)**
```bash
curl -X POST http://localhost:3000/api/save-quote \
  -F "email=test@example.com" \
  -F "postalCode=75001" \
  -F "lots=50" \
  -F "buildings=1" \
  -F "includeDPE=true" \
  -F "price=1990" \
  -F "department=75" \
  -F "isIDF=true"
```

**4. Sauvegarder un devis (avec fichier)**
```bash
curl -X POST http://localhost:3000/api/save-quote \
  -F "email=test@example.com" \
  -F "postalCode=75001" \
  -F "lots=50" \
  -F "buildings=1" \
  -F "includeDPE=true" \
  -F "price=1990" \
  -F "dpeFile=@/path/to/file.pdf"
```

---

## 🔒 Sécurité

### Bonnes Pratiques

1. **Ne jamais committer credentials.json** dans Git
   - Ajoutez-le au `.gitignore`

2. **Utiliser des variables d'environnement** pour tous les secrets

3. **Limiter les permissions** du Service Account au strict nécessaire

4. **Activer CORS** uniquement pour les domaines autorisés :
   ```javascript
   cors({
     origin: process.env.FRONTEND_URL || '*',
   })
   ```

5. **Valider toutes les entrées** avec express-validator

6. **Limiter la taille des fichiers** (actuellement 10MB)

---

## 🛠️ Dépannage

### Erreur : "credentials.json not found"

**Solution** : Vérifiez que le fichier existe dans `backend/config/` et que la variable `GOOGLE_APPLICATION_CREDENTIALS` pointe vers le bon chemin.

### Erreur : "Permission denied" pour Google Sheets

**Solution** : Vérifiez que le Service Account a bien été ajouté avec les droits "Éditeur" sur la feuille Google Sheets.

### Erreur : "File upload failed"

**Solution** : Vérifiez que le Service Account a les droits sur le dossier Google Drive et que le `GOOGLE_DRIVE_FOLDER_ID` est correct.

### L'API ne répond pas sur Vercel

**Solution** :
1. Vérifiez les logs dans Vercel Dashboard
2. Assurez-vous que toutes les variables d'environnement sont configurées
3. Vérifiez que le Root Directory est bien `backend`

---

## 📝 Structure du Projet

```
backend/
├── config/
│   └── credentials.json       # Service Account (NE PAS COMMITTER)
├── services/
│   ├── googleSheets.js        # Service Google Sheets
│   └── googleDrive.js         # Service Google Drive
├── test/
│   └── test-api.js            # Tests API
├── .env                       # Variables locales (NE PAS COMMITTER)
├── .env.example               # Template des variables
├── .gitignore                 # Fichiers à ignorer
├── package.json               # Dépendances
├── README.md                  # Ce fichier
└── server.js                  # Serveur Express
```

---

## 📞 Support

Pour toute question ou problème :
1. Vérifiez ce README
2. Consultez les logs dans Vercel
3. Testez localement d'abord
4. Vérifiez les permissions Google Cloud

---

## 🎉 Prochaines Étapes

Une fois le backend déployé :

1. **Mettre à jour le frontend** pour appeler l'API :
   ```javascript
   const API_URL = 'https://votre-backend.vercel.app';
   ```

2. **Tester l'intégration complète** :
   - Remplir le formulaire
   - Vérifier que le devis est sauvegardé dans Google Sheets
   - Vérifier que le fichier est uploadé sur Google Drive

3. **Activer l'envoi d'emails** (TODO) :
   - Intégrer un service d'email (SendGrid, Mailgun, etc.)
   - Implémenter `emailService.sendQuoteEmail()`

---

**✅ Backend prêt pour la production !**
