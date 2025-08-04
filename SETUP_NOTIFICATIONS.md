# 🚀 Guide de configuration des notifications push

## Étape 1 : Configuration des variables d'environnement

1. **Ouvrez le fichier `.env.local`** à la racine de votre projet
2. **Remplacez les valeurs par vos vraies clés Supabase** :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anonyme_supabase
```

Pour trouver ces clés :

- Allez sur [supabase.com](https://supabase.com)
- Ouvrez votre projet
- Allez dans Settings > API
- Copiez l'URL et la clé anonyme

## Étape 2 : Vérification de la base de données

1. **Exécutez le script de vérification** :

```bash
node check-database.js
```

2. **Si la table `push_subscriptions` n'existe pas**, exécutez ce SQL dans votre dashboard Supabase :

```sql
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    subscription JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
```

## Étape 3 : Test de l'application

1. **Démarrez l'application** :

```bash
npm run dev
```

2. **Ouvrez l'application** dans votre navigateur (http://localhost:3000)

3. **Connectez-vous** avec un utilisateur (victor ou alyssia)

4. **Activez les notifications** :
   - Cliquez sur le bouton "🔔 Activer" dans le composant PushNotificationManager
   - Accordez les permissions de notifications dans votre navigateur

## Étape 4 : Test des notifications

1. **Testez l'envoi de notification** :

```bash
node test-notifications.js
```

2. **Ou testez manuellement** :
   - Allez dans l'application
   - Utilisez la fonction "Notifications globales" en bas de page
   - Envoyez une notification de test

## Étape 5 : Vérification dans le navigateur

1. **Ouvrez les DevTools** (F12)
2. **Allez dans l'onglet "Application"**
3. **Vérifiez** :
   - Service Workers > Votre SW est actif
   - Storage > IndexedDB > Abonnements push
   - Permissions > Notifications accordées

## Dépannage

### ❌ "Variables d'environnement manquantes"

- Vérifiez que le fichier `.env.local` existe
- Vérifiez que les clés Supabase sont correctes

### ❌ "Table push_subscriptions n'existe pas"

- Exécutez le SQL fourni dans votre dashboard Supabase

### ❌ "Permission refusée"

- Vérifiez les paramètres de notifications de votre navigateur
- Réinitialisez les permissions si nécessaire

### ❌ "Service Worker non enregistré"

- Vérifiez que le fichier `public/sw.js` existe
- Vérifiez les logs dans la console du navigateur

### ❌ "Notifications non reçues"

- Vérifiez que l'utilisateur est connecté
- Vérifiez que les abonnements sont sauvegardés en base
- Testez avec le script `test-notifications.js`

## Structure finale attendue

```
dodo-ensemble-supabase/
├── .env.local                    # Variables d'environnement
├── public/
│   ├── sw.js                     # Service Worker
│   └── manifest.json             # Manifest PWA
├── components/
│   └── PushNotificationManager.js # Gestionnaire de notifications
├── pages/api/
│   ├── save-subscription.js      # API sauvegarde abonnement
│   └── send-push.js              # API envoi notification
├── utils/
│   └── vapid.js                  # Configuration VAPID
└── test-notifications.js         # Script de test
```

## Prochaines étapes

Une fois les notifications fonctionnelles :

1. **Personnalisez les notifications** selon vos besoins
2. **Ajoutez des notifications automatiques** (événements, rappels)
3. **Optimisez les performances**
4. **Testez sur différents navigateurs et appareils**

## Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs dans la console du navigateur
2. Vérifiez les logs du serveur Next.js
3. Utilisez le script `test-notifications.js` pour diagnostiquer
4. Consultez le guide `NOTIFICATIONS_TROUBLESHOOTING.md`
