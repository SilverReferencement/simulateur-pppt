# Configuration Google Cloud

## Placez votre fichier `credentials.json` ici

1. Suivez les instructions dans le `backend/README.md` pour créer votre Service Account
2. Téléchargez le fichier JSON des credentials
3. Renommez-le en `credentials.json`
4. Placez-le dans ce dossier

**IMPORTANT : Ne commitez JAMAIS ce fichier sur GitHub !**

Le fichier doit ressembler à ceci :

```json
{
  "type": "service_account",
  "project_id": "votre-projet",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "votre-service-account@votre-projet.iam.gserviceaccount.com",
  ...
}
```

## Pour la production (Vercel)

Au lieu de ce fichier, utilisez la variable d'environnement `GOOGLE_SERVICE_ACCOUNT_JSON` dans Vercel avec le contenu complet du JSON.
