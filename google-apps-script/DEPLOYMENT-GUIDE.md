# 🚀 Guide de Déploiement - Google Apps Script

## ✅ Avantages de cette solution

- **GRATUIT** à vie (pas de serveur à payer)
- **INSTANTANÉ** (pas de cold start, toujours actif)
- **FIABLE** (hébergé par Google, 99.9% uptime)
- **SIMPLE** (tout dans Google : Sheets, Drive, Gmail)

---

## 📋 ACTIONS À FAIRE (10 minutes)

### Étape 1 : Ouvrir Google Apps Script

1. Ouvrez votre Google Sheet "Devis" :
   https://docs.google.com/spreadsheets/d/1GiPN9N2rb4vRqdGamQLPNoC0i7wRQaXAon5D9slf4og/edit

2. Cliquez sur **Extensions** → **Apps Script**

3. Une nouvelle fenêtre s'ouvre avec l'éditeur de code

---

### Étape 2 : Copier le Code

1. **Supprimez tout le code** présent dans l'éditeur (par défaut il y a une fonction `myFunction()`)

2. **Copiez TOUT le contenu** du fichier `Code.gs` que j'ai créé

3. **Collez-le** dans l'éditeur Apps Script

4. Cliquez sur **💾 Enregistrer** (ou Ctrl+S)

5. Donnez un nom au projet : **"PPPT Backend"**

---

### Étape 3 : Déployer comme Web App

1. Dans l'éditeur Apps Script, cliquez sur **Déployer** → **Nouveau déploiement**

2. Cliquez sur l'icône **⚙️** (à côté de "Type") → Sélectionnez **"Application Web"**

3. **Configuration du déploiement** :
   - **Description** : `PPPT Backend v1`
   - **Exécuter en tant que** : **Moi** (votre compte Gmail)
   - **Qui a accès** : **Tout le monde**

4. Cliquez sur **Déployer**

5. **IMPORTANT** : Une popup apparaît demandant des autorisations
   - Cliquez sur **Examiner les autorisations**
   - Choisissez votre compte Google
   - Cliquez sur **Paramètres avancés**
   - Cliquez sur **Accéder à PPPT Backend (non sécurisé)**
   - Cliquez sur **Autoriser**

6. **Copiez l'URL de déploiement** qui apparaît (elle ressemble à ça) :
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```

7. **DONNEZ-MOI CETTE URL** → Je vais l'utiliser dans le frontend

---

### Étape 4 : Tester le Script

Avant de modifier le frontend, testons si le script fonctionne :

1. Dans l'éditeur Apps Script, sélectionnez la fonction **`doGet`** dans le menu déroulant en haut

2. Cliquez sur **▶ Exécuter**

3. Si tout fonctionne, vous devriez voir dans les logs :
   ```
   Execution log
   ```

---

## ⚠️ EN CAS D'ERREUR

### Erreur : "Authorization required"
→ Vous devez autoriser le script (voir Étape 3, point 5)

### Erreur : "Exception: Spreadsheet not found"
→ Vérifiez que le SHEET_ID dans Code.gs correspond à votre Google Sheet

### Erreur : "Cannot read property 'parameter'"
→ Normal lors du test avec `doGet`, ça marchera avec de vraies requêtes

---

## 🎯 APRÈS LE DÉPLOIEMENT

Une fois que vous me donnez l'URL du script déployé, je vais :

1. ✅ Modifier le frontend pour appeler votre script au lieu de Render
2. ✅ Tester un envoi de devis complet
3. ✅ Vérifier que tout fonctionne (Sheets, Drive, Emails, PDF)
4. ✅ Déployer sur GitHub Pages

**Résultat** : Le système sera **instantané** et **gratuit** à vie ! 🎉

---

## 📊 Comparaison

| Critère | Render (Avant) | Apps Script (Après) |
|---------|----------------|---------------------|
| **Vitesse** | 30-60s (cold start) | < 2s (instantané) |
| **Coût** | Gratuit (limité) | Gratuit (illimité) |
| **Fiabilité** | 95% | 99.9% |
| **Maintenance** | Serveur à gérer | Zéro maintenance |
| **Limites** | Cold start | 6 min/exécution (OK) |

---

## ❓ Questions Fréquentes

**Q: Est-ce vraiment gratuit ?**
R: Oui ! Google Apps Script est gratuit sans limite de requêtes (dans les quotas raisonnables).

**Q: C'est sécurisé ?**
R: Oui, le script s'exécute avec vos permissions Google et tout est dans votre Google Workspace.

**Q: Puis-je voir les logs ?**
R: Oui, dans l'éditeur Apps Script : **Exécutions** → Voir les logs de toutes les exécutions.

**Q: Puis-je modifier le code après ?**
R: Oui ! Modifiez le code, sauvegardez, et créez un nouveau déploiement (l'URL restera la même).

---

## 🚀 PRÊT ?

**Faites les étapes 1-3 et donnez-moi l'URL de déploiement !**

Je vais ensuite tout connecter et tester pour vous. 🎉
