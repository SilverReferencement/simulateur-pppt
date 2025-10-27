# 📧 Configuration de l'Envoi d'Emails

**Pourquoi les emails ne sont PAS envoyés actuellement ?**

Le backend sauvegarde bien les devis dans Google Sheets, mais **n'envoie pas d'email** car aucun service d'envoi n'est configuré.

---

## 🎯 Options pour Envoyer des Emails

### Option 1 : Nodemailer + Gmail (GRATUIT - SIMPLE)

**Avantages** :
- ✅ Gratuit
- ✅ Simple à configurer
- ✅ Utilise votre compte Gmail

**Limitations** :
- ⚠️ Limite : 500 emails/jour
- ⚠️ Nécessite un "App Password" Gmail

**Comment faire** :
1. Créez un "App Password" dans votre compte Gmail
2. J'ajoute le service email au backend
3. Configuration des variables d'environnement

---

### Option 2 : SendGrid (GRATUIT jusqu'à 100 emails/jour)

**Avantages** :
- ✅ 100 emails/jour gratuits
- ✅ Professionnel et fiable
- ✅ Statistiques d'emails

**Comment faire** :
1. Créez un compte sur sendgrid.com
2. Obtenez une clé API
3. J'ajoute le service email au backend

---

### Option 3 : Notification par Email Simple (VIA GOOGLE SHEETS)

**Solution alternative SANS backend email** :

Au lieu d'envoyer un email directement au client, vous pouvez :
1. ✅ Le client remplit le formulaire
2. ✅ Devis sauvegardé dans Google Sheets (déjà fait !)
3. ✅ Vous recevez une notification Google Sheets par email
4. ✅ Vous envoyez manuellement le devis au client

**Avantages** :
- ✅ Déjà fonctionnel (Google Sheets)
- ✅ Pas de configuration email nécessaire
- ✅ Vous contrôlez l'envoi

---

## 🚀 MA RECOMMANDATION

### Pour Démarrer Rapidement : Option 3 (Notification Google Sheets)

**C'est la solution la plus simple** :

1. **Activez les notifications Google Sheets** :
   - Ouvrez votre Google Sheets "Devis"
   - Outils → Notifications
   - Cochez "M'avertir par e-mail lorsque... des modifications sont apportées"
   - Vous recevrez un email à chaque nouveau devis !

2. **Workflow** :
   ```
   Client remplit formulaire
   → Backend sauvegarde dans Sheets
   → Vous recevez notification email
   → Vous consultez le devis dans Sheets
   → Vous envoyez manuellement le devis au client
   ```

3. **Avantages** :
   - ✅ Fonctionne MAINTENANT (aucune config)
   - ✅ Vous validez chaque devis avant envoi
   - ✅ Gratuit et simple

---

### Pour Automatiser Complètement : Option 1 (Gmail + Nodemailer)

Si vous voulez que le client reçoive un email automatiquement, je peux configurer Nodemailer avec Gmail.

**Ce qu'il faut** :
1. Votre adresse Gmail (ex: contact@votresite.com)
2. Un "App Password" Gmail (je vous guide pour le créer)
3. 10 minutes pour la configuration

**Ce que j'ajoute au backend** :
- Service d'envoi d'email avec template HTML
- Email automatique au client avec récapitulatif du devis
- Email de notification pour vous avec les détails

---

## 📋 Que Voulez-Vous Faire ?

### Choix 1 : Notification Google Sheets (Recommandé pour démarrer)
**Action** : Activez les notifications dans Google Sheets (Outils → Notifications)
**Temps** : 2 minutes
**Résultat** : Vous recevez un email à chaque nouveau devis

### Choix 2 : Envoi Email Automatique avec Gmail
**Action** : Je configure Nodemailer + Gmail
**Temps** : 10 minutes
**Prérequis** :
- Votre adresse Gmail
- Créer un "App Password" (je vous guide)

### Choix 3 : Envoi Email Automatique avec SendGrid
**Action** : Je configure SendGrid
**Temps** : 15 minutes
**Prérequis** :
- Créer un compte SendGrid (gratuit)
- Obtenir une clé API

---

## 💡 Mon Conseil

**Commencez avec l'Option 3 (Notification Google Sheets)** :
- ✅ Fonctionne immédiatement
- ✅ Simple et gratuit
- ✅ Vous pouvez toujours ajouter l'email automatique plus tard

**Ensuite, si vous voulez automatiser** :
→ Option 1 (Gmail + Nodemailer) pour envoyer des emails automatiques

---

## ⚙️ Pour Activer les Notifications Google Sheets

1. Ouvrez : https://docs.google.com/spreadsheets/d/1GiPN9N2rb4vRqdGamQLPNoC0i7wRQaXAon5D9slf4og/edit

2. Menu **Outils** → **Paramètres de notification**

3. Cochez :
   - ✅ "M'avertir par e-mail lorsque des modifications sont apportées"
   - ✅ "M'envoyer un résumé quotidien"

4. Cliquez sur **Enregistrer**

**✅ Vous recevrez maintenant un email à chaque nouveau devis !**

---

## 📞 Dites-Moi Votre Choix

**Quelle option préférez-vous ?**

1. **"Notification Sheets"** → J'active les notifications Google Sheets (2 min)
2. **"Gmail"** → Je configure l'email automatique avec Gmail (10 min)
3. **"SendGrid"** → Je configure l'email automatique avec SendGrid (15 min)
4. **"Plus tard"** → On garde comme ça pour l'instant

---

**💡 Actuellement, le système fonctionne parfaitement** : les devis sont sauvegardés dans Google Sheets. Seul l'envoi d'email automatique au client manque.
