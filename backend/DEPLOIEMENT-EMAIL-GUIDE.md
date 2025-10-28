# 🚀 Guide de Déploiement : Système d'Emails Automatiques

## ✅ Ce qui a été fait

### 1. Services Créés

✅ **`services/emailService.js`**
- Envoi d'email interne (notification pour vous)
- Envoi d'email client (avec PDF en pièce jointe)
- Configuration Gmail + Nodemailer
- Templates HTML professionnels avec branding Atlas PPPT

✅ **`services/pdfGenerator.js`**
- Génération de PDF à partir d'un template Google Docs
- Remplacement automatique des variables `{{...}}`
- Export PDF et envoi au client

✅ **`server.js` mis à jour**
- Intégration complète du système d'emails
- Génération PDF après sauvegarde du devis
- Envoi automatique des 2 emails (interne + client)
- Gestion d'erreurs non bloquante (si email échoue, le devis est quand même sauvegardé)

✅ **Variables d'environnement ajoutées**
- `EMAIL_USER=silver-referencement@gmail.com`
- `EMAIL_PASSWORD=nehn tqiu lvzj zmsq`
- `EMAIL_INTERNAL=silver-referencement@gmail.com`
- `COMPANY_NAME=Atlas PPPT`
- `GOOGLE_DOCS_TEMPLATE_ID` (à ajouter après création du template)

---

## 📋 CE QUE VOUS DEVEZ FAIRE

### ✅ Étape 1 : Créer le Template Google Docs

**Suivez le guide** : `GOOGLE-DOCS-TEMPLATE-GUIDE.md`

**Résumé rapide** :
1. Créez un Google Docs dans ce dossier : https://drive.google.com/drive/folders/1pRxUlIgxeztd91jSTZuu9kBNRhXg9oqF
2. Nommez-le : `Template_Devis_PPPT`
3. Copiez le contenu du template (voir guide)
4. Partagez avec : `pppt-backend@pppt-476018.iam.gserviceaccount.com` (rôle Lecteur)
5. Récupérez l'ID du document depuis l'URL
6. **Donnez-moi cet ID** → Je l'ajouterai dans la config

---

### ✅ Étape 2 : Déployer sur Render avec les Nouvelles Variables

Une fois le template créé et l'ID récupéré :

#### 2.1. Accéder à Render Dashboard

1. Allez sur : https://dashboard.render.com/
2. Connectez-vous avec votre compte
3. Trouvez votre service : **`pppt-backend`**
4. Cliquez dessus

#### 2.2. Ajouter les Variables d'Environnement

1. Dans le menu de gauche, cliquez sur **"Environment"**
2. Cliquez sur **"Add Environment Variable"**

Ajoutez ces variables **une par une** :

| Variable | Valeur |
|----------|--------|
| `EMAIL_USER` | `silver-referencement@gmail.com` |
| `EMAIL_PASSWORD` | `nehn tqiu lvzj zmsq` |
| `EMAIL_INTERNAL` | `silver-referencement@gmail.com` |
| `COMPANY_NAME` | `Atlas PPPT` |
| `GOOGLE_SHEET_ID` | `1GiPN9N2rb4vRqdGamQLPNoC0i7wRQaXAon5D9slf4og` |
| `GOOGLE_DOCS_TEMPLATE_ID` | **L'ID de votre template Google Docs** |

**⚠️ IMPORTANT** :
- Ne mettez PAS de guillemets autour des valeurs
- Copiez-collez exactement les valeurs
- Le `GOOGLE_DOCS_TEMPLATE_ID` doit être l'ID récupéré à l'étape 1

#### 2.3. Sauvegarder et Redéployer

1. Cliquez sur **"Save Changes"**
2. Render va automatiquement redéployer le backend
3. Attendez que le statut passe à **"Live"** (2-3 minutes)

---

## 🧪 Étape 3 : Tester le Système Complet

### Test 1 : Vérifier que le backend est opérationnel

1. Ouvrez : https://pppt-backend.onrender.com/health
2. Vous devriez voir :
   ```json
   {
     "status": "ok",
     "timestamp": "...",
     "environment": "production"
   }
   ```

### Test 2 : Soumettre un devis test

1. Allez sur votre site : https://silverreferencement.github.io/...
2. Remplissez le formulaire avec :
   - Code postal : `75001` (IDF) ou `13001` (hors IDF)
   - Lots : `10`
   - Immeubles : `1`
   - Email : **VOTRE EMAIL PERSONNEL** (pour recevoir le test)
   - DPE : Activé ou désactivé
3. Cliquez sur **"Recevoir le devis par email"**

### Test 3 : Vérifier les résultats

**✅ Ce qui doit se passer** :

1. **Google Sheets** : Nouveau devis sauvegardé
   - Vérifiez : https://docs.google.com/spreadsheets/d/1GiPN9N2rb4vRqdGamQLPNoC0i7wRQaXAon5D9slf4og

2. **Email interne reçu** (`silver-referencement@gmail.com`) :
   - Sujet : `🆕 Nouveau devis PPPT #DEVIS-XXX`
   - Contenu : Tous les détails du devis + liens vers Sheets/Drive
   - Couleurs : Vert #3DA280 (branding Atlas PPPT)

3. **Email client reçu** (votre email de test) :
   - Sujet : `Votre devis PPPT - Référence DEVIS-XXX`
   - Contenu : Récapitulatif du devis
   - Pièce jointe : **PDF du devis** (`Devis_DEVIS-XXX_Atlas_PPPT.pdf`)

4. **Frontend** : Message de confirmation
   - `✅ Votre devis a été envoyé par email !`

---

## 🔍 Dépannage

### Si les emails ne sont pas reçus

