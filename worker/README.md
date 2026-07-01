# 🔐 Proxy sécurisé (Cloudflare Worker)

Ce Worker sert d'intermédiaire entre l'app et JSONBin. Il permet de :

- **cacher la clé JSONBin** (elle reste côté serveur, jamais dans le navigateur) ;
- **protéger les données par un code PIN**.

L'app publique ne contient donc plus aucun secret : juste l'URL du Worker.

---

## Déploiement pas à pas

### 1. Créer un compte Cloudflare
Gratuit : <https://dash.cloudflare.com/sign-up>

### 2. Créer le Worker
1. Dans le tableau de bord Cloudflare : **Workers & Pages** → **Create** → **Create Worker**.
2. Donne-lui un nom, par ex. `carnet-ella`.
3. Clique **Deploy** (peu importe le code par défaut), puis **Edit code**.
4. Colle le contenu de [`worker.js`](./worker.js) à la place du code, puis **Deploy**.

Ton Worker a maintenant une URL du type :
`https://carnet-ella.TON-SOUS-DOMAINE.workers.dev`

### 3. Configurer les secrets et variables
Dans le Worker : **Settings** → **Variables and Secrets**. Ajoute :

| Nom | Type | Valeur |
|---|---|---|
| `JSONBIN_KEY` | Secret | ta **nouvelle** clé JSONBin (X-Access-Key) |
| `APP_PIN` | Secret | le code PIN de ton choix (ex. `4821`) |
| `BIN_ID` | Variable | l'identifiant de ton bin JSONBin |
| `ALLOW_ORIGIN` | Variable | *(optionnel)* l'origine de ton site, ex. `https://audreyoakwood.github.io` |

> ⚠️ **Change d'abord ta clé JSONBin** (l'ancienne a été exposée publiquement). Génère-en une nouvelle et mets-la dans `JSONBIN_KEY`.

Après ajout des secrets, redéploie si nécessaire.

### 4. Brancher l'app
Dans **`config.js`** (à la racine du projet), renseigne l'URL du Worker :

```js
var WORKER_URL = 'https://carnet-ella.TON-SOUS-DOMAINE.workers.dev';
```

C'est tout. L'app demandera le code PIN au démarrage, et toutes les données transiteront par le Worker.

---

## Notes de sécurité

- Le PIN protège l'accès aux données. Choisis-en un pas trop court (idéalement 6 chiffres ou plus).
- Le PIN est vérifié **côté serveur** (par le Worker) : impossible de le contourner depuis le navigateur.
- `ALLOW_ORIGIN` restreint les sites autorisés à appeler le Worker (recommandé une fois l'URL de ton site connue).
- Pour changer le PIN plus tard : modifie le secret `APP_PIN` dans Cloudflare (rien à toucher dans l'app).
