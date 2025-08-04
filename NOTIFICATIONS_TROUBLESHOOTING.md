# 🔔 Guide de dépannage des notifications push

## Problèmes identifiés et solutions

### 1. **Variables d'environnement manquantes**

**Problème :** Les clés Supabase ne sont pas configurées.

**Solution :**

```bash
# Créez un fichier .env.local à la racine du projet
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anonyme_supabase
```

### 2. **Clés VAPID invalides**

**Problème :** Les clés VAPID actuelles sont des exemples et ne fonctionnent pas.

**Solution :**

1. Générez de nouvelles clés VAPID :

   ```bash
   npm install -g web-push
   web-push generate-vapid-keys
   ```

2. Mettez à jour `utils/vapid.js` avec vos vraies clés :
   ```javascript
   export const VAPID_PUBLIC_KEY = "votre_cle_publique";
   export const VAPID_PRIVATE_KEY = "votre_cle_privee";
   ```

### 3. **Table manquante dans la base de données**

**Problème :** La table `push_subscriptions` n'existe pas.

**Solution :** Exécutez ce SQL dans votre base Supabase :

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

### 4. **Service Worker non enregistré**

**Problème :** Le Service Worker n'est pas correctement enregistré.

**Solution :** Vérifiez que :

- Le fichier `public/sw.js` existe
- L'enregistrement se fait dans `_app.js`
- Le Service Worker est accessible via `/sw.js`

### 5. **Permissions de notifications non accordées**

**Problème :** L'utilisateur n'a pas accordé les permissions.

**Solution :**

1. Vérifiez que le navigateur supporte les notifications
2. Demandez explicitement les permissions
3. Gérer le cas où l'utilisateur refuse

### 6. **Utilisateur non connecté**

**Problème :** L'ID utilisateur n'est pas disponible.

**Solution :** Assurez-vous que :

- L'utilisateur est connecté
- `localStorage.getItem("userId")` retourne une valeur valide
- L'ID utilisateur est sauvegardé lors de la connexion

## Tests à effectuer

### 1. **Test de base**

```bash
# Démarrer l'application
npm run dev

# Dans un autre terminal, tester les notifications
node test-notifications.js
```

### 2. **Test dans le navigateur**

1. Ouvrez les DevTools (F12)
2. Allez dans l'onglet "Application" > "Service Workers"
3. Vérifiez que le Service Worker est actif
4. Allez dans "Application" > "Storage" > "IndexedDB"
5. Vérifiez les abonnements push

### 3. **Test des APIs**

```bash
# Test de l'API save-subscription
curl -X POST http://localhost:3000/api/save-subscription \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","subscription":{"endpoint":"test"}}'

# Test de l'API send-push
curl -X POST http://localhost:3000/api/send-push \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","title":"Test","body":"Test"}'
```

## Debugging

### 1. **Logs du Service Worker**

Dans les DevTools > Console, filtrez par "Service Worker" pour voir les logs.

### 2. **Logs de l'application**

Vérifiez la console du navigateur pour les erreurs JavaScript.

### 3. **Logs des APIs**

Les APIs ajoutent maintenant des logs détaillés. Vérifiez les logs du serveur.

## Checklist de vérification

- [ ] Variables d'environnement configurées
- [ ] Clés VAPID valides
- [ ] Table `push_subscriptions` créée
- [ ] Service Worker enregistré
- [ ] Permissions accordées
- [ ] Utilisateur connecté
- [ ] APIs fonctionnelles
- [ ] Notifications reçues

## Prochaines étapes

Une fois les notifications de base fonctionnelles :

1. **Générer de vraies clés VAPID**
2. **Tester sur différents navigateurs**
3. **Ajouter des notifications automatiques**
4. **Gérer les cas d'erreur avancés**
5. **Optimiser les performances**