1. **Vérifiez les logs Render** :
   - Dashboard Render → Service `pppt-backend` → **"Logs"**
   - Cherchez les messages :
     - `✅ Internal email sent`
     - `✅ Client email sent`
     - `⚠️ Erreur envoi email` (si erreur)

2. **Vérifiez le dossier spam** :
   - Les emails peuvent être filtrés par Gmail

3. **Vérifiez la configuration Gmail** :
   - App Password correct : `nehn tqiu lvzj zmsq`
   - Compte Gmail : `silver-referencement@gmail.com`

4. **Testez la connexion email** :
   - Ajoutez temporairement une route de test dans `server.js`
   - Ou vérifiez les logs pour voir les erreurs spécifiques

### Si le PDF n'est pas généré

1. **Vérifiez que le template existe** :
   - Document partagé avec le Service Account
   - ID correct dans `GOOGLE_DOCS_TEMPLATE_ID`

2. **Vérifiez les logs** :
   - Cherchez : `✅ PDF generated: X bytes`
   - Ou : `⚠️ Erreur génération PDF`

3. **Le système continue de fonctionner** :
   - Même si le PDF échoue, les emails sont envoyés
   - Le client reçoit l'email sans PDF (si erreur)
   - Vous êtes notifié quand même

---

## 📊 Workflow Complet

```
Client remplit formulaire
    ↓
Frontend envoie données au backend
    ↓
Backend reçoit et valide
    ↓
[1] Sauvegarde dans Google Sheets ✅
    ↓
[2] Upload fichier DPE dans Drive (si présent) ✅
    ↓
[3] Génération PDF depuis template Google Docs ✅
    ↓
[4] Envoi email interne (notification) ✅
    ↓
[5] Envoi email client (avec PDF) ✅
    ↓
Frontend affiche confirmation ✅
```

---

## 🎯 Variables d'Environnement - Récapitulatif

### Sur Render, vous devez avoir :

```
PORT=3000
GOOGLE_SHEETS_ID=1GiPN9N2rb4vRqdGamQLPNoC0i7wRQaXAon5D9slf4og
GOOGLE_SHEET_ID=1GiPN9N2rb4vRqdGamQLPNoC0i7wRQaXAon5D9slf4og
GOOGLE_DRIVE_FOLDER_ID=1M4Ho1dU9qxPyDBEqXGplv8LTHHG-qIJI
GOOGLE_DOCS_TEMPLATE_ID=[ID DU TEMPLATE QUE VOUS CRÉEZ]
GOOGLE_APPLICATION_CREDENTIALS=./config/credentials.json
FRONTEND_URL=https://silverreferencement.github.io
NODE_ENV=production
EMAIL_USER=silver-referencement@gmail.com
EMAIL_PASSWORD=nehn tqiu lvzj zmsq
EMAIL_INTERNAL=silver-referencement@gmail.com
COMPANY_NAME=Atlas PPPT
```

**⚠️ Note** : Le fichier `credentials.json` est déjà sur Render (ajouté précédemment)

---

## 📧 Contenu des Emails

### Email Interne (pour vous)

**Sujet** : `🆕 Nouveau devis PPPT #DEVIS-XXX`

**Contenu** :
- Référence du devis
- Email du client
- Code postal + département + région (IDF/hors IDF)
- Nombre de lots et immeubles
- DPE inclus (Oui/Non)
- Prix calculé (en gros et en vert)
- Date de création
- Lien vers le fichier DPE client (si uploadé)
- **Boutons** :
  - 📊 Voir dans Google Sheets
  - 📎 Télécharger fichier DPE (si présent)

### Email Client (pour le demandeur)

**Sujet** : `Votre devis PPPT - Référence DEVIS-XXX`

**Contenu** :
- Message de bienvenue personnalisé
- Récapitulatif :
  - Nombre de lots
  - Nombre d'immeubles
  - Prestation DPE (incluse ou non)
  - **Prix TTC** (en gros et en vert)
- Message : "Votre devis détaillé est en pièce jointe (PDF)"
- Signature : L'équipe Atlas PPPT
- **Pièce jointe** : `Devis_DEVIS-XXX_Atlas_PPPT.pdf`

---

## ✅ Checklist Finale

Avant de tester en production :

- [ ] Template Google Docs créé et partagé avec Service Account
- [ ] ID du template récupéré
- [ ] Variables d'environnement ajoutées sur Render (toutes les 6 nouvelles)
- [ ] Backend redéployé sur Render (statut "Live")
- [ ] Test avec un email personnel effectué
- [ ] Email interne reçu
- [ ] Email client reçu avec PDF en pièce jointe
- [ ] Google Sheets mis à jour
- [ ] Frontend affiche message de confirmation

---

## 🔄 Prochaines Évolutions

### Quand vous passerez à `contact@atlas-pppt.fr`

Il suffira de modifier sur Render :
- `EMAIL_USER` → `contact@atlas-pppt.fr`
- `EMAIL_INTERNAL` → `contact@atlas-pppt.fr`
- `EMAIL_PASSWORD` → Nouveau App Password de ce compte

Rien d'autre à changer ! 🎉

---

## 📞 Support

**Si vous avez des problèmes** :

1. Vérifiez les logs Render (Dashboard → Service → Logs)
2. Vérifiez que toutes les variables d'environnement sont bien configurées
3. Testez d'abord avec un email personnel
4. Vérifiez les dossiers spam
5. Donnez-moi les logs d'erreur si nécessaire

---

**🎉 Une fois tout configuré, le système sera 100% automatique !**

Le client remplit le formulaire → Devis sauvegardé → PDF généré → 2 emails envoyés → Tout est tracé dans Google Sheets.
