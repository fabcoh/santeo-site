# Maquette du comparateur Santéo

Source de la maquette validée par Fabrice, publiée pour lui en page privée sur claude.ai.
La page finale `comparateur-santeo.html` n'est pas versionnée : on la reconstruit.

## Construire la page

Il faut une copie du dépôt public du comparateur de Claude, `fabcoh/santeo-tarifs` (lecture seule) :
le moteur `src/moteur.js` et les données `src/tarifs_all.json`, `src/garanties.json` y sont lus.

```bash
python3 -I maquette/build.py maquette <chemin-de-la-copie-de-santeo-tarifs>
```

Résultat : `maquette/comparateur-santeo.html` (une seule page, tout compris).

Version **site de test** (page complète pour téléphone et PC, cachée à Google, bandeau « version de test »,
sans les éléments réservés à la maquette) :

```bash
python3 -I maquette/build.py maquette <chemin-de-la-copie-de-santeo-tarifs> --site _site
```

GitHub la reconstruit et la publie tout seul (`.github/workflows/site-de-test.yml`) à chaque fusion sur `main`
et chaque jour, pour reprendre les tarifs à jour du comparateur.

## Contenu

| Élément | Rôle |
|---|---|
| `template.html` | la page (mise en page, textes, comportement) avec des repères `__…__` remplacés à la construction |
| `build.py` | assemble la page : moteur, tarifs, garanties, logos, masque, mascotte, trajet de la lumière ; en mode site, ajoute l'entête pour Google et WhatsApp, `mentions-legales/`, `404.html`, `robots.txt`, `sitemap.xml` |
| `guide/` | articles du « Guide de la mutuelle » : `<slug>.html` (contenu, balises simples) et `<slug>.json` (titre et description pour Google, `lien` : texte court du lien (n'est plus affiché sur l'accueil depuis le 12/11/2026, à la demande de Fabrice), questions fréquentes, ordre, date de mise à jour) ; la construction en fait `/guide/` et `/guide/<slug>/`. Schéma des dents : le repère `<div class="schema-dents"></div>` d'un article est remplacé par un dessin tiré de `schema_dents` de son JSON (`groupes`, et pour chaque matériau le panier de chaque groupe de dents) |
| `article.html` | modèle des pages du guide (même charte, PC et téléphone ; le bandeau cookies est repris du comparateur) |
| `chapitres.json` | chapitres du Guide de la mutuelle, dans l'ordre d'affichage (id, titre, présentation) ; chaque article indique le sien dans le champ `chapitre` de son JSON |
| `renvois.json` | anciennes adresses de l'ancien site connues de Google (`/actu/…`, `/question/…`, `/devis/…`) et la page du nouveau site vers laquelle chacune renvoie ; la construction écrit une page de renvoi immédiat à chaque ancienne adresse |
| `reglages-site.json` | adresse du CRM qui reçoit les demandes (`envoi_crm`) et repli éventuel (`repli` : vide ou `whatsapp`) ; tchat (`tchat`, `tchat_crm`) ; identifiant des statistiques Google (`google_mesure`, « G-… », public) : vide = ni bandeau cookies ni Google ; relais de tarification API Santé (`apicil`) : vide = pas d'API Santé |
| `images-site/` | image d'aperçu de partage (`partage.jpg`, 1200 × 630) et icônes de l'onglet, refaites par `outils/partage.py` |
| `logos/logos.json` | les 7 logos des assureurs partenaires, déjà détourés |
| `logos/santeo.b64` | le logo Santéo |
| `logos/santeo-masque.b64` | masque des lettres SANTÉO : la lumière passe derrière elles |
| `logos/comete-trajet.txt` | trajet de la lumière sur la courbe du logo |
| `logos/mascotte.json` | la mascotte, fond retiré, découpée en quatre calques (corps, aile gauche, aile droite, étoile) avec les points autour desquels les ailes tournent |
| `images-source/` | images reçues de Fabrice (logo Santéo, logo Alptis, mascotte) |
| `outils/` | scripts qui refont `santeo-masque.b64`, `mascotte.json` et `comete-trajet.txt` à partir des sources |
| `tests/test-site.js` | essai du site publié (en ligne et test) : entête, fichiers, envoi au CRM simulé, erreur, repli WhatsApp, anciennes adresses |
| `tests/test-comparateur.js` | essai automatique (téléphone et PC) : mascotte, étoiles, fenêtre « Précisez », cases, choix d'une offre |

## Vérifier

```bash
node maquette/tests/test-comparateur.js "$PWD/maquette"
```

```bash
node maquette/tests/test-site.js "$PWD/maquette" <copie de santeo-tarifs>
```

Chaque test doit finir par `ERREURS: aucune`. Il demande Playwright et Chromium.

## Mettre en ligne

- Site de test : `python3 -I maquette/build.py maquette <copie de santeo-tarifs> --site <dossier>` (caché à Google, bandeau).
- www.santeo.net : la même commande avec `--en-ligne` (visible par Google, sans bandeau). La publication automatique
  passe en `--en-ligne` le jour du changement d'adresse, une fois le certificat de www.santeo.net actif.
- Lien à envoyer aux clients WhatsApp : `https://www.santeo.net/?src=whatsapp` : leur demande arrive avec la provenance
  « Site Santéo – WhatsApp ». `?src=<nom>` ou `?utm_source=<nom>` marquent de même une autre source.
- Tant que `envoi_crm` est vide, le site n'envoie rien : avec `repli: "whatsapp"`, la demande s'ouvre dans WhatsApp,
  prête à envoyer à la ligne Santéo.

## À savoir

- La mascotte bouge : elle flotte, bat des ailes et son étoile scintille. Les vitesses et l'ampleur se règlent dans
  `template.html` (règles `m-vol`, `m-aile-g`, `m-aile-d`, `m-etoile`). Elle reste immobile chez les personnes qui ont
  demandé moins d'animations dans les réglages de leur appareil.
- Pour refaire les calques après un changement d'image : `python3 -I maquette/outils/mascotte.py maquette`. Le script
  écrit aussi des images de contrôle `maquette/mascotte-*.png` (non versionnées) : calques empilés sur fond clair et
  sombre, et chaque calque seul. Si l'image change, les lignes de coupe des ailes (`COUPE_G`, `COUPE_D`) sont à reprendre.

- Dans la maquette seulement, le nom de la gamme et de la formule s'affiche sous chaque option (« Maquette : … »).
  Sur le vrai site, les assureurs seront remplacés par des codes.
- APRIL et API Santé (VERALTI) n'y sont pas encore : leurs tarifs passent par les relais de la conversation
  « comparateur claude » (demande dans `docs/carnet/ECHANGES.md`).
