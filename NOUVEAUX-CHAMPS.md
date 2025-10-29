# 📋 Nouveaux Champs - Documentation Complète

## 🎯 Champs Dynamiques pour le Template PDF Google Docs

Voici tous les champs dynamiques que tu peux utiliser dans ton template Google Docs.
Dans le document, écris ces champs **exactement comme indiqué** (avec les accolades doubles).

### Informations principales
- `{{quoteId}}` - Numéro du devis (ex: DEVIS-001)
- `{{date}}` - Date du devis (format: jj/mm/aaaa)

### Informations client
- `{{userName}}` - Prénom Nom du client
- `{{userEmail}}` - Email du client
- `{{userPhone}}` - Téléphone du client

### Copropriété
- `{{propertyAddress}}` - Adresse de la copropriété (facultatif)
- `{{postalCode}}` - Code postal
- `{{department}}` - Département (ex: 75, 92, etc.)

### Détails du devis
- `{{lots}}` - Nombre de lots
- `{{buildings}}` - Nombre d'immeubles
- `{{includeDPE}}` - DPE Collectif inclus (Oui/Non)
- `{{dpeDate}}` - Date du dernier DPE (si applicable)
- `{{price}}` - Prix total (ex: 5 000 €)

### Président du conseil syndical
- `{{isPresident}}` - Le demandeur est président (Oui/Non)
- `{{presidentName}}` - Nom du président
- `{{presidentEmail}}` - Email du président
- `{{presidentPhone}}` - Téléphone du président

### Membres du conseil syndical
- `{{councilMembers}}` - Liste des membres (format multiligne)

### Informations complémentaires
- `{{agDate}}` - Prochaine date d'AG (facultatif)
- `{{comment}}` - Commentaire à destination d'Atlas PPPT (facultatif)

---

## 📊 En-têtes de Colonnes Google Sheet

Voici les 24 colonnes à créer dans ton Google Sheet (dans l'ordre) :

1. **ID Devis**
2. **Date**
3. **Nom Client**
4. **Email Client**
5. **Téléphone Client**
6. **Adresse Copropriété**
7. **Code Postal**
8. **Département**
9. **Île-de-France**
10. **Nombre de Lots**
11. **Nombre d'Immeubles**
12. **DPE Collectif**
13. **Date Dernier DPE**
14. **Prix**
15. **Demandeur = Président**
16. **Nom Président**
17. **Email Président**
18. **Téléphone Président**
19. **Membres Conseil Syndical**
20. **Prochaine Date AG**
21. **Commentaire**
22. **Fichier URL**
23. **Fichier Nom**
24. **Timestamp**

---

## 🔄 Mise à jour du Script Apps Script

⚠️ **IMPORTANT** : Tu dois mettre à jour le code du script Apps Script pour qu'il gère les nouveaux champs.

### Étapes :

1. Va sur https://script.google.com/
2. Ouvre ton projet "PPPT - Générateur PDF"
3. Remplace TOUT le code par le nouveau code du fichier `google-apps-script/GeneratePDF.gs`
4. Clique sur **💾 Enregistrer** (Ctrl+S)

**Le nouveau code est déjà à jour dans le fichier local**, tu n'as qu'à copier-coller !

---

## ✅ Checklist de Déploiement

- [ ] **Google Sheet :** Ajouter les 24 en-têtes de colonnes (voir liste ci-dessus)
- [ ] **Apps Script :** Mettre à jour le code avec le nouveau fichier `GeneratePDF.gs`
- [ ] **Template PDF :** Ajouter les champs dynamiques souhaités dans ton template Google Docs
- [ ] **Test :** Soumettre un devis test pour vérifier que tout fonctionne

---

## 📝 Exemple de Template Google Docs

Voici un exemple de structure pour ton template :

```
                        DEVIS {{quoteId}}
                        Date : {{date}}

CLIENT
Nom : {{userName}}
Email : {{userEmail}}
Téléphone : {{userPhone}}

COPROPRIÉTÉ
Adresse : {{propertyAddress}}
Code Postal : {{postalCode}} ({{department}})

DÉTAILS DU DEVIS
Nombre de lots : {{lots}}
Nombre d'immeubles : {{buildings}}
DPE Collectif : {{includeDPE}}
Date dernier DPE : {{dpeDate}}

PRIX TOTAL : {{price}}

PRÉSIDENT DU CONSEIL SYNDICAL
Nom : {{presidentName}}
Email : {{presidentEmail}}
Téléphone : {{presidentPhone}}

MEMBRES DU CONSEIL SYNDICAL
{{councilMembers}}

INFORMATIONS COMPLÉMENTAIRES
Prochaine AG : {{agDate}}
Commentaire : {{comment}}
```

---

## 🎨 Conseils de Formatage

- Les champs vides afficheront une chaîne vide (rien)
- Pour `{{councilMembers}}`, chaque membre sera sur une ligne séparée
- Tu peux ajouter du texte autour des champs : "Prix TTC : {{price}}"
- Utilise le formatage Google Docs (gras, couleurs, etc.) normalement
- Les champs seront remplacés en conservant le formatage environnant

---

## ⚡ Rappel : Modifications Futures

**Pour modifier le template plus tard :**
1. Édite simplement le Google Docs visuellement
2. **Aucune action manuelle supplémentaire requise**
3. Les changements sont automatiques

**Pour ajouter un nouveau champ dynamique :**
1. Ajouter le champ dans `GeneratePDF.gs`
2. Mettre à jour le script Apps Script (via l'éditeur en ligne)
3. Ajouter le champ dans le template Google Docs
