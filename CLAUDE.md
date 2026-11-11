# Site Santéo — consignes pour Claude

Ce dépôt contient le futur site www.santeo.net : un comparateur de complémentaire santé propre à Santéo
(CAPI FINANCE, courtier). Les tarifs viennent du moteur du comparateur de Claude (`fabcoh/santeo-tarifs`),
et les demandes de devis arrivent directement dans le CRM Santéo. Le comparateur OggoData n'est plus utilisé.

Avant tout travail, lire le carnet `docs/carnet/ECHANGES.md` : décisions prises, points ouverts,
demandes aux autres conversations.

## Les règles de Fabrice (Vos mots, reprises de sa passation)

1. **Une seule question par message**, en français simple, sans jargon. Jamais une liste de choix ou
   de sujets en attente.
2. **Un lot à la fois** : tu livres, tu t'arrêtes, je valide, puis le lot suivant.
3. **Tout ce qui se voit sur PC se fait aussi sur téléphone**, dans le même lot.
4. **Aucun secret** (mot de passe, clé, codes OVH, jetons) dans un message, un fichier ou GitHub. Si un
   accès est nécessaire, il passe par un **formulaire sécurisé de l'environnement**, jamais par la
   conversation. Ne me demande jamais de coller un code.
5. **Vérifier avant d'affirmer** : « fait », « en ligne », « réparé » seulement quand tu l'as constaté.
   Une cause non prouvée s'écrit « ma meilleure explication, non vérifiée ».
6. **Un texte proposé** est étiqueté « **Mon idée** » (écrit par toi) ou « **Vos mots** » (repris de
   moi, cité exactement). Jamais « inspiré de » pour une phrase inventée.
7. **Aucun nom, numéro de téléphone ni adresse de client** dans le dépôt, les tests, les captures ou
   GitHub. Prénom inventé si besoin.
8. **Tu travailles sur une branche**, jamais directement sur `main` ; Pull Request, vérifications, puis
   fusion.

Seule exception à la règle 8 : le tout premier fichier (`README.md`), envoyé directement sur `main`
le 08/11/2026 avec l'accord de Fabrice, parce qu'un dépôt vide ne peut pas recevoir de demande de fusion.

## Ce dépôt est public

Tout le monde peut le lire, concurrents compris. Donc, en plus des règles 4 et 7 :

- pas de chiffres de visites, de recherches Google ni de positions (ils restent dans la page d'audit privée) ;
- pas d'adresse de serveur, pas de chemin d'administration, pas d'adresse e-mail personnelle ;
- pas de copie de l'ancien code `fabcoh/santeo-net` (privé, lecture seule, il doit le rester).

## Les autres conversations

- Fabrice ne parle qu'à la **conversation pilote** (« CRM WhatsApp — relais »). S'il parle directement
  à cette conversation, on lui répond normalement, une question à la fois.
- **Cette conversation n'écrit jamais à Manus**, même avec l'outil ou la clé. Une demande pour Manus
  s'écrit dans le carnet, au format :

  ```
  ### JJ/MM/AAAA — de Claude site à la conversation pilote — demande pour Manus
  Statut : À ENVOYER À MANUS
  Quoi : <ce que Manus doit faire, complet, sans rien à deviner>
  Pourquoi : <une phrase>
  Vérification attendue : <comment on saura que c'est fait>
  ```

- Une demande à une autre conversation : une entrée **en haut** du carnet,
  `### JJ/MM/AAAA — de Claude site à <conversation> — <sujet>`, statut « À TRAITER ». Elle n'est
  visible qu'une fois fusionnée sur `main`.
- On ne modifie **jamais** le dépôt d'une autre conversation (`WhatsApp_Solution`, `santeo-tarifs`,
  `santeo-net`, `crm-santeo`, `santeo-crm-coffre`) : lecture seule.
- Rien ne dépend de la mémoire d'une conversation : ce qui n'est pas écrit dans le carnet est perdu.

## Le jour du changement d'adresse dans OVH (ne pas casser les mails)

Les adresses e-mail @santeo.net dépendent du même nom de domaine.

1. Avant toute modification : relever **toutes** les lignes de la zone DNS de santeo.net, les montrer
   à Fabrice et les garder pour pouvoir revenir en arrière.
2. Modifier **uniquement** la ligne du site (`www`, et éventuellement `santeo.net` sans www).
3. **Jamais** les lignes des mails (MX, SPF, DKIM, DMARC) ni les sous-domaines du CRM et de GestCom.
4. Guider Fabrice ligne par ligne, une étape par message : c'est lui qui clique.

## Repères techniques

- Maquette actuelle du comparateur (page privée de Fabrice) : https://claude.ai/artifact/QQfDwqPtbxZnAetF7EQcsW
- Source de la maquette : dossier `maquette/` (mode d'emploi dans `maquette/README.md`). Toute modification se fait
  dans `maquette/template.html`, puis la page est reconstruite et vérifiée (PC et téléphone) avant d'être montrée.
- Moteur et tarifs : `fabcoh/santeo-tarifs`, fichiers `src/moteur.js`, `src/tarifs_all.json`,
  `src/garanties.json` (lecture seule ; conversation « comparateur claude »).
- Hébergement prévu : GitHub Pages, à l'adresse santeo.net.
- Site en ligne : https://www.santeo.net, publié par `.github/workflows/site-de-test.yml` (construction `--site
  --en-ligne` : visible par Google, sans bandeau) depuis le 11/11/2026. Seule la ligne DNS `www` (CNAME vers
  `fabcoh.github.io.`) a été changée chez OVH ; `santeo.net` sans www reste sur l'ancien serveur tant que la question du
  SPF (« a ») n'est pas réglée. Adresses du CRM (demandes, tchat) : `maquette/reglages-site.json`.
- Ne jamais désactiver la vérification des certificats (TLS) pour contourner un blocage.
