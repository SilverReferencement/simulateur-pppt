# 🔄 Instructions pour Mettre à Jour le Code Webflow

## 🎯 Objectif

Permettre le chargement automatique d'un devis avec tous les champs pré-remplis lorsqu'un client clique sur le lien dans l'email.

## 📋 Ce qui a été modifié

Le code de l'iframe Webflow a été mis à jour pour :
1. **Transmettre automatiquement** le paramètre `quoteId` de l'URL Webflow vers l'iframe
2. **Pointer vers Vercel** : `https://simulateur-pppt.vercel.app/`
3. **Gérer tous les paramètres URL** automatiquement

## 🔧 Étapes de Mise à Jour

### 1. Se connecter à Webflow

Aller sur : https://atlas-pppt.webflow.io

### 2. Accéder à la page du simulateur

- Dans le Designer Webflow, ouvrir la page `/simulateur-pppt`
- Trouver l'élément "Embed" qui contient le code de l'iframe

### 3. Remplacer le code

1. **Ouvrir** l'élément Embed qui contient l'iframe
2. **Sélectionner tout** le code existant (Ctrl+A)
3. **Copier** le nouveau code depuis le fichier `webflow-iframe.html`
4. **Coller** dans l'élément Embed Webflow
5. **Enregistrer** les modifications

### 4. Publier le site

Cliquer sur **"Publish"** en haut à droite pour déployer les changements.

## ✨ Comment ça fonctionne

### Flux complet

```
1. Client reçoit email avec lien :
   https://atlas-pppt.webflow.io/simulateur-pppt?quoteId=DEVIS-1691

2. Webflow charge la page avec le paramètre quoteId

3. Le script JavaScript détecte le paramètre et l'ajoute à l'iframe :
   https://simulateur-pppt.vercel.app/?quoteId=DEVIS-1691

4. L'iframe charge le simulateur Vercel avec le paramètre

5. Le simulateur appelle l'API pour récupérer les données :
   GET /api/get-quote?id=DEVIS-1691

6. Les données sont chargées depuis Google Sheets

7. Le formulaire est automatiquement pré-rempli !
```

### Code JavaScript Clé

Le nouveau code inclut ces fonctions importantes :

```javascript
// Extraire les paramètres de l'URL Webflow
function getUrlParameters() {
    const params = new URLSearchParams(window.location.search);
    return params.toString();
}

// Construire l'URL de l'iframe avec les paramètres
function buildIframeUrl() {
    const baseUrl = 'https://simulateur-pppt.vercel.app/';
    const params = getUrlParameters();

    if (params) {
        return baseUrl + '?' + params;
    }
    return baseUrl;
}

// Définir l'URL au chargement
document.addEventListener('DOMContentLoaded', function() {
    const iframe = document.getElementById('pppt-iframe');
    if (iframe) {
        iframe.src = buildIframeUrl();
    }
});
```

## 🧪 Test

### Après avoir publié sur Webflow

1. **Ouvrir l'URL de test** :
   ```
   https://atlas-pppt.webflow.io/simulateur-pppt?quoteId=DEVIS-1691
   ```

2. **Vérifier dans la console (F12)** :
   - Chercher le log : `📍 Iframe URL: https://simulateur-pppt.vercel.app/?quoteId=DEVIS-1691`
   - Vérifier les logs : `🔍 Loading quote: DEVIS-1691`
   - Confirmer : `✅ Quote loaded: {...}`

3. **Vérifier visuellement** :
   - Le simulateur doit afficher le formulaire email ouvert
   - Tous les champs doivent être pré-remplis
   - Le prix doit être calculé automatiquement

### Test depuis l'email

1. Recevoir un email de devis
2. Cliquer sur **"Valider le devis et payer la prestation"**
3. Être redirigé vers Webflow
4. Voir tous les champs pré-remplis automatiquement

## ⚠️ Points d'Attention

### Sécurité CORS

L'iframe utilise `postMessage` pour communiquer avec Webflow (pour la hauteur).
Le code vérifie l'origine : `event.origin !== 'https://simulateur-pppt.vercel.app'`

### Cache Webflow

Si les changements ne sont pas visibles immédiatement :
1. Vider le cache du navigateur (Ctrl+Shift+R)
2. Tester en navigation privée
3. Attendre 5-10 minutes pour la propagation CDN Webflow

### Debugging

Si les champs ne se pré-remplissent pas :

1. **Ouvrir la console** (F12)
2. **Vérifier l'URL de l'iframe** :
   ```javascript
   document.getElementById('pppt-iframe').src
   ```
   Doit contenir `?quoteId=DEVIS-XXX`

3. **Vérifier les erreurs API** :
   - Erreur 404 : Le devis n'existe pas dans Google Sheets
   - Erreur 500 : Problème de credentials Google
   - Erreur CORS : Problème de configuration Vercel

## 📝 Checklist de Déploiement

- [ ] Code `webflow-iframe.html` copié dans Webflow
- [ ] Page `/simulateur-pppt` publiée sur Webflow
- [ ] Test avec URL : `https://atlas-pppt.webflow.io/simulateur-pppt?quoteId=DEVIS-1691`
- [ ] Vérifier dans console : iframe URL contient le quoteId
- [ ] Vérifier que les champs sont pré-remplis
- [ ] Test depuis un vrai email de devis
- [ ] Workflow complet validé ✅

## 🔄 Fichiers Concernés

- `webflow-iframe.html` - Code à copier dans Webflow
- `api/save-quote.js` - Email avec lien vers Webflow
- `api/get-quote.js` - API pour récupérer le devis
- `script.js` - Frontend qui charge et pré-remplit

## 💡 Avantages de cette Solution

✅ **Automatique** : Aucune intervention manuelle requise
✅ **Transparent** : Le client ne voit qu'une URL propre Webflow
✅ **Flexible** : Fonctionne avec n'importe quel paramètre URL
✅ **Sécurisé** : Vérification de l'origine des messages
✅ **Maintenable** : Le simulateur Vercel se met à jour automatiquement

## 🆘 Support

En cas de problème :
1. Vérifier les logs dans la console JavaScript
2. Vérifier que Vercel a bien redéployé (`https://simulateur-pppt.vercel.app/`)
3. Tester l'API directement : `https://simulateur-pppt.vercel.app/api/get-quote?id=DEVIS-1691`
4. Vérifier que le devis existe dans Google Sheets

---

**Dernière mise à jour** : Aujourd'hui
**Statut** : Prêt pour déploiement ✅
