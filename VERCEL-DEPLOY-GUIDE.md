# 🚀 Guide de Déploiement Vercel

## ✅ Avantages de Vercel

- **⚡ INSTANTANÉ** : Pas de cold start, toujours actif
- **💰 100% GRATUIT** : Pas de limites pour votre usage
- **🔄 AUTO-DEPLOY** : Chaque push GitHub = déploiement automatique
- **🌍 GLOBAL CDN** : Performance mondiale
- **📧 EMAIL MODERNE** : Nouveau template professionnel avec timeline J/J+X

---

## 📋 ÉTAPES DE DÉPLOIEMENT (5 minutes)

### Étape 1 : Créer un compte Vercel

1. Allez sur : **https://vercel.com/signup**
2. Cliquez sur **"Continue with GitHub"**
3. Autorisez Vercel à accéder à vos repos GitHub

### Étape 2 : Importer votre projet

1. Une fois connecté, cliquez sur **"Add New..." → Project**
2. Trouvez le repo **`simulateur-pppt`** dans la liste
3. Cliquez sur **"Import"**

### Étape 3 : Configurer le projet

**Ne modifiez RIEN dans les paramètres de build**. Vercel détecte automatiquement la configuration depuis `vercel.json`.

Cliquez directement sur **"Deploy"** (on ajoutera les variables d'environnement après).

⏳ **Attendez 30-60 secondes** que le premier déploiement se termine.

### Étape 4 : Ajouter les variables d'environnement

Une fois le déploiement terminé :

1. Allez dans **Settings** (en haut)
2. Cliquez sur **Environment Variables** (menu de gauche)
3. Ajoutez les variables suivantes **UNE PAR UNE** :

#### Variable 1 : GOOGLE_SERVICE_ACCOUNT_KEY
**Name:** `GOOGLE_SERVICE_ACCOUNT_KEY`
**Value:** ⚠️ **JE VOUS DONNERAI CETTE VALEUR DIRECTEMENT** (JSON compressé sensible)
**Environment:** Cochez **Production**, **Preview**, et **Development**

#### Variable 2 : GOOGLE_SHEET_ID
**Name:** `GOOGLE_SHEET_ID`
**Value:** `1GiPN9N2rb4vRqdGamQLPNoC0i7wRQaXAon5D9slf4og`
**Environment:** Cochez les 3

#### Variable 3 : GOOGLE_DRIVE_FOLDER_ID
**Name:** `GOOGLE_DRIVE_FOLDER_ID`
**Value:** `1M4Ho1dU9qxPyDBEqXGplv8LTHHG-qIJI`
**Environment:** Cochez les 3

#### Variable 4 : GOOGLE_DOCS_TEMPLATE_ID
**Name:** `GOOGLE_DOCS_TEMPLATE_ID`
**Value:** `1N1kwk5j0gRhgI55AkR2wB_NTGemD0HkscpSNQTBpSwQ`
**Environment:** Cochez les 3

#### Variable 5 : SENDGRID_API_KEY
**Name:** `SENDGRID_API_KEY`
**Value:** ⚠️ **JE VOUS DONNERAI CETTE VALEUR DIRECTEMENT** (clé API SendGrid sensible)
**Environment:** Cochez les 3

#### Variable 6 : EMAIL_FROM
**Name:** `EMAIL_FROM`
**Value:** `contact@atlas-pppt.fr`
**Environment:** Cochez les 3

#### Variable 7 : EMAIL_INTERNAL
**Name:** `EMAIL_INTERNAL`
**Value:** `contact@atlas-pppt.fr`
**Environment:** Cochez les 3

#### Variable 8 : COMPANY_NAME
**Name:** `COMPANY_NAME`
**Value:** `Atlas PPPT`
**Environment:** Cochez les 3

### Étape 5 : Redéployer

Une fois toutes les variables ajoutées :

1. Allez dans **Deployments** (en haut)
2. Cliquez sur **⋯** (trois points) à côté du dernier déploiement
3. Cliquez sur **Redeploy**
4. Confirmez

⏳ **Attendez 30-60 secondes**.

### Étape 6 : Récupérer l'URL

Une fois le redéploiement terminé :

1. Vous verrez une URL du type : `https://votre-projet.vercel.app`
2. **COPIEZ cette URL** et **DONNEZ-LA MOI**
3. Je vais mettre à jour le `script.js` automatiquement

---

## 🎯 APRÈS LE DÉPLOIEMENT

Une fois que vous me donnez l'URL :

✅ Je mets à jour `script.js` avec votre URL Vercel
✅ Je commit et push sur GitHub
✅ Vercel redéploie automatiquement (30s)
✅ On teste un devis complet
✅ On vérifie les 2 emails (interne + client avec nouveau design)

**TOUT SERA AUTOMATIQUE APRÈS** : Chaque modification de code → push GitHub → Vercel redéploie automatiquement ! 🚀

---

## 📊 Comparaison

| Critère | Render (Avant) | Vercel (Maintenant) |
|---------|----------------|---------------------|
| **Vitesse** | 30-60s (cold start) | < 1s (instantané) ✅ |
| **Coût** | Gratuit (limité) | Gratuit (illimité) ✅ |
| **Deploy** | Manuel | Auto GitHub ✅ |
| **Email** | Template basique | Template moderne ✅ |
| **Maintenance** | Serveur à gérer | Zéro maintenance ✅ |

---

## ❓ Questions ?

Si vous rencontrez un problème, envoyez-moi une capture d'écran et je vous aide !

**Dites-moi "ok" une fois les étapes 1-5 terminées et donnez-moi l'URL Vercel !** 🎉
