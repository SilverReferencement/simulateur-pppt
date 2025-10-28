# 🚀 Déploiement du Script Apps Script (UNIQUE - 5 minutes)

## Étape 1 : Créer le projet Apps Script

1. Va sur https://script.google.com/
2. Clique sur **"Nouveau projet"**
3. Renomme le projet : **"PPPT - Générateur PDF"**

## Étape 2 : Copier le code

1. Supprime le code par défaut
2. Ouvre le fichier `GeneratePDF.gs` (dans ce dossier)
3. **Copie tout le contenu** et colle-le dans l'éditeur Apps Script
4. Clique sur **💾 Enregistrer** (Ctrl+S)

## Étape 3 : Déployer comme Web App

1. En haut à droite, clique sur **"Déployer"** → **"Nouveau déploiement"**
2. À côté de "Sélectionner un type", clique sur ⚙️ et choisis **"Application Web"**
3. Remplis les paramètres :
   - **Description :** "Générateur PDF PPPT v1"
   - **Exécuter en tant que :** **"Moi"** (TON compte)
   - **Qui a accès :** **"Tout le monde"** (important!)
4. Clique sur **"Déployer"**
5. ⚠️ **Autorise l'accès** si demandé :
   - Clique "Autoriser l'accès"
   - Choisis ton compte Google
   - Clique "Paramètres avancés" → "Accéder à PPPT - Générateur PDF"
   - Clique "Autoriser"

## Étape 4 : Récupérer l'URL du webhook

1. Une fois déployé, tu verras une **URL** qui ressemble à :
   ```
   https://script.google.com/macros/s/AKfycby.../exec
   ```
2. **📋 COPIE CETTE URL** (elle sera utilisée dans Vercel)

## Étape 5 : Tester (optionnel)

1. Dans l'éditeur, sélectionne la fonction `testGeneratePDF`
2. Clique sur ▶️ **Exécuter**
3. Vérifie les logs (Affichage → Journaux) → Tu dois voir "✅ Test successful!"

---

## ✅ C'est terminé !

**Donne-moi l'URL du webhook** et je vais modifier le backend pour l'utiliser ! 🎯

---

## 🔄 Pour modifier le template plus tard

**C'est simple :**
- Édite le template Google Docs visuellement : https://docs.google.com/document/d/1zVyvo0RIukOmF8L1PSthARQjyOSG8GA3S2Mr4wdtEMQ/edit
- Les changements sont automatiquement pris en compte
- **Aucune autre action requise** ✨
