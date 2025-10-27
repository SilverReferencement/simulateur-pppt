# Backend Requis pour Fonctionnalités Avancées

## ⚠️ Important

Certaines fonctionnalités du simulateur **nécessitent un backend** car elles ne peuvent pas être implémentées uniquement en frontend pour des raisons de sécurité.

---

## 🔒 Fonctionnalités nécessitant un backend

### 1. **Enregistrement dans Google Sheets**

**Pourquoi ?**
- L'API Google Sheets nécessite OAuth 2.0
- Les clés API ne peuvent pas être exposées dans le frontend (risque de sécurité)
- CORS bloque les requêtes directes depuis le navigateur

**Solution nécessaire :**
```
Frontend → Backend API → Google Sheets API
```

### 2. **Upload de fichiers PDF/Images**

**Pourquoi ?**
- Les fichiers doivent être stockés sur un serveur
- Besoin de validation côté serveur
- Génération de noms de fichiers uniques et sécurisés

**Solution nécessaire :**
```
Frontend → Backend API → Stockage (Google Drive / AWS S3 / Serveur)
```

### 3. **Envoi d'emails**

**Pourquoi ?**
- Les credentials SMTP ne peuvent pas être dans le frontend
- Besoin de templating côté serveur
- Protection contre le spam

**Solution nécessaire :**
```
Frontend → Backend API → Service Email (SendGrid / Mailgun / SMTP)
```

---

## 🛠️ Architecture Recommandée

### Option 1 : Node.js + Express (Recommandé)

```
simulateur-pppt-backend/
├── server.js
├── routes/
│   └── quotes.js
├── services/
│   ├── googleSheets.js
│   ├── fileUpload.js
│   └── emailService.js
└── config/
    └── credentials.json
```

**Technologies :**
- Express.js pour l'API
- Google APIs Node.js Client
- Multer pour l'upload de fichiers
- Nodemailer pour les emails

### Option 2 : Google Apps Script (Alternative simple)

Si vous voulez éviter un serveur séparé, vous pouvez utiliser Google Apps Script directement lié au Google Sheet.

---

## 📋 Ce qui est déjà implémenté (Frontend)

✅ **Interface complète**
✅ **Validation des données**
✅ **Calcul des prix**
✅ **Logique de l'astérisque (IDF)**
✅ **Upload de fichier (UI seulement)**
✅ **Préparation des données pour l'API**

---

## 🚀 Prochaines étapes

### Backend à créer :

1. **Endpoint POST `/api/save-quote`**
   - Reçoit les données du formulaire
   - Valide les données
   - Enregistre dans Google Sheets
   - Gère l'upload du fichier
   - Envoie l'email
   - Retourne un ID unique

### Structure des données à enregistrer :

```javascript
{
  quoteId: "unique-id",        // Généré par le backend
  email: "user@example.com",
  postalCode: "75001",
  department: "75",
  isIDF: true,
  lots: 50,
  buildings: 2,
  includeDPE: true,
  price: 2980,
  hasFile: true,
  fileName: "dpe_001.pdf",     // Renommé par le backend
  fileUrl: "...",              // URL du fichier stocké
  date: "2025-10-27T...",
  timestamp: 1698765432100
}
```

### Google Sheet structure (colonnes) :

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
J: Fichier DPE (URL)
K: Timestamp
```

---

## 💡 Options d'implémentation rapide

### Option A : Google Apps Script (Sans serveur)

**Avantages :**
- Gratuit
- Directement intégré à Google Sheets
- Pas besoin de serveur externe

**Inconvénients :**
- Limité en fonctionnalités
- Plus difficile à déboguer

### Option B : Node.js + Vercel/Netlify Functions (Serverless)

**Avantages :**
- Gratuit (tier gratuit suffisant)
- Facile à déployer
- Scalable automatiquement

**Inconvénients :**
- Nécessite un compte et une config

### Option C : Node.js + Serveur dédié

**Avantages :**
- Contrôle total
- Performance optimale

**Inconvénients :**
- Coût mensuel
- Maintenance requise

---

## 📞 Pour activer ces fonctionnalités

Vous avez 2 options :

1. **Je crée le backend pour vous** (nécessite accès aux credentials Google)
2. **Vous créez le backend** (je fournis la documentation et le code de base)

Choisissez l'option qui vous convient et nous pourrons implémenter la solution complète !

---

## 🔗 Google Sheet de destination

**Sheet ID :** `1GiPN9N2rb4vRqdGamQLPNoC0i7wRQaXAon5D9slf4og`

Ce Sheet doit être configuré avec les permissions appropriées pour le compte de service qui écrira les données.
