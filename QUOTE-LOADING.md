# 📧 Chargement de Devis depuis Email

## 🎯 Fonctionnalité

Lorsqu'un client reçoit un devis par email, il peut cliquer sur le bouton **"Valider le devis et payer la prestation"** pour être redirigé vers le simulateur avec toutes ses données pré-remplies.

## 🔄 Flux Utilisateur

1. **Client remplit le simulateur** et demande un devis par email
2. **Email envoyé** avec le devis en PDF + bouton CTA
3. **Client clique** sur "Valider le devis et payer la prestation"
4. **Redirection** vers le simulateur avec paramètre `?quoteId=DEVIS-XXX`
5. **Chargement automatique** de toutes les données depuis Google Sheets
6. **Formulaire pré-rempli** avec toutes les informations
7. **Client peut modifier** et procéder au paiement

## 🛠️ Architecture Technique

### 1. API Endpoint : `/api/get-quote`

**Fichier** : `api/get-quote.js`

**Méthode** : `GET`

**Paramètres** :
- `id` (query parameter) : L'ID du devis (ex: DEVIS-001)

**Réponse** :
```json
{
  "success": true,
  "quote": {
    "quoteId": "DEVIS-001",
    "userFirstname": "Jean",
    "userLastname": "Dupont",
    "email": "jean.dupont@example.com",
    "userPhone": "06 12 34 56 78",
    "postalCode": "75001",
    "propertyAddress": "123 Rue Example",
    "lots": 50,
    "buildings": 2,
    "includeDPE": true,
    "dpeDate": "15/01/2023",
    "price": "5000",
    "isPresident": false,
    "presidentFirstname": "Marie",
    "presidentLastname": "Martin",
    "presidentEmail": "marie.martin@example.com",
    "presidentPhone": "06 98 76 54 32",
    "councilMembers": [
      {
        "firstname": "Pierre",
        "lastname": "Durand",
        "email": "pierre@example.com",
        "phone": "06 11 22 33 44"
      }
    ],
    "agDate": "01/06/2024",
    "comment": "Commentaire exemple"
  }
}
```

### 2. Lien Email

**Fichier** : `api/save-quote.js` (ligne 533)

Le bouton CTA dans l'email pointe vers :
```
${SIMULATOR_URL}/?quoteId=${quoteData.quoteId}
```

**Variable d'environnement** : `SIMULATOR_URL`

### 3. Frontend Loading

**Fichier** : `script.js`

**Fonctions principales** :
- `getUrlParameter(name)` : Extrait les paramètres de l'URL
- `loadQuoteFromUrl()` : Détecte `quoteId` et charge les données via API
- `populateFormWithQuote(quote)` : Pré-remplit tous les champs du formulaire

**Champs pré-remplis** :
- Code postal
- Adresse de la copropriété
- Nombre d'immeubles (boutons)
- Nombre de lots (slider + input)
- Date du dernier DPE Collectif
- Option DPE Collectif (boutons Sans/Avec)
- Prénom et Nom du client
- Email du client
- Téléphone du client
- Président du conseil syndical (checkbox + champs)
- Membres du conseil syndical (dynamique)
- Prochaine date d'AG
- Commentaire

## ⚙️ Configuration Vercel

### Variables d'Environnement

Dans les settings Vercel du projet, ajouter :

```bash
SIMULATOR_URL=https://votre-domaine.vercel.app
```

**OU** pour GitHub Pages :

```bash
SIMULATOR_URL=https://charles-dupin44.github.io/Automatisation-Creation-simulateur-Prix-PPPT
```

### Déploiement

1. Les changements sont automatiquement déployés via Vercel lors du push sur `main`
2. L'endpoint `/api/get-quote` sera disponible immédiatement
3. Le simulateur détectera automatiquement le paramètre `quoteId`

## 🧪 Test

### Test Local

1. Créer un devis test via le simulateur
2. Noter l'ID du devis (ex: DEVIS-001)
3. Ouvrir l'URL : `http://localhost:3000/?quoteId=DEVIS-001`
4. Vérifier que tous les champs sont pré-remplis

### Test Production

1. Recevoir un email de devis
2. Cliquer sur "Valider le devis et payer la prestation"
3. Vérifier la redirection vers le simulateur
4. Vérifier que tous les champs sont correctement pré-remplis

## 🔒 Sécurité

- Les données sont stockées dans Google Sheets (privé)
- L'API utilise les credentials Google configurés dans Vercel
- Seules les données du devis sont accessibles (pas de données sensibles)
- Pas d'authentification requise (l'ID du devis suffit)

## 📝 Notes

- Le formulaire email s'ouvre automatiquement lorsqu'un devis est chargé
- Le bouton "Je veux recevoir un devis par email" est masqué
- Les dates sont converties du format DD/MM/YYYY vers YYYY-MM-DD pour les inputs HTML
- Les membres du conseil syndical sont ajoutés dynamiquement
- Le prix est recalculé après le chargement des données

## 🐛 Debugging

### Console Logs

Lors du chargement d'un devis, les logs suivants apparaissent :

```javascript
🔍 Loading quote: DEVIS-001
✅ Quote loaded: {quoteId: "DEVIS-001", ...}
```

### Erreurs Communes

**Quote not found**
- Vérifier que l'ID existe dans le Google Sheet
- Vérifier que le Google Sheet ID est correct

**Failed to load quote**
- Vérifier les credentials Google dans Vercel
- Vérifier que l'API endpoint est déployé

**Fields not populated**
- Vérifier la structure des données dans Google Sheet
- Vérifier les noms de colonnes (doivent correspondre)
- Vérifier la console JavaScript pour les erreurs

## 🔄 Workflow Complet

```
┌─────────────────┐
│ Client remplit  │
│  le simulateur  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Envoi email    │
│  avec PDF +     │
│  bouton CTA     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Clic sur bouton │
│ "Valider devis" │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Redirection    │
│ simulateur avec │
│   ?quoteId=XXX  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ API GET /api/   │
│   get-quote     │
│  charge données │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Formulaire      │
│  pré-rempli     │
│  automatiquement│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Client valide   │
│   et paye       │
└─────────────────┘
```

## ✅ Checklist Déploiement

- [x] API endpoint `/api/get-quote` créé
- [x] Lien email mis à jour avec `?quoteId=`
- [x] Frontend détecte paramètre URL
- [x] Fonction de pré-remplissage implémentée
- [x] Code committé et pushé
- [ ] Variable `SIMULATOR_URL` configurée sur Vercel
- [ ] Test avec un vrai devis
- [ ] Validation du workflow complet
