# 📄 Guide : Créer le Template Google Docs pour les Devis

## 🎯 Ce que vous devez faire

Créer un document Google Docs dans votre Drive qui servira de modèle pour générer les devis PDF.

---

## ✅ Étape 1 : Créer le Document

1. **Accédez à votre dossier Drive** :
   - Ouvrez : https://drive.google.com/drive/folders/1pRxUlIgxeztd91jSTZuu9kBNRhXg9oqF

2. **Créez un nouveau Google Docs** :
   - Clic droit → **Nouveau** → **Google Docs**
   - Nommez-le : **`Template_Devis_PPPT`**

---

## 📝 Étape 2 : Contenu du Template

Copiez-collez ce contenu dans votre Google Docs :

```
═══════════════════════════════════════════════════════
                         ATLAS PPPT
                  Plan Pluriannuel de Travaux
═══════════════════════════════════════════════════════

DEVIS PERSONNALISÉ

Référence : {{quoteId}}
Date d'émission : {{date}}

───────────────────────────────────────────────────────

CLIENT

Email : {{clientEmail}}
Code postal : {{postalCode}}
Département : {{department}}
Région : {{region}}

───────────────────────────────────────────────────────

DÉTAILS DE LA PRESTATION

Nombre de lots : {{lots}}
Nombre d'immeubles : {{buildings}}
Prestation DPE incluse : {{includeDPE}}

───────────────────────────────────────────────────────

TARIF

Prix total TTC : {{price}}

───────────────────────────────────────────────────────

INFORMATIONS DE CONTACT

{{companyName}}
Email : {{companyEmail}}

═══════════════════════════════════════════════════════
```

---

## 🎨 Étape 3 : Mise en Forme (Optionnel)

Vous pouvez personnaliser le design :

1. **Titre "ATLAS PPPT"** :
   - Police : Arial ou Montserrat
   - Taille : 24pt
   - Couleur : #3DA280 (vert)
   - Alignement : Centré

2. **Sections** :
   - Police : Arial
   - Taille : 11pt
   - Titres des sections en gras

3. **Prix total** :
   - Taille : 18pt
   - Couleur : #3DA280
   - Gras

---

## 🔒 Étape 4 : Partager avec le Service Account

**IMPORTANT** : Le backend doit pouvoir accéder à ce document.

1. **Cliquez sur "Partager"** (bouton en haut à droite)

2. **Ajoutez cette adresse email** :
   ```
   pppt-backend@pppt-476018.iam.gserviceaccount.com
   ```

3. **Rôle** : **Lecteur** (Read-only)

4. **Désactivez** "Avertir les utilisateurs"

5. **Cliquez sur "Envoyer"**

---

## 🔗 Étape 5 : Récupérer l'ID du Document

1. **Ouvrez le document créé**

2. **Regardez l'URL** dans la barre d'adresse :
   ```
   https://docs.google.com/document/d/VOTRE_ID_ICI/edit
   ```

3. **Copiez la partie `VOTRE_ID_ICI`**
   - Exemple : `1A2B3C4D5E6F7G8H9I0J`

4. **Donnez-moi cet ID** → Je l'ajouterai dans la configuration

---

## 🧪 Comment ça Fonctionne

1. **Client remplit le formulaire** sur votre site

2. **Backend reçoit les données** :
   - Lots, immeubles, code postal, email, etc.

3. **Le système** :
   - ✅ Copie le template Google Docs
   - ✅ Remplace toutes les variables `{{...}}` par les vraies valeurs
   - ✅ Exporte le document en PDF
   - ✅ Envoie le PDF par email au client
   - ✅ Supprime la copie temporaire

4. **Résultat** : Le client reçoit un devis PDF personnalisé !

---

## 📋 Variables Disponibles

Ces variables seront automatiquement remplacées :

| Variable | Exemple de valeur |
|----------|-------------------|
| `{{quoteId}}` | DEVIS-001 |
| `{{clientEmail}}` | client@example.com |
| `{{postalCode}}` | 75001 |
| `{{department}}` | 75 |
| `{{region}}` | Île-de-France |
| `{{lots}}` | 10 |
| `{{buildings}}` | 1 |
| `{{includeDPE}}` | Oui / Non |
| `{{price}}` | 990 € |
| `{{date}}` | 27 octobre 2025 |
| `{{companyName}}` | Atlas PPPT |
| `{{companyEmail}}` | contact@atlas-pppt.fr |

---

## ✅ Checklist Finale

Avant de me donner l'ID du document :

- [ ] Document créé dans le bon dossier Drive
- [ ] Contenu copié avec toutes les variables `{{...}}`
- [ ] Partagé avec `pppt-backend@pppt-476018.iam.gserviceaccount.com` (rôle Lecteur)
- [ ] ID du document récupéré depuis l'URL

---

## 📞 Prochaine Étape

**Une fois le document créé** :

1. **Donnez-moi l'ID du document**
   - Format : `1A2B3C4D5E6F7G8H9I0J`

2. **Je vais** :
   - Ajouter cet ID dans la configuration du backend
   - Tester la génération de PDF
   - Déployer le système complet

---

## 💡 Astuce

Vous pouvez modifier le template à tout moment !

- ✅ Changez le design
- ✅ Ajoutez votre logo
- ✅ Modifiez le texte
- ✅ **Les variables `{{...}}` seront toujours remplacées automatiquement**

Le backend lira toujours la dernière version du document.
