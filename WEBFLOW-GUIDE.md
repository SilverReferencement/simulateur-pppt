# Guide d'intégration Webflow avec Auto-Update

Ce guide explique comment intégrer le simulateur PPPT dans Webflow avec **mise à jour automatique** depuis GitHub.

## 🎯 Principe

Au lieu de copier tout le code dans Webflow, vous utilisez une **iframe** qui pointe vers **GitHub Pages**.

**Avantage :** Chaque fois que vous faites `update.bat`, le simulateur se met à jour automatiquement dans Webflow !

---

## 🚀 Étape 1 : Activer GitHub Pages (Une seule fois)

1. Allez sur : https://github.com/SilverReferencement/simulateur-pppt/settings/pages
2. Dans **"Branch"**, sélectionnez :
   - Branch : **main**
   - Folder : **/ (root)**
3. Cliquez sur **"Save"**
4. Attendez 2-3 minutes (GitHub construit le site)

**Vérifiez que ça fonctionne :**
Ouvrez https://silverreferencement.github.io/simulateur-pppt/ dans votre navigateur

---

## 📄 Étape 2 : Intégrer dans Webflow

### **Dans Webflow :**

1. **Ouvrez** votre page dans l'éditeur Webflow
2. **Ajoutez** un élément **"Embed"** (Add Elements > Components > Embed)
3. **Copiez** le contenu du fichier `webflow-iframe.html`
4. **Collez-le** dans l'élément Embed
5. **Sauvegardez** et **Publiez**

### **Code à copier (webflow-iframe.html) :**

```html
<!-- Voir le fichier webflow-iframe.html -->
```

---

## ✅ Workflow avec Auto-Update

### **Quand vous modifiez le simulateur :**

1. **Modifiez** vos fichiers (script.js, index.html, styles.css)
2. **Exécutez** `update.bat`
3. **Attendez 1-2 minutes** (GitHub Pages se met à jour)
4. **Rafraîchissez** votre page Webflow → Simulateur mis à jour !

### **Schéma du flux :**

```
Modification locale
      ↓
  update.bat
      ↓
Push vers GitHub
      ↓
GitHub Pages (1-2 min)
      ↓
Webflow (iframe) ← Auto-update !
```

---

## 🔧 Avantages de cette méthode

✅ **Auto-update** : Pas besoin de modifier Webflow à chaque version
✅ **Maintenance facile** : Un seul endroit à mettre à jour (GitHub)
✅ **Design préservé** : Le simulateur garde son design complet
✅ **Performance** : GitHub Pages est rapide et fiable
✅ **Versionning** : Historique complet sur GitHub

---

## 🎨 Personnalisation de l'iframe

### **Hauteur de l'iframe :**

Dans `webflow-iframe.html`, ligne 14, modifiez :
```css
padding-bottom: 120%; /* Ajustez selon vos besoins */
```

### **Largeur maximale :**

Dans `webflow-iframe.html`, ligne 6, modifiez :
```css
max-width: 1200px; /* Ajustez selon votre design */
```

---

## ❓ Dépannage

### **Le simulateur ne s'affiche pas :**
- Vérifiez que GitHub Pages est activé
- Testez l'URL : https://silverreferencement.github.io/simulateur-pppt/
- Attendez 2-3 minutes après l'activation

### **Les modifications ne s'affichent pas :**
- Attendez 1-2 minutes après le push
- Videz le cache de votre navigateur (Ctrl+F5)
- Vérifiez que `update.bat` a bien pushé sur GitHub

### **L'iframe est trop haute/basse :**
- Ajustez `padding-bottom` dans le CSS de l'iframe
- Utilisez les outils de développement du navigateur pour tester

---

## 📞 Support

Pour toute question, consultez :
- **Repository** : https://github.com/SilverReferencement/simulateur-pppt
- **GitHub Pages** : https://silverreferencement.github.io/simulateur-pppt/
- **Documentation** : README.md
