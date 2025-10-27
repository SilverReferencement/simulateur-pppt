# 🚀 Étape 8 : Déploiement sur Render (GRATUIT)

**Durée estimée : 10 minutes**

Render est une plateforme gratuite parfaite pour héberger votre backend Node.js.

---

## ✅ Prérequis

- ✅ Les étapes 1-7 sont terminées
- ✅ Onglet "Devis" créé dans Google Sheets
- ✅ Tests locaux réussis
- ✅ Compte GitHub actif

---

## 📝 Étape 8.1 : Créer un Compte Render (2 minutes)

1. Allez sur [render.com](https://render.com/)

2. Cliquez sur **"Get Started"** ou **"Sign Up"**

3. Choisissez **"Sign up with GitHub"**

4. Connectez-vous à votre compte GitHub

5. Autorisez Render à accéder à vos repositories

✅ Vous êtes maintenant connecté à Render !

---

## 📦 Étape 8.2 : Créer un Web Service (3 minutes)

1. Dans le Dashboard Render, cliquez sur **"New +"** (en haut à droite)

2. Sélectionnez **"Web Service"**

3. **Connect a repository** :
   - Cherchez et sélectionnez : **`simulateur-pppt`**
   - Si vous ne le voyez pas, cliquez sur "Configure account" pour autoriser l'accès

4. Cliquez sur **"Connect"** à côté de votre repository

5. **Configuration du Service** :

   | Paramètre | Valeur |
   |-----------|--------|
   | **Name** | `pppt-backend` (ou ce que vous voulez) |
   | **Region** | Europe (Frankfurt) ou Europe (Paris) |
   | **Branch** | `main` |
   | **Root Directory** | `backend` ⚠️ IMPORTANT |
   | **Runtime** | Node |
   | **Build Command** | `npm install` |
   | **Start Command** | `node server.js` |

6. **Instance Type** : Sélectionnez **"Free"** (0$/mois)

7. **NE CLIQUEZ PAS ENCORE sur "Create Web Service"** - Il faut d'abord ajouter les variables d'environnement

---

## 🔑 Étape 8.3 : Configurer les Variables d'Environnement (5 minutes)

### En bas de la page, section "Environment Variables"

Cliquez sur **"Add Environment Variable"** et ajoutez les **6 variables** suivantes :

#### Variable 1 : PORT
- **Key** : `PORT`
- **Value** : `3000`

#### Variable 2 : GOOGLE_SHEETS_ID
- **Key** : `GOOGLE_SHEETS_ID`
- **Value** : `1GiPN9N2rb4vRqdGamQLPNoC0i7wRQaXAon5D9slf4og`

#### Variable 3 : GOOGLE_DRIVE_FOLDER_ID
- **Key** : `GOOGLE_DRIVE_FOLDER_ID`
- **Value** : `1M4Ho1dU9qxPyDBEqXGplv8LTHHG-qIJI`

#### Variable 4 : FRONTEND_URL
- **Key** : `FRONTEND_URL`
- **Value** : `https://silverreferencement.github.io`

#### Variable 5 : NODE_ENV
- **Key** : `NODE_ENV`
- **Value** : `production`

#### Variable 6 : GOOGLE_SERVICE_ACCOUNT_JSON (IMPORTANT !)

**C'est la plus importante - suivez attentivement :**

1. Ouvrez le fichier :
   ```
   C:\Users\charl\Automatisation Création simulateur Prix PPPT\backend\config\credentials.json
   ```

2. Ouvrez-le avec **Notepad** (Bloc-notes)

3. Sélectionnez **TOUT le contenu** (Ctrl+A)
   - Du premier `{` jusqu'au dernier `}`
   - Tout le bloc JSON complet

4. Copiez tout (Ctrl+C)

5. Dans Render :
   - **Key** : `GOOGLE_SERVICE_ACCOUNT_JSON`
   - **Value** : Collez TOUT le JSON (Ctrl+V)

**⚠️ Vérification** : La valeur doit commencer par `{` et finir par `}`, avec tout le JSON entre les deux. C'est un gros bloc de texte, c'est normal !

**Exemple** (les valeurs seront différentes pour vous) :
```json
{
  "type": "service_account",
  "project_id": "pppt-476018",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQ...",
  "client_email": "pppt-backend@pppt-476018.iam.gserviceaccount.com",
  ...
}
```

---

## 🚢 Étape 8.4 : Déployer (1 minute)

1. Vérifiez que vous avez bien :
   - ✅ Root Directory = `backend`
   - ✅ Build Command = `npm install`
   - ✅ Start Command = `node server.js`
   - ✅ 6 variables d'environnement ajoutées

2. Cliquez sur **"Create Web Service"**

3. Render va maintenant :
   - Cloner votre repository
   - Installer les dépendances (`npm install`)
   - Démarrer le serveur (`node server.js`)

4. Attendez que le déploiement se termine (3-5 minutes)

5. Vous verrez des logs défiler dans la console...

6. Quand vous voyez :
   ```
   🚀 Backend PPPT Simulator démarré !
   📡 Port: 3000
   🌍 Environment: production
   ```
   **C'est bon ! Le backend est en ligne !** 🎉

---

## ✅ Étape 8.5 : Récupérer l'URL du Backend (30 secondes)

1. En haut de la page, vous verrez l'URL de votre backend :
   ```
   https://pppt-backend.onrender.com
   ```
   (Le nom peut être différent selon ce que vous avez choisi)

2. **Copiez cette URL** - vous en aurez besoin pour l'étape 9

3. Testez le health check dans votre navigateur :
   ```
   https://pppt-backend.onrender.com/health
   ```

4. Vous devriez voir :
   ```json
   {
     "status": "ok",
     "timestamp": "2025-10-27T...",
     "environment": "production"
   }
   ```

✅ **Si vous voyez ça, le backend est en ligne !** 🎉

---

## 🧪 Tests Supplémentaires

### Test 1 : Récupérer les devis
Ouvrez dans votre navigateur :
```
https://pppt-backend.onrender.com/api/quotes
```

**Résultat attendu** :
```json
{
  "success": true,
  "count": 0,
  "data": []
}
```

### Test 2 : Sauvegarder un devis (avec curl ou Postman)

Si vous avez `curl` installé :
```bash
curl -X POST https://pppt-backend.onrender.com/api/save-quote \
  -F "email=test@example.com" \
  -F "postalCode=75001" \
  -F "lots=50" \
  -F "buildings=1" \
  -F "includeDPE=true" \
  -F "price=1990" \
  -F "department=75" \
  -F "isIDF=true"
```

**Résultat attendu** :
```json
{
  "success": true,
  "quoteId": "DEVIS-001",
  "message": "Devis enregistré avec succès",
  "fileUploaded": false
}
```

### Test 3 : Vérifier dans Google Sheets

1. Ouvrez votre Google Sheets :
   https://docs.google.com/spreadsheets/d/1GiPN9N2rb4vRqdGamQLPNoC0i7wRQaXAon5D9slf4og/edit

2. Allez dans l'onglet **"Devis"**

3. Vous devriez voir :
   - Les en-têtes dans la première ligne
   - Le devis test dans la deuxième ligne (si vous avez fait le test 2)

✅ **Si c'est le cas, l'intégration Google Sheets fonctionne !**

---

## 📊 Logs et Monitoring

### Voir les Logs en Temps Réel

1. Dans Render Dashboard, cliquez sur votre service **"pppt-backend"**

2. Allez dans l'onglet **"Logs"**

3. Vous verrez tous les logs du serveur :
   ```
   🚀 Backend PPPT Simulator démarré !
   [2025-10-27T...] GET /health
   [2025-10-27T...] POST /api/save-quote
   Devis ajouté à Google Sheets: DEVIS-001
   ```

### Déploiements Automatiques

À chaque fois que vous faites un `git push` sur la branche `main`, Render redéploie automatiquement votre backend ! 🚀

Pour désactiver cette fonctionnalité :
- Settings → Build & Deploy → Auto-Deploy : Off

---

## ⚠️ Note Importante : Free Tier Limitations

### Le serveur "s'endort" après 15 minutes d'inactivité

**Ce que ça signifie** :
- Si personne n'utilise le backend pendant 15 minutes, Render met le serveur en pause
- Au prochain appel, le serveur redémarre automatiquement en **~10-30 secondes**
- **C'est normal pour le plan gratuit !**

**Impact sur votre simulateur** :
- Si un client remplit le formulaire après une période d'inactivité, il y aura un délai de 10-30 secondes
- Ensuite, tout fonctionne normalement

**Solutions** :
1. **Accepter le délai** (recommandé - c'est gratuit !)
2. **Keep-alive ping** : Créer un service qui ping le backend toutes les 14 minutes (je peux vous aider avec ça)
3. **Passer au plan payant** : 7$/mois pour un serveur toujours actif

---

## ❌ En Cas d'Erreur

### Erreur : "Build failed"
**Solution** :
1. Vérifiez que Root Directory = `backend` (pas vide, pas `/backend`)
2. Vérifiez que Build Command = `npm install`
3. Consultez les logs de build pour voir l'erreur exacte

### Erreur : "Error: credentials not configured"
**Solution** :
1. Vérifiez que `GOOGLE_SERVICE_ACCOUNT_JSON` est bien configuré
2. Vérifiez que vous avez copié **TOUT** le JSON (pas de ligne manquante)
3. Allez dans Settings → Environment → Modifiez la variable si nécessaire
4. Redéployez : Manual Deploy → Deploy latest commit

### Erreur : "Permission denied" Google Sheets
**Solution** :
1. Vérifiez que vous avez partagé le Google Sheets avec `pppt-backend@pppt-476018.iam.gserviceaccount.com`
2. Vérifiez que les droits sont "Éditeur"
3. Attendez 1-2 minutes (délai de propagation)

### Erreur : "Sheet 'Devis' not found"
**Solution** :
1. Vérifiez que l'onglet "Devis" existe dans votre Google Sheets
2. Vérifiez l'orthographe exacte : "Devis" avec un D majuscule
3. Vérifiez que c'est bien le bon Google Sheets ID

### Le serveur ne démarre pas
**Solution** :
1. Consultez les logs : Logs → Voir l'erreur exacte
2. Vérifiez que Start Command = `node server.js` (pas `npm start`)
3. Vérifiez que toutes les 6 variables d'environnement sont présentes

---

## 🔧 Gestion du Service

### Redéployer Manuellement
1. Dashboard → Votre service
2. **Manual Deploy** → **Deploy latest commit**

### Modifier les Variables d'Environnement
1. Dashboard → Votre service
2. **Environment** (menu de gauche)
3. Modifier les variables
4. **Save Changes** → Le service redémarre automatiquement

### Voir les Métriques
1. Dashboard → Votre service
2. **Metrics** (menu de gauche)
3. Vous verrez : CPU, mémoire, requêtes/sec

### Supprimer le Service
1. Dashboard → Votre service
2. **Settings** (menu de gauche)
3. Tout en bas : **Delete Web Service**

---

## 📋 Checklist Finale Render

Avant de passer à l'étape 9, vérifiez :

- [ ] Compte Render créé et connecté à GitHub
- [ ] Web Service créé avec Root Directory = `backend`
- [ ] Build Command = `npm install`
- [ ] Start Command = `node server.js`
- [ ] Instance Type = Free
- [ ] 6 variables d'environnement configurées
- [ ] `GOOGLE_SERVICE_ACCOUNT_JSON` contient tout le JSON
- [ ] Déploiement réussi (logs montrent "Backend PPPT Simulator démarré !")
- [ ] Health check fonctionne (`/health` renvoie `{"status": "ok"}`)
- [ ] URL du backend copiée (ex: `https://pppt-backend.onrender.com`)

---

## 🎉 Succès !

Une fois ces étapes terminées, votre backend est **100% en ligne** sur Render !

**URL de votre backend** : `https://pppt-backend.onrender.com` (ou votre nom choisi)

**Prochaine étape** : Donnez-moi l'URL de votre backend et je mettrai à jour le frontend pour qu'il utilise cette API.

---

## 💡 Astuces Render

### Auto-Deploy Activé par Défaut
À chaque `git push`, Render redéploie automatiquement. Pratique pour les mises à jour !

### Logs Persistants
Les logs sont conservés pendant 7 jours (plan gratuit). Vous pouvez les consulter à tout moment.

### HTTPS Automatique
Render fournit automatiquement un certificat SSL. Votre API est sécurisée (https://).

### Custom Domain (Optionnel)
Vous pouvez ajouter votre propre domaine dans Settings → Custom Domain (gratuit).

---

## 📞 Besoin d'Aide ?

Si vous rencontrez un problème :
1. Consultez les logs Render (onglet "Logs")
2. Vérifiez que toutes les variables sont bien configurées
3. Testez d'abord `/health` pour vérifier que le serveur démarre
4. Relisez la section "En Cas d'Erreur" ci-dessus

---

## 🆚 Render vs Vercel

| Critère | Render (FREE) | Vercel (FREE) |
|---------|---------------|---------------|
| **Prix** | Gratuit ✅ | Gratuit |
| **Sleep après inactivité** | Oui (15 min) | Non |
| **Réveil** | 10-30 sec | N/A |
| **Build time** | Illimité | Limité |
| **Bandwidth** | 100 GB/mois | 100 GB/mois |
| **Déploiements** | Illimités | Illimités |
| **Custom domain** | Oui | Oui |
| **Node.js support** | Excellent | Excellent |

**Pour votre usage** : Render est parfait ! Le "sleep" n'est pas un problème pour un simulateur de devis.

---

**🚀 Prêt pour l'étape 9 une fois Render déployé !**

Donnez-moi l'URL de votre backend (ex: `https://pppt-backend.onrender.com`) et je connecterai le frontend.
