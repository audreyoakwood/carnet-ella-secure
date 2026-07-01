# 🌸 Mon carnet

Une petite application web (PWA) de **suivi du cycle menstruel**, pensée pour être simple, rassurante et jolie. On touche un jour du calendrier, on renseigne l'intensité du flux, et c'est tout.

---

## ✨ Fonctionnalités

- **Calendrier mensuel** — navigation mois par mois + bouton « Aujourd'hui ».
- **Saisie du flux** en un geste : Léger / Moyen / Abondant (1, 2 ou 3 gouttes).
- **Récapitulatif** du mois en cours (nombre de jours notés).
- **Accès protégé par code PIN** (vérifié côté serveur).
- **Synchronisation cloud** via [JSONBin.io](https://jsonbin.io) derrière un **proxy sécurisé** (Cloudflare Worker), avec repli automatique sur le stockage local (`localStorage`) si le réseau est indisponible.
- **Indicateur de synchronisation** discret (Synchro / Synchro… / Hors ligne).
- **Bloc d'infos repliable** (ouvrable/fermable via le bouton « i »).
- **Export** des données au format JSON.
- **Design « fluid »** : dégradés, effet verre dépoli (glassmorphism), animations douces.
- **Installable** sur l'écran d'accueil (iOS et Android) grâce au manifest PWA et à une icône maskable.
- **Accessibilité** : contrastes de texte conformes WCAG AA sur les éléments essentiels.

---

## 🗂️ Structure du projet

```
carnet-ella/
├── index.html      # Structure de la page
├── style.css       # Tout le style (design fluide + fallbacks)
├── app.js          # Logique : calendrier, saisie, synchronisation, export
├── config.js       # Configuration : URL du proxy (aucun secret ici)
├── worker/         # Proxy sécurisé Cloudflare (cache la clé + code PIN)
│   ├── worker.js
│   └── README.md   # Guide de déploiement du proxy
├── manifest.json   # Manifest PWA (nom, couleurs, icônes)
├── icon.png        # Fleur source (192×192)
├── icon-192.png    # Icône PWA 192×192
└── icon-512.png    # Icône PWA 512×512 (dont maskable)
```

---

## 🚀 Lancer en local

L'app est 100 % front-end (aucun serveur à installer). Comme elle charge des fichiers `.js` séparés et un `manifest.json`, il faut la servir via un petit serveur HTTP local (l'ouverture directe du fichier `index.html` peut poser problème selon le navigateur) :

```bash
# Avec Python 3
python3 -m http.server 8000

# ou avec Node
npx serve .
```

Puis ouvrir <http://localhost:8000> dans le navigateur.

---

## ⚙️ Configuration & sécurité

Les données sont stockées sur JSONBin, mais l'app **n'y accède jamais directement** : tout passe par un **proxy** (Cloudflare Worker) qui :

- garde la **clé JSONBin secrète** (côté serveur, jamais dans le navigateur) ;
- exige un **code PIN** pour lire/écrire les données.

`config.js` ne contient donc **aucun secret**, juste l'URL du proxy :

```js
var WORKER_URL = 'https://carnet-ella.TON-SOUS-DOMAINE.workers.dev';
```

👉 **Mise en place du proxy** : voir le guide pas à pas dans [`worker/README.md`](./worker/README.md).

> Pourquoi ce montage ? Une app 100 % front-end ne peut pas cacher une clé : tout ce qu'elle contient est lisible dans le navigateur. Le proxy déplace le secret côté serveur, et le code PIN (vérifié par le Worker) protège l'accès aux données — indispensable pour un dépôt public.

---

## 📲 Installation en PWA

L'app peut être ajoutée à l'écran d'accueil :

- **iOS (Safari)** : bouton Partager → « Sur l'écran d'accueil ».
- **Android (Chrome)** : menu ⋮ → « Ajouter à l'écran d'accueil » / « Installer l'application ».

> L'icône est mise en cache par le système à l'installation. Après une mise à jour de l'icône, il faut **retirer puis ré-ajouter** l'app pour la voir changer. Le contenu de l'app, lui, se met à jour à la prochaine ouverture (pas de service worker qui bloque).

---

## 💾 Données & confidentialité

- Les données saisies (dates + intensité) sont enregistrées sur JSONBin **et** en local sur l'appareil.
- Aucune donnée n'est envoyée ailleurs.
- Le bouton **« exporter mes données »** (en bas de l'app) télécharge une sauvegarde JSON, utile en cas de changement d'appareil.

---

## 🛠️ Technologies

- HTML / CSS / JavaScript **vanilla** (aucune dépendance, aucun build).
- [JSONBin.io](https://jsonbin.io) pour la synchronisation.
- API Web : `fetch`, `localStorage`, manifest PWA.

---

## 🌐 Compatibilité

- Navigateurs mobiles récents (iOS Safari, Android Chrome) : rendu complet.
- Anciens Android : des **fallbacks CSS** sont prévus (fonds opaques si `backdrop-filter` non supporté, hauteur fixe des cases si `aspect-ratio` non supporté).
