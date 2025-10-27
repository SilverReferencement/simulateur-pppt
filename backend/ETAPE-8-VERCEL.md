# 🚀 Étape 8 : Déploiement sur Vercel

**Durée estimée : 10 minutes**

---

## Prérequis

✅ Les étapes 1-7 sont terminées
✅ Onglet "Devis" créé dans Google Sheets
✅ Tests locaux réussis

---

## 📝 Étape 8.1 : Créer un Compte Vercel (2 minutes)

1. Allez sur [vercel.com](https://vercel.com/)

2. Cliquez sur **"Sign Up"** (en haut à droite)

3. Choisissez **"Continue with GitHub"**

4. Connectez-vous à votre compte GitHub

5. Autorisez Vercel à accéder à vos repositories

✅ Vous êtes maintenant connecté à Vercel !

---

## 📦 Étape 8.2 : Importer le Projet (3 minutes)

1. Dans Vercel, cliquez sur **"Add New..."** → **"Project"**

2. Cherchez et sélectionnez le repository : **`simulateur-pppt`**

3. Cliquez sur **"Import"**

4. **Configure Project** :

   | Paramètre | Valeur |
   |-----------|--------|
   | **Framework Preset** | Other |
   | **Root Directory** | Cliquez sur "Edit" → Sélectionnez **`backend`** |
   | **Build Command** | *(laissez vide)* |
   | **Output Directory** | *(laissez vide)* |
   | **Install Command** | `npm install` |

5. **NE CLIQUEZ PAS ENCORE SUR "DEPLOY"** - Il faut d'abord configurer les variables d'environnement

---

## 🔑 Étape 8.3 : Configurer les Variables d'Environnement (5 minutes)

### Avant de déployer, ajoutez ces 6 variables :

1. Déroulez la section **"Environment Variables"**

2. Ajoutez les variables **une par une** :

#### Variable 1 : PORT
- **Name** : `PORT`
- **Value** : `3000`
- **Environments** : ✅ Production, ✅ Preview, ✅ Development
- Cliquez sur **"Add"**

#### Variable 2 : GOOGLE_SHEETS_ID
- **Name** : `GOOGLE_SHEETS_ID`
- **Value** : `1GiPN9N2rb4vRqdGamQLPNoC0i7wRQaXAon5D9slf4og`
- **Environments** : ✅ Production, ✅ Preview, ✅ Development
- Cliquez sur **"Add"**

#### Variable 3 : GOOGLE_DRIVE_FOLDER_ID
- **Name** : `GOOGLE_DRIVE_FOLDER_ID`
- **Value** : `1M4Ho1dU9qxPyDBEqXGplv8LTHHG-qIJI`
- **Environments** : ✅ Production, ✅ Preview, ✅ Development
- Cliquez sur **"Add"**

#### Variable 4 : FRONTEND_URL
- **Name** : `FRONTEND_URL`
- **Value** : `https://silverreferencement.github.io`
- **Environments** : ✅ Production, ✅ Preview, ✅ Development
- Cliquez sur **"Add"**

#### Variable 5 : NODE_ENV
- **Name** : `NODE_ENV`
- **Value** : `production`
- **Environments** : ✅ Production, ✅ Preview, ✅ Development
- Cliquez sur **"Add"**

#### Variable 6 : GOOGLE_SERVICE_ACCOUNT_JSON (IMPORTANT !)

C'est la plus importante - suivez attentivement :

1. Ouvrez le fichier :
   ```
   C:\Users\charl\Automatisation Création simulateur Prix PPPT\backend\config\credentials.json
   ```

2. Ouvrez-le avec **Notepad** (Bloc-notes)

3. Sélectionnez **TOUT le contenu** (Ctrl+A)
   - Du premier `{` jusqu'au dernier `}`
   - Tout le bloc JSON complet

4. Copiez tout (Ctrl+C)

5. Dans Vercel :
   - **Name** : `GOOGLE_SERVICE_ACCOUNT_JSON`
   - **Value** : Collez TOUT le JSON (Ctrl+V)
   - **Environments** : ✅ Production, ✅ Preview, ✅ Development
   - Cliquez sur **"Add"**

**⚠️ Vérification** : La valeur doit commencer par `{` et finir par `}`, avec tout le JSON entre les deux. C'est un gros bloc, c'est normal !

---

## 🚢 Étape 8.4 : Déployer (1 minute)

1. Vérifiez que vous avez bien ajouté les **6 variables**

2. Cliquez sur **"Deploy"**

3. Attendez que le déploiement se termine (2-3 minutes)

4. Vous verrez des logs défiler... puis un message de succès ! 🎉

---

## ✅ Étape 8.5 : Vérifier le Déploiement (1 minute)

1. Une fois le déploiement terminé, cliquez sur **"Continue to Dashboard"**

2. En haut, vous verrez l'URL de votre backend, par exemple :
   ```
   https://simulateur-pppt-backend.vercel.app
   ```

3. Copiez cette URL

4. Testez le health check dans votre navigateur :
   ```
   https://votre-url.vercel.app/health
   ```

5. Vous devriez voir :
   ```json
   {
     "status": "ok",
     "timestamp": "2025-10-27T...",
     "environment": "production"
   }
   ```

✅ **Si vous voyez ça, le backend est en ligne !** 🎉

---

## 🧪 Tests Supplémentaires (Optionnel)

### Test 1 : Récupérer les devis
```
https://votre-url.vercel.app/api/quotes
```

Résultat attendu :
```json
{
  "success": true,
  "count": 0,
  "data": []
}
```

### Test 2 : Vérifier les logs
1. Dans Vercel Dashboard, allez dans **"Logs"**
2. Vous verrez les requêtes en temps réel
3. Toute erreur apparaîtra ici

---

## ❌ En Cas d'Erreur

### Erreur : "Error: credentials not configured"
**Solution** :
1. Vérifiez que `GOOGLE_SERVICE_ACCOUNT_JSON` est bien configuré
2. Vérifiez que vous avez copié **TOUT** le JSON (pas de ligne manquante)
3. Redéployez : Settings → Deployments → ... → Redeploy

### Erreur : "Permission denied" Google Sheets
**Solution** :
1. Vérifiez que vous avez partagé le Google Sheets avec `pppt-backend@pppt-476018.iam.gserviceaccount.com`
2. Vérifiez que les droits sont "Éditeur"
3. Attendez 1-2 minutes (délai de propagation)

### Erreur : "Sheet not found"
**Solution** :
1. Vérifiez que l'onglet "Devis" existe dans votre Google Sheets
2. Vérifiez l'orthographe exacte : "Devis" avec un D majuscule

### Build Failed
**Solution** :
1. Vérifiez que Root Directory = `backend`
2. Vérifiez que toutes les 6 variables sont configurées
3. Consultez les logs d'erreur dans Vercel

---

## 📋 Checklist Finale Vercel

Avant de passer à l'étape 9, vérifiez :

- [ ] Compte Vercel créé et connecté à GitHub
- [ ] Projet importé avec Root Directory = `backend`
- [ ] 6 variables d'environnement configurées
- [ ] `GOOGLE_SERVICE_ACCOUNT_JSON` contient tout le JSON
- [ ] Déploiement réussi (pas d'erreur)
- [ ] Health check fonctionne (`/health` renvoie `{"status": "ok"}`)
- [ ] URL du backend copiée

---

## 🎉 Succès !

Une fois ces étapes terminées, votre backend est **100% en ligne** sur Vercel !

**Prochaine étape** : Je mettrai à jour le frontend pour qu'il utilise votre backend Vercel.

---

## 📞 Besoin d'Aide ?

Si vous rencontrez un problème :
1. Consultez les logs Vercel (section "Logs" dans le dashboard)
2. Vérifiez que toutes les variables sont bien configurées
3. Testez d'abord `/health` pour vérifier que le serveur démarre
4. Relisez `TEST-RESULTS.md` pour les prérequis

---

**🚀 Prêt pour l'étape 9 une fois Vercel déployé !**
