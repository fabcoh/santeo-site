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
| `build.py` | assemble la page : moteur, tarifs, garanties, logos, masque, mascotte, trajet de la lumière |
| `logos/logos.json` | les 7 logos des assureurs partenaires, déjà détourés |
| `logos/santeo.b64` | le logo Santéo |
| `logos/santeo-masque.b64` | masque des lettres SANTÉO : la lumière passe derrière elles |
| `logos/comete-trajet.txt` | trajet de la lumière sur la courbe du logo |
| `logos/mascotte.b64` | la mascotte, fond retiré |
| `images-source/` | images reçues de Fabrice (logo Santéo, logo Alptis, mascotte) |
| `outils/` | scripts qui refont `santeo-masque.b64`, `mascotte.b64` et `comete-trajet.txt` à partir des sources |
| `tests/test-comparateur.js` | essai automatique (téléphone et PC) : étoiles, fenêtre « Précisez », cases, choix d'une offre |

## Vérifier

```bash
node maquette/tests/test-comparateur.js maquette
```

Le test doit finir par `ERREURS: aucune`. Il demande Playwright et Chromium.

## À savoir

- Dans la maquette seulement, le nom de la gamme et de la formule s'affiche sous chaque option (« Maquette : … »).
  Sur le vrai site, les assureurs seront remplacés par des codes.
- APRIL et API Santé (VERALTI) n'y sont pas encore : leurs tarifs passent par les relais de la conversation
  « comparateur claude » (demande dans `docs/carnet/ECHANGES.md`).
