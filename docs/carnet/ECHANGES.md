# Carnet de la conversation « Santeo.net site » (Claude site)

Ce carnet garde tout ce qui ne doit pas dépendre de la mémoire d'une conversation : demandes aux autres
conversations, décisions de Fabrice, points ouverts. Les entrées adressées aux autres conversations
sont **en haut**, la plus récente d'abord.

Les citations entre « » sont **les mots exacts de Fabrice** (fautes de frappe comprises) ; les noms
de conversations aussi sont entre « ». Les textes affichés dans la maquette sont en *italique*. Le reste
est résumé par Claude.

---

## Entrées pour les autres conversations

### 11/11/2026 — de Claude site à la conversation pilote — démarchage téléphonique : règles depuis le 11/08/2026
Statut : POUR INFORMATION (trouvé en écrivant l'article du guide sur le démarchage ; rien n'est demandé)
Quoi : selon Service-Public (fiche F33267, vérifiée le 12/08/2026), depuis le 11 août 2026 un professionnel ne peut plus
démarcher par téléphone sans l'accord préalable de la personne (loi du 30 juin 2025, article 13 ; décret du 23 juillet
2026). L'accord est valable 1 an au plus, sa preuve se garde 3 ans ; Bloctel n'existe plus. En assurance, en plus : accord
pour poursuivre l'appel, pas de vente au premier appel, 24 h avant la signature, appels enregistrés et gardés 2 ans ; les
plateformes ne peuvent plus appeler depuis un 06 ou un 07. Le formulaire du site recueille déjà un accord (case non cochée,
3 mois, jours et heures). Les fiches venues d'autres sources (comparateurs, partenaires) sont l'affaire du CRM : à faire
regarder par la pilote si elle le juge utile ; ce n'est pas un avis juridique.
Pourquoi : les rappels d'Antony après une demande de devis entrent dans ce cadre.
Vérification attendue : aucune.

### 11/11/2026 — de Claude site à la conversation pilote — espace admin du site (réglages dans le CRM)
Statut : ENVOYÉ par message à la session de la conversation pilote le 11/11/2026 vers 19 h 30 ; À TRAITER par elle
- Fabrice : « je veux pouvoir gérer sans toi automatqiuemeny », puis « fait un espace admin sur santéo pour gerer certaine
  fonctions » ; proposition de Claude (www.santeo.net/admin ouvre une page de réglages du CRM, protégée par la connexion du
  CRM ; première version : produits affichés, logos, tchat) ; Fabrice : « oui très bien ».
- Contrat : le site publie `/catalogue.json` (compagnies, produits avec leur code et leur réglage par défaut, produits
  APRIL compris, `tchat_defaut`). Le CRM sert `GET /api/site/reglages` (public, `Access-Control-Allow-Origin: *`,
  cache 60 s au plus) : `{"ok": true, "modifieLe", "produits": {code: booléen}, "logos": {compagnie: booléen}, "tchat":
  booléen}` ; clé absente = défaut du catalogue. Écriture depuis la page de réglages du CRM seulement (membre connecté,
  historique, migration additive, aucun champ libre). URL de la page à donner à Claude site pour le renvoi de `/admin`.
- Côté site (demande de fusion « espace-admin ») : lecture à chaque visite (délai court), puis derniers réglages connus
  (30 jours), puis défauts du catalogue ; le site n'est jamais vide. Tant que le CRM ne sert pas l'adresse, rien ne
  change. `/admin` affiche « bientôt » tant que l'URL n'est pas connue. Dans la maquette, la gestion reste locale.
- Le chemin `/admin` est public (Fabrice l'a demandé) : il ne mène qu'à la page de connexion du CRM.
- Fait par la pilote (PR #528 du CRM, publiée le 11/11) : page de réglages du CRM (connexion obligatoire) ; premiers
  réglages enregistrés le 11/11 à 19 h 49 (Paris), lus et appliqués par le site (vérifié). `/admin` renvoie vers elle
  (`admin_crm` de `maquette/reglages-site.json`).

### 11/11/2026 — de Claude site à la conversation pilote — tchat : prénom ou pseudo au début (contrat)
Statut : ENVOYÉ par message à la session de la conversation pilote le 11/11/2026 ; À TRAITER par elle (CRM WhatsApp)
- Fabrice, sur la façon de reconnaître les visiteurs du tchat (adresse IP déconseillée par Claude : partagée par
  plusieurs personnes, changeante, donnée personnelle) : « au premier envoi on peu demander à la personne d'indiquer son
  prénom ou son pseudo ? », puis « je pense qu'il faut le faire au début c'est plus logique / si un pseudo est déjà pris
  on le prend en ajoutant 2 pour antony et moi / exemple / rose / rose2 elle pense avoir son pseudo et nous a ajoute
  juste un 2 après et un 3 ..; », puis « il écrit / bonjour / envoyer pour envoyer merci d'idiquer votre prénom ou votre
  psuedo ». L'idée des noms de planètes (« mars neptune jupiter ») est remplacée par le pseudo.
- Côté site (demande de fusion « tchat-pseudo ») : le premier message reste sur le site ; le tchat répond *Pour envoyer,
  merci d'indiquer votre prénom ou votre pseudo.* ; ce que le visiteur tape ensuite (30 caractères au plus) devient son
  pseudo, puis le premier message part. Pas de question si le visiteur a déjà envoyé sa demande de comparatif (fiche
  connue) : son prénom sert de pseudo.
- Contrat : chaque `POST /api/site/tchat` porte désormais `"pseudo": "Rose"` (chaîne de 1 à 30 caractères, ou `null`
  pour un visiteur connu par sa fiche sans prénom et pour les conversations ouvertes avant ce changement). Aujourd'hui le
  CRM ignore ce champ : rien ne casse si le site est publié avant le CRM.
- À faire côté CRM WhatsApp : garder le pseudo sur la conversation à sa création ; s'il est déjà pris par une autre
  conversation du tchat (comparaison sans majuscules, accents ni espaces), lui ajouter le plus petit numéro libre, collé :
  « Rose2 », « Rose3 » ; l'afficher à Antony et à la 86 36 dans l'en-tête, en gardant le numéro pour les réponses par
  citation : « 💬 Site santeo.net #12 · Rose2 ». Le numéro ajouté n'est jamais renvoyé au site : le visiteur garde
  « Rose ». Portée de la comparaison (toutes les conversations, ou les récentes seulement) : au choix de la pilote.
- Avant, le même matin : le tchat marchait en essai mais plus en réel (« le chat ne fonctionne pas… il fonctionnait
  parfaitement quand il était en test ») ; les messages partaient vers Antony d'une autre ligne que la 86 36. Réparé par
  la pilote (fabcoh/WhatsApp_Solution, demande de fusion 523, sa réparation R-196), publié à 10 h 25 ; Fabrice : « c'est ok ».

### 10/11/2026 — de Claude site à la conversation pilote — fiche du CRM Santéo : suivi par CAPI, statut AUCUN
Statut : ENVOYÉ par message à la session de la conversation pilote le 10/11/2026 vers 9 h 15 (pour « CRM Santeo »)
- Fabrice, avec une fiche réelle du CRM Santéo en modèle (rien n'en est recopié ici) : « Attribué a capi ... tu dois
  suivre les éléments de cette fiche ».
- Correction de l'entrée ci-dessous : « attribution en aucun » désignait le statut. Fiche d'une demande du site :
  **Suivi par CAPI, statut AUCUN, provenance santeo.net**.
- Champs : Titre (Madame / Monsieur), Nom, Prénom, Date de naissance, Code postal, Tél mobile (ou Tél fixe pour un
  numéro en 01 à 05 ou 09), Courriel ; Ville déduite du code postal si le CRM sait le faire ; Adresse et Fax vides (le
  site ne les demande pas) ; la note avec l'offre, le prix, les besoins et l'accord.

### 10/11/2026 — de Claude site à la conversation pilote — décision de Fabrice : les demandes du site passent par le CRM Santéo
Statut : ENVOYÉ par message à la session de la conversation pilote le 10/11/2026 au matin ; À TRAITER par elle
- Vos mots : « faire passer le lead dans un circuit classique avec une provenance santéo.net pour qu'il suive l'envoi sur
  le CRM WhatsApp classiquement, parce que sinon on va se retrouver avec des multiples points d'entrée. […] autant la
  mettre sur le site de Santéo avec une provenance santéo.net et une attribution en aucun pour qu'elle puisse être
  travaillée, sauf si elle est déjà présente dans le CRM par Anthony ».
- Compris par Claude site : chaque demande crée une fiche dans le CRM Santéo, provenance « santeo.net », attribution
  « aucun », avec la note (offre, prix, besoins, accords) ; personne déjà présente (même téléphone ou e-mail) : la
  demande s'ajoute à sa fiche, attribution inchangée ; le CRM WhatsApp la récupère ensuite par l'import habituel. Un
  seul point d'entrée.
- Côté site : rien à changer (même adresse, mêmes champs). La porte range « Site Santéo » et « Site Santéo – WhatsApp »
  en « santeo.net ».
- Constat du 10/11 : pour l'essai de 7 h, le site a affiché « Merci, votre demande est bien arrivée », donc la porte a
  répondu « ok » ; la fiche d'essai est dans le CRM WhatsApp, pas dans le CRM Santéo où Fabrice travaille.
- Plus tard, à Fabrice : le premier message WhatsApp habituel pour la provenance « santeo.net » (ligne et texte).

### 10/11/2026 — de Claude site à la conversation pilote — essai du formulaire : la fiche n'arrive pas
Statut : ENVOYÉ par message à la session de la conversation pilote le 10/11/2026 vers 7 h 30 (Paris) ; à suivre
- Fabrice : « J'ai une test, mais ça n'arrive pas dans le CRM. Tu regardes avec Manus, voilà. Je sais pas pourquoi. »
- Essais de Fabrice depuis son téléphone : 09/11 vers 23 h 10 (numéro inventé 06 12 34 56 78, pas de « Merci ») ; 10/11
  entre 7 h 08 et 7 h 25 (Camille Essai, 07 00 00 00 01). Fiche non trouvée dans le CRM.
- Demandé à la pilote (constat Manus en lecture seule) : journaux des POST `/api/site/demande` et lignes « [Site] »
  depuis le 09/11 22 h, fiches créées par la porte, et où elles apparaissent à l'écran.
- Question de fond posée à la pilote, à confirmer avec Fabrice : il écrit le 09/11 « Lorsque l'information arrive sur le
  crm.via whatsapp le crm whats app doit créer une fiche complète a partir du crm de santeo... Si Inconnu pas grave...
  on laisse comme ça ». Compris par Claude site : les demandes du site devraient arriver dans le CRM Santéo, comme les
  autres leads ; la porte actuelle crée la fiche dans le CRM WhatsApp seulement.
- Mon environnement refuse que j'envoie moi-même une demande à la porte (envoi vers un service partagé).

### 10/11/2026 — de Claude site à la conversation pilote — porte d'entrée : codes postaux de Corse et d'outre-mer
Statut : À TRAITER
- **Fait vérifiable** : le site accepte comme code postal un département à 2 caractères, y compris `2A` et `2B`, ou à
  3 chiffres pour l'outre-mer (`971` à `976`), ou un code postal à 5 chiffres. La porte d'entrée
  (`server/siteDemandeFlux.ts`, `lireDemandeSite`) n'accepte que `^(\d{2}|\d{5})$` : un visiteur de Corse ou
  d'outre-mer qui tape son département reçoit « Format invalide : code_postal » et sa demande n'arrive pas.
- **Demande** : accepter aussi `2A`, `2B` (majuscules ou minuscules) et `971` à `976`.
- **Vérification attendue** : une demande d'essai avec `"code_postal":"2A"` répond `ok: true`.

### 09/11/2026 — de Claude site à la conversation pilote — porte d'entrée du site dans le CRM
Statut : À TRAITER (code : conversation pilote, dépôt `WhatsApp_Solution` ; mise en service : Manus)
Quoi : dans le CRM, ouvrir une adresse de réception des demandes de devis du nouveau site www.santeo.net,
appelable depuis le navigateur du visiteur, **sans clé** (la page est publique : une clé y serait lisible par tous).
Modèle existant, lu le 09/11/2026 : `server/csmLeadRouter.ts` (leads Comparadise, circuit « Autres provenances »).
Ses deux contrôles, jeton et adresse IP du partenaire, sont impossibles depuis une page publique ; ils sont remplacés
par les contrôles 2 et 3 ci-dessous.
1. Une adresse `POST` qui reçoit du JSON et répond `{"ok": true, "id": "<numéro de la fiche>"}` (ou `{"ok": false,
   "erreur": "<raison>"}`). Le nom de l'adresse est libre ; le dire dans la réponse.
2. Navigateurs acceptés (CORS) : `https://www.santeo.net`, `https://santeo.net` et `https://fabcoh.github.io` (site de
   test). Toute autre origine refusée.
3. Protection contre les robots, puisqu'il n'y a pas de clé : champ piège `site_web` qui doit arriver vide (sinon
   répondre `ok: true` sans rien créer) ; au plus 10 demandes par heure et par adresse IP ; refus si un champ
   obligatoire manque ou si le téléphone ou l'e-mail est mal formé.
4. Champs envoyés (obligatoires en gras) : **`civilite`** (Madame ou Monsieur), **`prenom`**, **`nom`**, **`telephone`**,
   **`email`**, **`date_naissance`** (JJ/MM/AAAA), **`code_postal`** (2 ou 5 chiffres), **`regime`**, `conjoint`
   (`{date_naissance}` ou `null`), `enfants` (nombre d'enfants), **`offre`** (`{numero, cotisation_mensuelle, gamme,
   formule}` : code de la gamme et nom de la formule, pour le conseiller seulement), `niveaux` (étoiles choisies par
   poste, de 0 à 5), `besoins` (texte des besoins précis), `site_web` (champ piège, voir 3), **`accord_recontact`** (vrai ou faux),
   **`texte_accord`** (texte exact de la case cochée), **`date_accord`** (date et heure), **`provenance`** (`Site Santéo`,
   ou `Site Santéo – WhatsApp` quand le visiteur arrive par le lien envoyé sur WhatsApp), `page` (adresse de la page),
   `test` (vrai pour un essai).
5. À chaque demande : créer la fiche contact avec la provenance reçue, y joindre une note lisible (offre choisie,
   prix, besoins, accords avec leur date et leur texte), et prévenir les conseillers comme pour un nouveau contact.
   Si un contact existe déjà avec le même téléphone ou le même e-mail, ajouter la demande à sa fiche au lieu d'en
   créer une seconde.
6. Avec `test: true` : créer la fiche marquée « TEST », facile à supprimer.
7. Réponse à écrire dans le carnet de la conversation pilote : l'adresse exacte à appeler, et si le CRM peut envoyer
   lui-même au client un e-mail de confirmation (sinon le conseiller envoie le devis à la main).
Pourquoi : Fabrice met le site en ligne le 10/11/2026 pour recevoir des demandes de devis directement dans le CRM
(« J'ai fait ça pour publier un site et recevoir des demandes de devis »).
Exemple de demande (coordonnées inventées) :
`{"civilite":"Madame","prenom":"Camille","nom":"Essai","telephone":"06 12 34 56 78","email":"camille.essai@exemple.fr","date_naissance":"21/07/1981","code_postal":"75012","regime":"Sécurité sociale","conjoint":null,"enfants":0,"offre":{"numero":1,"cotisation_mensuelle":32.04,"gamme":"MCCINOVA","formule":"Socle"},"niveaux":{"hosp":0,"hono":0,"dent":0,"opt":0,"autres":0},"besoins":"","accord_recontact":false,"texte_accord":"","date_accord":"2026-11-09T20:00:00.000Z","provenance":"Site Santéo – WhatsApp","page":"https://www.santeo.net/?src=whatsapp","site_web":"","test":true}`
Vérification attendue : depuis le site de test, une demande d'essai (prénom inventé, `test: true`) crée une fiche
« TEST » visible dans le CRM avec sa note ; la même demande envoyée d'une autre origine est refusée ; une demande
avec le champ piège rempli ne crée rien.

### 08/11/2026 — de Claude site à « comparateur claude » — tarifs APRIL et API Santé (VERALTI) sur le futur site
Statut : À TRAITER

- **Fait vérifiable** : le futur site santeo.net (dépôt public `fabcoh/santeo-site`) calcule ses tarifs avec ta copie
  de `src/moteur.js`, `src/tarifs_all.json` et `src/garanties.json` (lus sans modification). Fabrice demande d'y ajouter
  APRIL et VERALTI : « IL FAUT AJOUTER LES TARIFS APRIL ET VARALTI », puis « oui prépare la demande ». Ces deux offres
  n'ont pas de grille : leur prix passe par tes relais `https://capisante.fr/april.php` et `https://capisante.fr/apicil.php`.
- **Question** : peux-tu ouvrir ces deux relais aux pages du futur site, **tarification seulement**, et me donner le contrat
  à respecter ? Concrètement :
  1. origines à autoriser : `https://www.santeo.net`, `https://santeo.net`, et l'adresse de test GitHub Pages du dépôt
     (`https://fabcoh.github.io/santeo-site/`, même origine `https://fabcoh.github.io` que ton comparateur : peut-être
     déjà acceptée, à confirmer) ;
  2. jamais April-On, jamais de souscription, aucune clé côté navigateur ;
  3. appel seulement quand la date de naissance et le code postal sont complets, une fois par profil (pas à chaque
     frappe) ; dis-moi le quota à ne pas dépasser ;
  4. les garanties APRIL vivent dans ta page (`APRIL_GAR`) et pas dans `garanties.json` : peux-tu les y mettre (`F.APRIL`)
     pour que le site affiche le tableau des garanties, ou me dire où les lire ?
- **Rappel d'affichage** : sur le site public, les noms des assureurs et des formules seront remplacés par des codes
  (décision de Fabrice) ; APRIL et API Santé suivront la même règle.
- **Bloqué en attendant** : APRIL et API Santé n'apparaissent pas dans les résultats du site ; le reste fonctionne.
- **Vérification attendue** : depuis l'adresse de test, un profil fictif (60 ans, 75012) renvoie `environnement:
  "production"` et des prix APRIL et API Santé.

### 08/11/2026 — de Claude site à la conversation pilote — nouvelle conversation et nouveau dépôt
Statut : À TRAITER

- Fait vérifiable : le dépôt public `fabcoh/santeo-site` a été créé par Fabrice le 08/11/2026 ; ce
  carnet y est ajouté par la demande de fusion « Règles de travail et carnet des décisions ».
- Demande : ajouter au tableau `docs/carnet/CONVERSATIONS.md` la conversation « Santeo.net site »
  (refonte de www.santeo.net, référencement, puis campagnes), dépôt `fabcoh/santeo-site`,
  carnet `docs/carnet/ECHANGES.md`.
- Rien n'est bloqué en attendant.

---

## Décisions de Fabrice (08/11/2026)

### Rôle et objectif
- Claude administre le site et gère le référencement naturel, puis Google Ads et les autres campagnes.
  Le référencement vise Google **et** les moteurs d'IA.
- Plus d'OggoData : « je ne veux plus passer par le comparateur de oggodata mais par le mien pour
  récuperer directement les demandes ».
- « je veux utiliser le comparateur de claude pour afficher les résultats ».

### Adresse et hébergement
- On garde l'adresse santeo.net (choix confié à Claude).
- Hébergement : « oui on part sur github », puis « oui on garde github public ».
- L'accueil actuel de santeo.net renvoie vers capisante.com (demandé autrefois par Fabrice) :
  « oui on garde jusqu'au nouveau site ».
- Les demandes de devis iront au CRM Santéo (moyen à obtenir de la conversation « CRM Santeo »).
- Sur le vrai site, les noms des assureurs et des formules seront remplacés par des codes.

### Parcours du comparateur
- Étape 1 : âge, code postal, régime ; les tarifs s'affichent tout de suite, sans nom ni logo de
  compagnie. Intitulé (09/11/2026) : « Comparez sans vous dévoiler : indiquez juste votre âge, CP, régime »
  (remplace *Simulez sans vous dévoiler…*).
  Dessous, en plus petit, en italique et de la même couleur bleue (demande du 09/11/2026) : « Si une offre vous intéresse
  vous pourrez indiquez vos informations afin de recevoir votre devis sur votre boite mail. », affiché avec trois
  corrections d'orthographe (virgule après « intéresse », « indiquer », « boîte »).
  Date de naissance, code postal (et date du conjoint) : fond rouge pâle tant qu'ils sont vides ou incomplets, pour
  montrer où remplir (demande de Fabrice, 09/11/2026). Le régime aussi (« tu peux mettre en rouge sécurité social ? ») :
  rouge pâle jusqu'à ce que le visiteur l'ait ouvert ou changé.
- Famille : conjoint (âge ou date de naissance, saisi directement dans le champ) et nombre d'enfants
  mineurs (liste). Enfants majeurs : « retire les enfants majeurs pour le moment laisse juste la case
  mineur et conjoint » (le moteur n'a pas encore de règle de tarif pour eux).
- Étape 2, les besoins : Hospitalisation, Honoraires, Dentaire, Optique, Autres, en étoiles de 1 à 5,
  sur une ligne, avec un bouton *(+) Précisez* sous chaque poste (cases à cocher : prothèse,
  implantologie, orthodontie enfant ou adulte, etc.).
- « MET AUCUNE ETOILE AU DEPART ET AJOUTE TOUTES LES GARANTIES ».
- Le panneau *Précisez* s'ouvre tout seul : « a partir de 2 étoiles tu ouvres ».
- Étape 3, les offres : *Option 1*, *Option 2*, *Option 3*…, de la moins chère à la plus chère, toutes encadrées.
  À droite, les postes alignés en colonnes avec les taux ou montants, **sans étoiles** (« retire les
  étoiles dans les rectangle des résultats laisse uniquement les % ») ; une précision cochée
  (par exemple implantologie) ajoute sa ligne sous le poste.
- Étape 4 : le formulaire, quand une offre convient.

### Grilles des étoiles (validées)
- Dentaire (prothèses) : 1 = 100 à 125 % ; 2 = 130 à 175 % ; 3 = 200 à 275 % ; 4 = 300 à 350 % ;
  5 = 400 % et plus.
- Hospitalisation et honoraires (OPTAM) : 1 = 100 à 125 % ; 2 = 130 à 175 % ; 3 = 180 à 275 % ;
  4 = 300 à 350 % ; 5 = 400 % et plus.
- Optique (verres simples) : 1 = 100 % Santé ou jusqu'à 125 € ; 2 = 130 à 175 € ; 3 = 200 à 275 € ;
  4 = 300 à 350 € ; 5 = 400 € et plus.

### Formulaire et accords
- Champs obligatoires pour pouvoir rappeler : civilité, prénom, nom, téléphone, e-mail.
- Données : « Non santéo utilise les données uniquement pour santéo ».
- Accords de recontact : « une seule case » regroupant l'accord d'appel et de WhatsApp (3 prochains
  mois, aux créneaux légaux) et l'accord pour les offres et relances. Le texte validé est celui de la
  maquette. Risque signalé par Claude : la CNIL demande un accord par usage ; à faire relire avant la
  mise en ligne.

### Contact et présentation
- Bouton WhatsApp *Contactez-nous sur : WhatsApp* vers la ligne 86 46, sans afficher le numéro.
  (Fabrice voulait au départ « un chat avec conversation relié sur whatsapp » ; on commence par le bouton.)
- En-tête : logo Santéo, titre *Comparez votre mutuelle santé*, *Le conseil qui vous rassure depuis
  1992*, logos des assureurs partenaires sur deux lignes à droite (sur PC), fond blanc, tous à la même
  taille et centrés.
- Une lumière en forme de comète parcourt la courbe du logo et fait scintiller l'étoile : « oui c'est bien ».
- Gestion des compagnies affichées : « JE VEUX UNE INTERFACE DANS LE SITE OU L A MAQUETTE POUR GERER
  LES COMPAGNIES QUI SERONT AFFICHE ». Dans la maquette, ce réglage est mémorisé dans le navigateur ;
  sur le vrai site, il faudra un réglage réservé à Santéo (à concevoir).

### Mentions légales
- Base : la page de mentions légales de capisante.com, mise à jour selon les règles officielles.
- Responsabilité civile professionnelle : Liberty Mutual Insurance Europe SE (attestation Matrisk
  Assurance, période du 01/03/2026 au 28/02/2027).
- « pas de garantie financiere car on n'encaisse pas de fond » : la phrase est retirée de la page.
- Forme : SAS (capital à confirmer).
- Médiation : La Médiation de l'Assurance, texte validé par Fabrice.

### Certificats et ancien site
- « tu peux gérer le tout certificat » : Claude organise le sujet des certificats de santeo.net.
- L'ancien code est dans `fabcoh/santeo-net` (privé, lecture seule, ne jamais copier son contenu ici).

---

### Maquette : réglages du 08/11/2026 (soir)
- Étape 1 : libellés au-dessus des champs (en texte normal, contenu en gras) ; champs vides au départ sauf le régime
  (« ne met pas 45  par défaut ni le 75012 ») ; date de naissance au lieu de l'âge (« A REMPLACER votre date de
  naissance », « pour le conjoint aussi »), barres ajoutées toutes seules et masque visible `__/__/____` ; code postal
  à 2 ou 5 chiffres (« TU DOIS ACCEPTE 2 CHIFFRES POUR LE CODE POSTAL », « 2 OU 5 ») ; *Sécurité sociale* à la place
  de *Salarié ou retraité* ; conjoint et enfants ajoutés par deux petits liens « Conjoint (+) » et « Enfant (+) ».
- Étape 1 (10/11/2026, demande transmise par la conversation pilote) : *Comparez sans vous dévoiler* mis en avant (plus
  grand, un reflet lumineux le traverse toutes les 5 secondes, immobile si l'appareil demande moins d'animations) ;
  *: indiquez juste votre âge, CP, régime* en italique, sans gras (« comparez sans vous dévoiler doit etre en avant si tu
  peux ajouter une sorte d'animation du texte et le texte à coté a droite cp régime doit en italique et pas en gras »).
- Tchat avec Antony (10/11/2026) : « on créer un tchat bot relié au whatsapp de antony / il doit etre idividualisé »,
  numéro « 01 53 19 86 46 ». Bulle en bas à droite (PC et téléphone ; sur téléphone elle s'efface quand l'étape 4 est à
  l'écran). L'accueil s'adapte à l'avancement du visiteur (rien saisi, âge et code postal, offre choisie, demande
  envoyée) ; le visiteur écrit sa question, WhatsApp s'ouvre vers Antony avec la question, l'âge, le code postal, le
  régime et l'offre. Textes : Mon idée. Avatar : l'oiseau de l'en-tête (« l'avatar c'est loiseau du haut »).
- Tchat (10/11/2026, correction de Fabrice) : « je veux qu'il écrive ici mais pas qu'il ouvre leur whatsapp et
  qu'antony puisse voir la conversation et y répondre depuis sont whatsapp ». Mode « direct » préparé côté site
  (`maquette/reglages-site.json`, `tchat` et `tchat_crm`) : le message part au CRM, les réponses d'Antony s'affichent dans
  la fenêtre, la conversation reste après rechargement. Fenêtre sans texte : seulement la conversation, la saisie et
  « Envoyer » (« retirer tout les textes jsute un chat et un bouton envoyer »). Identification (« bien identifier les
  prospects sur le crm ») : après une demande de devis, chaque message porte le numéro de fiche rendu par le CRM.
  Le visiteur n'ouvre jamais WhatsApp (« je veux pas que le client ouvre WhatsApp. Ce n'est pas le but. Le but, c'est
  de rester dans le chat. Et lui, c'est invisible pour lui. ») : le mode « whatsapp » est supprimé ; tant que le relais
  du CRM n'est pas en service, le tchat est caché (réglage « aucun »). Relais écrit par la conversation pilote (fabcoh/WhatsApp_Solution, demande de
  fusion 508, 10/11) : `https://crm.capisante.fr/api/site/tchat` ; avec `?test=1`, les messages vont à Fabrice seul
  (« 🧪 ESSAI »), jamais à Antony. Le site passe en mode « direct » dès que le relais est en service. Bulle « Posez-moi vos
  questions » au-dessus de l'oiseau (« sous l'oiseau du tchat petit message "Posez moi vos questions" », puis « pas sous
  mais au dessus »), cachée quand la fenêtre est ouverte. Entrée envoie le message, Maj + Entrée passe à la ligne (« on dois pouvoir
  faire entrée pour envoyer un message depuis le clavier », transmis par « CRM Santeo » le 10/11). Fenêtre bien
  distincte de la page (« Le Tchat est confondu avec l'arrière plan il faut pouvoir le distinguer ») : en-tête bleu,
  cadre bleu, fond propre au tchat ; sur téléphone, le tchat ouvert prend tout l'écran (« Surtout depuis un portable »).
- Étape 1 (10/11/2026, transmis par « CRM Santeo ») : « Comparez sans vous dévoiler : indiquez juste votre âge, Code
  Postal, Régime sécu (avec le filtre actuel) » ; mise en forme inchangée (titre en avant avec son reflet, suite en
  italique). Relais côté CRM demandé à la conversation pilote le 10/11 (message à sa session ;
  contrat : `POST /api/site/tchat`, `GET /api/site/tchat/<conversation>?depuis=`).
- Étape 2 : le volet *Précisez* devient une petite fenêtre accrochée au poste, qui se ferme seule après 4 secondes
  sans action.
- Étape 2 (09/11/2026) : la fenêtre *Précisez* ne s'ouvre plus toute seule quand on met des étoiles, seulement au clic
  sur *(+) Précisez* (« Uniquement tu ouvres le popup si il clique sur préciser »). Dès que la date de naissance et le
  code postal sont remplis, les étoiles de chaque poste s'allument de 1 à 5 puis s'éteignent, poste après poste
  (environ 0,8 s chacun), une seule fois par visite ; l'animation ne choisit rien et s'arrête si on touche une étoile.
- Étape 3 : 5 offres, puis *Plus de résultats* qui affiche tout ; le détail d'une offre s'ouvre en fenêtre, sous forme
  de tableau (postes en gras, sous-postes en normal) ; les logos des compagnies et leur vague animée (avec étoile et
  *IA*) sont sous les résultats.
- Étape 4 : formulaire mis en avant ; pas de nom fictif dans les champs (« ne pas mettre de nom fictif »).
- Étape 4 (10/11/2026) : sous la case d'accord, le détail (retrait de l'accord, données personnelles) est replié derrière
  un lien souligné *Votre accord* qui l'affiche au clic (« cette partie ne doit pas etre intégré au formulaire d'envoi
  sous cette forme mais avec un Votre accord (souligné) et cela affiche l'enselble du texte »).
- En-tête : lumière animée sur le logo Santéo ; mascotte en petit en haut à droite ; *Contactez-nous sur : WhatsApp*
  masqué pour le moment (« TU LE MASQUE POUR LE MOMENT »).
- En-tête (09/11/2026) : la mascotte est animée (« Tu peux animer l'oiseau du site ? ») : elle flotte, bat des ailes et
  son étoile scintille, en continu ; immobile si l'appareil demande moins d'animations. Vitesses choisies par Claude
  (Mon idée), à valider par Fabrice. Au passage, le trou transparent dans le visage de la mascotte en mode sombre est
  corrigé.

## Points ouverts (posés directement à Fabrice par cette conversation, la pilote n'a pas à les poser)

- Mentions légales : confirmer trois phrases (sur quelle base le conseil est donné, liens avec des
  assureurs, mode de rémunération) et dire s'il existe un document d'entrée en relation ; capital social,
  numéro de TVA, adresses e-mail à afficher, hébergeur final.
- Grille des étoiles « Autres » : Mon idée, non validée (médecines douces, en € par an : jusqu'à 80,
  120, 160, 200, plus de 200).
- Bouton WhatsApp : à tester par Fabrice sur son téléphone.
- Certificats : date de bascule et solution provisoire pour l'ancien site.
- capisante.com et capisante.fr : « doivent etre remis en ligne correctelemnt » ; reste à décider ce que
  montre chaque adresse, sans casser les relais du comparateur hébergés sur capisante.fr.

## Demandes à préparer pour les autres conversations (pas encore envoyées)

- « CRM Santeo » : comment créer une fiche depuis le formulaire du site (provenance « Site Santéo »).
- Conversation pilote : prévenir de cette nouvelle provenance.
- « comparateur claude » : règle de tarif des enfants majeurs (reporté par Fabrice).
  (La demande APRIL / API Santé est envoyée : voir l'entrée du 08/11 en haut.)
- Services internes de l'ancien comparateur qui passent encore par www.santeo.net : à déplacer avant le
  changement d'adresse (à voir avec les conversations concernées).

## Mise en ligne de www.santeo.net (demandée le 09/11/2026 pour le 10/11/2026)

Fait le 11/11/2026 :
- zone DNS de santeo.net relevée avant toute modification (28 lignes, gardée hors du dépôt : adresses de serveurs) ;
- GitHub, réglages Pages : domaine personnalisé `www.santeo.net` ;
- OVH : seule la ligne `www` changée (A vers l'ancien serveur supprimée, CNAME `www` vers `fabcoh.github.io.` ajouté) ;
  aucune ligne des mails, du CRM, de GestCom, du comparateur ni `public` touchée ;
- certificat de www.santeo.net créé par GitHub (vérifié le 11/11 à 9 h 06, valable jusqu'au 09/02/2027) ;
- publication passée en `--en-ligne`.
- `santeo.net` sans www : Fabrice a remplacé dans OVH, le 11/11 vers 9 h, la ligne `@` de type A (ancien serveur) par une
  des adresses de GitHub Pages ; SPF et lignes des mails inchangés. Le constat de Manus sur les mails envoyés par l'ancien
  serveur n'a pas pu se faire (pas d'accès à cette machine). Le navigateur de Fabrice gardait en mémoire l'ancien renvoi
  vers capisante.com (il disparaît en navigation privée).
- `santeo.net` sans www : certificat créé par GitHub le 11/11 vers 12 h 31 (Paris), juste après que Fabrice a ouvert la
  page des réglages Pages (« DNS check » relancé) ; le certificat couvre santeo.net et www.santeo.net ;
  `https://santeo.net` renvoie vers `https://www.santeo.net/` (vérifié).
- santeo.fr (Fabrice : « Et pour santeo.fr il faudra faire le nouveau renvoi ») : fait le 11/11 vers 18 h. Dépôt
  `fabcoh/santeo-fr` (page de renvoi vers www.santeo.net, paramètres comme `?src=whatsapp` gardés), publié par GitHub
  Pages, domaine `santeo.fr`, « Enforce HTTPS » coché. Zone OVH de santeo.fr relevée avant (11 lignes, gardée hors du
  dépôt) ; changé : ligne `@` de type A vers une adresse de GitHub Pages, lignes `www` (A et TXT « 3|welcome » de la page
  d'attente OVH) remplacées par `www` CNAME `fabcoh.github.io.` ; MX, SPF, NS et ftp inchangés. Certificat pour
  santeo.fr et www.santeo.fr ; renvoi vérifié sur PC et téléphone. Le comparateur utilise capisante.fr, pas santeo.fr.
Reste :
- plus tard, ajouter éventuellement les trois autres adresses de GitHub Pages pour les lignes `@` de santeo.net et
  santeo.fr (une seule est en place pour chacun).


Demande de Fabrice : « tu vas référencer tout ce qu'il y a à faire et on met en place tout ça pour le publier
demain ». But : « publier un site et recevoir des demandes de devis, commencer à référencer le site, commencer à te
mettre en place des achats de mots-clés », et avoir « une référence pour mes clients qui viennent de WhatsApp ».

Constat vérifié le 09/11/2026 : le certificat de sécurité de santeo.net et de www.santeo.net a expiré le 05/10/2026.
Les visiteurs de l'adresse actuelle voient donc une alerte de sécurité. Sur GitHub, le certificat est gratuit et
renouvelé automatiquement.

Points relevés le 09/11/2026 :
- les devis envoyés par le comparateur de « comparateur claude » renvoient vers `santeo.net/mentions-legales` et
  « Infos légales : www.santeo.net » : le nouveau site doit garder cette adresse de page ;
- aucun appel technique du comparateur actuel vers santeo.net trouvé (seulement des adresses e-mail et ces
  mentions) ; les services de l'ancien comparateur (OggoData) ne sont plus utilisés ;
- registre public : CAPI FINANCE, SAS au capital de 21 342 €, créée le 29/07/1992, SIREN 388 103 301 (à confirmer
  sur le site de l'ORIAS, inaccessible depuis cette conversation).

Fait le 09/11/2026 au soir :
- la conversation pilote a écrit la porte d'entrée du CRM (fabcoh/WhatsApp_Solution, demande de fusion 501,
  fusionnée) : `https://crm.capisante.fr/api/site/demande`. À 21 h 25 (Paris), elle n'était pas encore en service
  (l'adresse renvoyait la page du CRM). Le site y est branché (`maquette/reglages-site.json`) ; une réponse qui n'est pas
  un « ok » explicite du CRM est traitée comme un échec, et le visiteur peut réessayer ou passer par WhatsApp ;
- les mails de devis de l'ancien comparateur affichent le logo depuis `www.santeo.net/images/Logo_santeo_pt.png` :
  cette adresse est gardée sur le nouveau site (logo Santéo actuel) ;
- point ouvert : d'après « Comparateur Santeo » (carnet de la conversation pilote, 08/11), d'anciens mails de devis
  renvoient vers `www.santeo.net/files/<gamme>/` ; après la bascule, ces liens mèneront à l'accueil du nouveau site.

Avant la mise en ligne (Claude, 09/11 au soir) :
1. Demande au CRM pour recevoir les demandes du formulaire (entrée pour la conversation pilote, en haut).
2. Version « en ligne » de la page : visible par Google, sans bandeau de test ; titre et description pour Google ;
   aperçu propre quand le lien est partagé sur WhatsApp ; plan du site pour Google ; vraie page `/mentions-legales` ;
   anciennes adresses du site renvoyées vers l'accueil.
3. Mentions légales : capital, hébergeur GitHub, e-mail de réclamation générique (pas d'adresse personnelle).
4. Formulaire : envoi vers le CRM dès que l'adresse est connue.
5. Lien à envoyer aux clients WhatsApp : `https://www.santeo.net/?src=whatsapp` (la demande arrive avec la provenance
   « Site Santéo – WhatsApp »).

Le jour de la mise en ligne (Fabrice clique, Claude guide une étape par message) :
6. Fabrice fusionne les demandes de fusion.
7. Fabrice montre toute la zone DNS de santeo.net dans OVH (capture). Le relevé est gardé hors du dépôt, qui est
   public (il contient des adresses de serveur).
8. GitHub, réglages du dépôt, Pages : domaine personnalisé `www.santeo.net`, puis « Enforce HTTPS ».
9. OVH : `www` vers `fabcoh.github.io.` ; `santeo.net` sans www vers les quatre adresses de GitHub Pages. Jamais les
   lignes MX, SPF, DKIM, DMARC, ni les sous-domaines du CRM et de GestCom ; vérifier avant qu'aucun sous-domaine ne
   dépend de la ligne `santeo.net`.
10. Claude passe la publication en mode « en ligne » et vérifie l'adresse sur PC et téléphone, certificat compris.
11. Google Search Console : envoyer le plan du site `https://www.santeo.net/sitemap.xml`.

Ensuite, un lot à la fois :
12. Pages pour le référencement (Google et moteurs d'IA).
13. Achats de mots-clés (Google Ads) : la mesure des demandes reçues demande un bandeau d'accord pour les cookies
    (règle de la CNIL), à faire avant la première campagne.
14. APRIL et API Santé (en attente de « comparateur claude »).
15. Gestion des compagnies réservée à Santéo.

## Statistiques et Google Ads (décidé le 11/11/2026)

- Fabrice : « on peux avoir les statisatique et les personnes en ligne actuellement sur le site ? », puis « j'ai un avoir
  de 400€ pour faire du google ad », puis « oui on fait ce tes ». Choix : statistiques Google (Google Analytics), reliées
  à son compte Google Ads, plutôt que Plausible (proposé d'abord, sans cookie mais payant).
- Fait (demande de fusion « bandeau-cookies ») : bandeau cookies, « Refuser » et « Accepter » identiques ; rien de Google
  chargé avant l'accord ; choix gardé 6 mois ; lien « Cookies » en bas de page ; mentions légales, section Cookies, mise
  à jour ; la demande de comparatif envoyée (`generate_lead`) et le premier message du tchat (`tchat_premier_message`)
  sont comptés, sans leur contenu. Tant que `google_mesure` est vide dans `maquette/reglages-site.json`, rien ne
  change sur le site.
- Identifiant de mesure (11/11) : la propriété Google Analytics existait déjà (« http://www.santeo.net – GA4 », compte
  Analytics « www.santeo.fr », même compte Google que le compte Google Ads « santeo ») ; identifiant `G-WMWFVBYLE0` mis
  dans `maquette/reglages-site.json` (demande de fusion « mesure-google-analytics »). Essais avant envoi : bandeau visible
  sur téléphone et PC, rien de Google avant l'accord, balise chargée après « Accepter », rien après « Refuser ».
- Compte Google Ads « santeo », état des lieux du 11/11 (lu par Windsor.ai) : actif ; 4 anciennes campagnes en veille,
  sans dépense depuis au moins 2 ans et inutilisables (groupes d'annonces supprimés ou annonces absentes, une campagne
  sans rapport avec Santéo) ; aucun suivi des conversions ; page Promotions vue par Fabrice : aucune offre, aucun avoir ;
  dernier paiement en 2013 : carte à remplacer par Fabrice avant toute dépense. Anciennes annonces refusées quand elles
  citaient des assureurs : ne jamais citer de nom d'assureur dans une annonce.
- Compte « Santeo V2 » (captures du 11/11) : désactivé par Google depuis le 28/02/2020, paiement refusé ; ses 4 campagnes
  ont été mises en veille par Fabrice le 11/11 (l'une était encore active et aurait dépensé dès la carte acceptée).
  Sa page Promotions n'a pas été vue : l'avoir de 400 € y est peut-être (voir la phrase de Fabrice ci-dessous), mais les
  offres de Google sont en général réservées aux nouveaux annonceurs, ce que Santéo n'est plus (non vérifié).
- Windsor.ai branché le 11/11 (plug-in et connecteur claude.ai, choix de Fabrice : « oui on branche Windsor.ai ») ; il
  lit le compte Google Ads actif « santeo ». Un second compte Google Ads (« Santeo V2 ») demande un nouveau moyen de
  paiement ; Fabrice : « mais les 400 euros étais sur l'autre adresse » (compte exact de l'avoir à préciser avec lui).
- Environnement cloud (réglages réseau) : adresses autorisées le 11/11 avec l'accord de Fabrice : Windsor.ai (son
  plug-in était refusé par le réseau) et santeo.fr / www.santeo.fr (vérification du renvoi).
- Décision de Fabrice (11/11) sur le prix des clics « mutuelle » : « C'est trop cher pour moi. » Nouvelle cible :
  « ce qui nous intéresse, c'est d'attirer les jeunes 20, 25 ans, 30 ans ». Ordre retenu (« Ok je te fais confiance ? ») :
  1. la mesure, gratuite : Google Analytics (ce lot), puis lien Analytics ↔ Google Ads, puis Search Console (vérifiée
     par un fichier ou une balise dans le site, sans toucher à OVH) ;
  2. des articles du guide pour les jeunes : étudiants, apprentis et alternants, jeunes sans emploi, fin de la mutuelle
     des parents, premier emploi (dispense de la mutuelle d'entreprise) ; textes « Mon idée » validés par Fabrice ;
  3. un petit test payant sur les mots-clés jeunes les moins chers, avec un prix maximum par clic, budget à fixer avec
     Fabrice (moins de 400 € par mois), seulement après la carte remplacée et la mesure en place.
- Les chiffres de visites, de recherches Google et de prix des mots-clés ne s'écrivent jamais dans ce dépôt public.

## Vue de contrôle (11/11/2026)

- Fabrice : « je voudrais avoir une version avec les compagnies affiché pour bien controler », puis « POURQUOI JE NE VOIS
  PAS DANS LA MAQUETTE » (prix APRIL et API Santé : leurs relais n'acceptent que santeo.net, la maquette tourne sur
  claude.ai), puis « OK » à la vue de contrôle.
- www.santeo.net/?controle=1 : sous chaque offre, « Contrôle : gamme · formule », avec les vrais tarifs ; bandeau « Vue de
  contrôle » en haut. Un visiteur ordinaire ne voit rien de changé (les noms sont déjà dans le code de la page).

## Reste à faire selon Fabrice (11/11/2026, ses mots)

« ajouter les garantie april et varalti qui ne sont pas encore sur le site / google sur des mot clefs pas chere /
référencement naturel / avec un agent tu pourrais documenter mieux le site avec des articles a créer et les explications /
thèmes / contrat non responsable / ACS aide à la mutuelle / surcomplémentaire santé / Mutuelle de groupe ou obligatoire /
Exemple de remboursement / Comprendre la mutuelle et le principe des remboursement / On peut ajouter plein d'article pour
mieux référencer le site »

- **Guide de la mutuelle** (demande de fusion « guide-articles ») : 6 articles, un par thème, rédigés par deux agents
  puis relus par Claude (textes : Mon idée). Pages `/guide/` et `/guide/<slug>/`, plan du site, données pour Google
  (article, fil d'Ariane, questions fréquentes), lien dans le pied de page de l'accueil. L'ACS n'existe plus depuis le
  01/11/2019 : l'article le dit dès le titre et explique la Complémentaire santé solidaire.
- Chiffres vérifiés sur Service-Public (lecture directe) et, pour ameli et Légifrance qui refusent les lectures
  automatiques, par recherche : C2S (plafonds et participations), franchises et participation forfaitaire (plafonds de
  70 € par an), consultation à 30 €, base de 23 € en secteur 2 hors OPTAM, forfait journalier de 23 € (17 € en
  psychiatrie) depuis le 01/03/2026, couronne 100 % Santé à 515 € et base de 120 €.
- **À remettre à jour chaque année** : plafonds de la C2S (1er avril), forfait journalier, tarifs des consultations,
  plafonds du 100 % Santé, franchises.
- Mots-clés visés et points douteux de chaque article : gardés hors de ce dépôt public (stratégie de référencement et
  d'annonces).
- APRIL et API Santé : relais ouverts à santeo.net et www.santeo.net le 11/11 (tarification seulement, versions
  2026-11-11, d'après « comparateur claude »). Fabrice : « et april et varalti ne sont pas dispo au niveau des tarifs ? ».
- **API Santé (VERALTI)** branché (demande de fusion « api-sante ») : le site appelle `capisante.fr/apicil.php` une fois
  par profil complet (date de naissance exacte, code postal), garanties lues dans `garanties.json` (gamme APICIL), offres
  ajoutées aux autres. Vérifié le 11/11 par un vrai calcul (profil fictif, 60 ans, 75012 : 11 formules). Dans la maquette
  (page privée), pas de tarif API Santé : le relais n'accepte que santeo.net. Au passage, l'option choisie est suivie par
  son identité : une offre qui arrive ou un changement d'étoiles ne fait plus envoyer une autre offre que celle choisie.
- **APRIL** branché (demande de fusion « april ») : le site appelle `capisante.fr/april.php` une fois par profil complet,
  tarification seulement ; produits = ceux cochés dans l'espace admin (par défaut Santé Mix Proximité et Simply Santé,
  comme le comparateur ; produits « indépendants » seulement pour un régime TNS) ; garanties lues à la construction dans
  la page du comparateur (`APRIL_GAR`, `APRIL_ORDRE_RANG`), en lecture seule, tant qu'elles ne sont pas dans
  `garanties.json` ; produits modulables lus sur la diagonale (« Niv. 3 » = 03|03). « n.c. » (garanties non publiées,
  Simply Santé) s'affiche « n.c. » / « Non communiqué », jamais « — » (non couvert). Au passage : garanties détaillées
  d'API Santé (pharmacie, implants, lentilles…) ajoutées, elles manquaient dans le détail.
- Point à surveiller : chaque calcul APRIL renvoie un numéro de projet (« x-projectUuid ») ; APRIL enregistre peut-être
  un dossier par calcul (non vérifié).
- **5 articles de plus** (demande de Fabrice du 11/11, ses mots : « résiliation infra annuelle RIA / les différents tarifs
  de convention / Les medecins signataire des convention ceux qui sont OPTAM ou NON OPTAM / LE 100% santé avec les
  différentes réforme / Prothèeses dentaires remboursé avec les tarifs de convention et kes shéma des dnets pour
  expqiuer ») : demande de fusion « guide-articles-2 », 11 articles en tout. Rédigés par deux agents, relus par Claude
  (textes : Mon idée). Retiré à la relecture, faute de preuve : l'étape dentaire du 1er janvier 2022 (annoncée en 2019,
  réalisation non vérifiée) et une définition du contrat responsable qui était celle du contrat « solidaire ».
- **Schéma des dents** (article des prothèses) : dessiné à la construction à partir de `schema_dents` du JSON de
  l'article (panier de chaque couronne selon la dent et le matériau), avec le même contenu en texte. La construction
  s'arrête si `a_confirmer` n'est pas vide. Paniers en vigueur depuis le 1er janvier 2026 : la couronne en zircone sur
  molaire est passée des tarifs maîtrisés au 100 % Santé (plafond 453,20 €).
- Chiffres de ces 5 articles : Service-Public et securite-sociale.fr lus directement ; ameli et Légifrance par recherche
  seulement (ils refusent les lectures automatiques). Plafonds dentaires 2026 relevés de 3 % (515 €, 566,50 €,
  453,20 €, 298,70 €, inlay-core 150 €). L'exemple du spécialiste à 65 € (base de 31,50 €) est celui du Haut Conseil pour
  l'avenir de l'assurance maladie (octobre 2025), cité comme tel. **À remettre à jour chaque année** : plafonds dentaires
  et tarifs des consultations. Le contrôle « nom d'assureur dans un article » laisse passer le nom de ce Haut Conseil.
- **Référencement naturel, vérification du 11/11** (demande de Fabrice : « Tu peux vérifier que le code permet un bon
  référencement naturel ») : bases en place (adresse officielle, plan du site, robots, données pour Google, texte lisible
  sans JavaScript, téléphone). Trois points trouvés, dans l'ordre : 1) les anciennes pages de l'ancien site connues de
  Google tombaient en erreur 404 ; 2) l'accueil est lourd sur téléphone (logos des compagnies intégrés dans la page) ;
  3) petits défauts de l'accueil (description trop longue, deux titres h1, pas de liens vers les articles). Fabrice :
  « Oui » pour commencer par le point 1.
- **Renvois des anciennes adresses** (demande de fusion « anciennes-adresses ») : `maquette/renvois.json` liste les
  anciennes adresses (`/actu/…`, `/question/…`, `/devis/…`, relevées dans l'export de la Search Console du 08/11) et la
  page la plus proche du nouveau site (article du guide, guide, ou comparateur ; choix : Mon idée). La construction écrit
  à chaque ancienne adresse une page de renvoi immédiat avec l'adresse officielle de la destination, et s'arrête si la
  destination n'existe pas. `/mentions-legales` avait déjà son renvoi. Les chiffres de l'export restent hors du dépôt.
- **Décision de Fabrice (11/11, ses mots)** : « Je vais te demander ce qu'il reste à faire pour ma première question qui
  était d'augmenter les chances de référencement. À chaque fois, je vais devoir te demander, alors qu'est-ce qu'il reste à
  faire? Ou tu peux passer à la suite? Est-ce que tu peux essayer d'enchaîner ». Pour le référencement, Claude enchaîne
  les lots de code sans redemander ; Fabrice fusionne. Reste dans l'ordre : accueil allégé et petits défauts (fait dans
  « accueil-leger »), polices sans blocage (même lot), liens entre articles dans le texte, puis Search Console (accès à
  demander à Fabrice ou à son fils).
- **Accueil allégé** (demande de fusion « accueil-leger ») : logos des compagnies en WebP de 72 px de haut (dans la page :
  310 Ko -> 56 Ko ; rendu identique à l'œil, PC et téléphone) ; description pour Google de 143 caractères (Mon idée) ;
  « Mentions légales » devient un sous-titre (un seul titre h1 sur l'accueil) ; liens vers les 11 articles du guide en bas
  de l'accueil (champ `lien` de chaque article, texte court : Mon idée) ; polices Google chargées sans bloquer l'affichage
  (accueil et articles). Tests : liens vers chaque article, un seul h1, description de 155 caractères au plus, images
  intégrées de moins de 120 Ko.
- **Liens entre articles** (demande de fusion « liens-articles », suite du référencement enchaînée à la demande de
  Fabrice) : dans chaque article, 2 à 4 liens vers d'autres articles du guide, posés sur la première expression
  pertinente du texte (contrat responsable, 100 % Santé, OPTAM, secteur 2, ticket modérateur, base de remboursement…),
  jamais dans un titre, la FAQ ou les sources. Test : chaque lien mène à un article qui existe, au moins 2 par article.
- **Article du jour, 22/11 : lire son tableau de garanties** (demande de fusion « article-tableau-garanties », chapitre
  « Bien choisir » ; texte : Mon idée, rédigé par un agent, relu par Claude, chaque montant des exemples recalculé). Vérifié :
  PMSS de 4 005 € en 2026 et 4 075 € annoncés au 1er janvier 2027 (Service-Public A15386) ; F20314 (« 150 % Assurance maladie
  incluse », forfait « à hauteur de 200 € », aide auditive 950 € / base 400 € / 240 €) ; F165 ; F17042 (bases de 30 € et 23 €) ;
  F21760 (boîte à 20 € : 12 € versés, 1 € de franchise) ; F33956 (carie à 30,74 €, 18,44 € remboursés) ; F34781 ; F200 ;
  instruction de 2019 (non OPTAM, optique 420 à 800 €, aides auditives de classe II 1 700 €, renouvellements). Par recherche :
  sigles TM et BR (ameli.fr), article 9 de la loi du 31/12/1989 et lignes « % du PMSS » des accords de branche (Légifrance).
- **Comparateur à curseurs et en cartes (Fabrice, 22/11, capture du comparateur du CRM Santéo : « C'EST PLUS SYMPA LES CURSEURS ET
  L'AFFICHAGE EN 3 BLOQUES PAR LIGNE », puis « valide »)** (demande de fusion « comparateur-curseurs » ; code écrit par un agent,
  relu par Claude) : un curseur par poste (0 à 5, mêmes niveaux et même filtrage que les étoiles, grilles de Fabrice du
  08/11 : « Au moins 100 % », « Au moins 130 % »… « 400 % et plus » ; optique en euros ; Autres en euros par an) ; offres en
  cartes, 3 par ligne sur ordinateur, 2 de 600 à 899 px, 1 sur téléphone ; 6 offres d'abord (deux lignes pleines sur
  ordinateur) ; badge « Petit prix » sur la première seulement quand la liste va de la moins chère à la plus chère ; toujours
  « Option N », sans nom d'assureur ; pas de « Recommandée pour vous » ni de « 1 mois offert » ; bouton « Recevoir mon devis ».
  Tests : libellés et filtrage à chaque niveau, clavier, toucher, cartes par ligne, aucun nom d'assureur ni mot de promesse
  dans les cartes. Repéré, laissé tel quel : deux accolades en trop avant « /* Formulaire */ » dans template.html font ignorer
  la règle .chosen-box (encadré « Votre choix ») ; à corriger dans un lot à part si Fabrice le souhaite.
- **Tchat : le pseudo est toujours demandé (Fabrice, 22/11 : « le chat ne fonctionne plus correctement / on devais identifier
  la personne qui envoie son chat et surtout les réponses n'arrive plus », puis « par contre il fallait ajouter qu'il ajoute
  son pseudo »)** (demande de fusion « tchat-pseudo »). Essai en ligne le 22/11 à 10 h 36 (marqué essai, parti vers Fabrice
  seul) : envoi accepté par le CRM, conversation suivie toutes les 4 s, aucune erreur : le site marche. Cause trouvée dans le
  code du site : le pseudo n'était demandé qu'au premier message d'une conversation neuve, et jamais à un visiteur qui avait
  déjà envoyé une demande de comparatif ; une conversation ouverte avant le 11/11 (gardée 7 jours après la dernière
  activité) ou un visiteur déjà connu par sa fiche écrivait donc sans nom. Désormais : demandé tant qu'aucun pseudo n'est
  connu, même au milieu d'une conversation (le CRM le garde au premier message qui en porte un) ; le prénom d'une demande
  envoyée pendant la même visite en tient lieu. Tests : visiteur connu par sa fiche et conversation commencée sans pseudo
  (question avant l'envoi, pseudo envoyé, demandé une seule fois), en échec avant la correction. Les réponses : le CRM ne
  range dans le tchat qu'une réponse WhatsApp qui cite le message (« Répondre ») ou commence par « #12 » ; sinon elle part
  dans le fil « Claude ». Fabrice : « j'ai compris qu'il faut faire réponrdre au message pour faire partir la réponse et ce
  n'est pas évident ». Côté CRM (conversation pilote) : transmis le 22/11.
- **Date de naissance avec une année impossible (Fabrice, 27/11, capture de son téléphone : « 21/04/5966 », « Bug »)** (demande
  de fusion « date-annee », correction fusionnée par Claude). Le site refusait bien la date mais disait « vérifiez le jour et le
  mois », en petit gris à côté du titre. Désormais : *L'année 5966 n'est pas possible : vérifiez l'année de votre date de
  naissance.* (même chose pour le conjoint), et tout message de saisie à corriger s'affiche en rouge gras. Repéré, laissé tel
  quel : une date comme le 31/02 est acceptée (le calcul de l'âge ne vérifie pas le nombre de jours du mois) ; à corriger dans
  un lot à part si Fabrice le souhaite. Sa capture montre aussi la page en mode « ordinateur » sur son téléphone (largeur
  coupée à droite) : à vérifier par lui (réglage « version ordinateur » du navigateur).
- **Titre des offres (Fabrice, 26/11 : « Remplace Les offres pour vous / 74 offres atteignent vos niveaux, sur 84 calculées pour
  votre profil. / Par ce seul texte … Comparez jusqu'à 3 offres entre elles (icone étoiles) »)** (demande de fusion
  « titre-comparez », modèle montré à Fabrice). Titre de l'étape 3 : *Comparez jusqu'à 3 offres entre elles ☆* (Vos mots, étoile
  jaune) ; le nombre d'offres n'est plus affiché quand les offres sont là (gardé pour les lecteurs d'écran) ; les messages
  « Indiquez votre date de naissance… » et « Aucune offre… » restent visibles.
- **Étoiles de « Comparer » qui s'allument l'une après l'autre (Fabrice, 26/11 : « Les étoiles de comparer doivent s'allumer
  lentement chacun son tour sans arret tu comprend »)** (demande de fusion « etoiles-vague », modèle montré en vidéo). Sur les
  offres non choisies, l'étoile passe au jaune et grossit un peu, une offre par seconde, cycle de 6 s, sans fin ; rien ne bouge
  pour les visiteurs qui ont demandé moins d'animations.
- **Conjoint sans fond rose (Fabrice, 26/11 : « pas de fond rouge sur le conjoint le champs n'est pas obligatoire »)** (demande
  de fusion n° 80, correction fusionnée par Claude). La case du conjoint reste neutre quand elle est vide ; rose seulement si
  une date est commencée sans être complète. Test en échec avant la correction ; en ligne, vérifié sur PC et téléphone.
- **Effet sur « Comparer cette offre » (Fabrice, 26/11 : « tu peux créer un effet comparer cet offre donne moi des idee », puis
  « il faut qu'il puisse voir ...commparer cette offre »)** (demande de fusion « effet-comparer », modèle montré à Fabrice ; Mon
  idée). Halo doré qui pulse deux fois sur les boutons des 3 premières offres quand elles apparaissent, une seule fois par
  visite ; étoile qui s'allume en jaune et tourne au survol ; une fois choisie, fond jaune clair, étoile jaune avec un petit
  « pop ». Rien ne bouge pour les visiteurs qui ont demandé moins d'animations.
  Puis « il faut le mettre dans une couleur pastelle beige » : bouton beige pastel (fond #f6eedf, texte brun, contraste 6,2).
  Puis « non pas terrible retire jsute le contour pour voir » : contour retiré.
  Puis « Retire le fond également » : ni fond ni contour, texte brun et étoile seuls.
  Puis « Je veux comparer cette offre au niveau de l'étoile en haut / ___☆ comparer ___ / Badges » : *☆ Comparer* posé sur le
  trait du haut de chaque carte, à la place de l'étoile ; choisie : *★ À comparer* en jaune ; au-delà de 3 : *☆ 3 au maximum*.
- **Conjoint et enfants mineurs toujours visibles ; phrase du simulateur retirée (Fabrice, 26/11 : « il faut une case Conjoint
  date de naissance et nombre d'enfant mineurs ( 1, 2,3 ...) / fait moi une présentation » ; « Combien vous serait remboursé un
  soin ? Accéder au simulateur de remboursement Sécu / retire cette phrase de cet emplacmenet »)** (demande de fusion
  « conjoint-enfants », modèle montré à Fabrice). Étape 1 : *Naissance du conjoint* (téléphone : *Conjoint*) et *Enfants
  mineurs* (téléphone : *Enfants*, 0 à 6) visibles d'emblée, à la place des liens « Conjoint (+) » et « Enfant (+) » ; largeurs
  revues pour tenir sur une ligne dès 1 060 px. La phrase au-dessus des offres est retirée ; le simulateur reste dans le pied
  de page.
- **Tarif 2027 sous le tarif (Fabrice, 26/11 : « il faut vraiment réduite les tarifs … il fait ajouter en plus petit et gris
  le tarif en dessous (55,05€ en 2027) », puis « tu n'endiques que les tarifs que tu as »)** (demande de fusion « tarif-2027 »,
  modèle montré à Fabrice). Sous le tarif 2026 de chaque offre qui a une grille 2027 (Avenir Mutuelle seulement au 26/11 :
  5 gammes, tarifs du moteur `fabcoh/santeo-tarifs`, option `prix2027`, âge atteint en 2027) : *(81,42 € en 2027)* en petit
  et gris ; rien sur les autres offres. Sa capture montrait l'ancienne version (gros tarif, « Petit prix ») : le site en ligne
  avait déjà la cotisation réduite (PR n° 75) ; probable copie gardée par son navigateur.
  Puis « il faut laisser l'espacé de la ligne pour le tarifs meme si il est abs pour pour cohésion » : la ligne garde sa place,
  vide, sur les offres sans tarif 2027.
- **Comparer cette offre (Fabrice, 25/11, par la relais : « on a va ajouter comparer cette offre avec une autre … il pourra
  selectionner jusqu'a 3 offres … tarif le mois cher au plus cher », « Comparer cette offre / un volet a doite avec les offres
  qui s'affiche » ; puis ici : « je crois que les étoiles pourrait mieux servir a comparer / tu écris comparer cette offre et
  l'étoile se place au dessus »)** (demande de fusion « comparer-offres », qui reprend aussi les cartes de la demande n° 74,
  fermée). Sous le prix de chaque carte : *☆ Comparer cette offre* ; choisie, l'étoile ★ se place au-dessus de la carte et le
  bouton devient *★ À comparer · retirer* ; 3 au plus (les autres boutons : *3 offres au maximum : retirez-en une*). Volet à
  droite (en bas sur téléphone) : les offres choisies (Option N et prix, sans nom d'assureur, comme sur les cartes), une croix
  pour chacune, *Comparer les garanties* (dès 2 offres). Fenêtre *Détail des garanties* : une colonne par offre, de la moins
  chère à la plus chère, les mêmes lignes que le détail d'une offre, *Cette offre m'intéresse* en tête de chaque colonne
  (circuit existant). Une offre qui n'est plus proposée (profil ou besoins changés) sort de la comparaison. Les étoiles
  automatiques « les plus proches de la demande » sont retirées. Non fait : la meilleure valeur de chaque ligne mise en avant
  (proposition de la relais, non demandée par Fabrice).
- **Niveaux en vert et étoiles (Fabrice, 25/11 : « les infos contenu dans le comparateur … doivent ressortir propose moi des
  modèle de couleur », « les tailles sont ok », planche de 6 modèles puis 2 ; « je t'ai juste demandé de changer / retire petit
  onglet petit prix et ajoute une "étoile " sur les 3 mutuelles qui sont les plus proches de sa demande au tarif le moins
  chère », « écriture verte et tu laisse le fond vert »)** (demande de fusion « etiquette-verte-etoiles », modèle montré à
  Fabrice). Niveaux des offres en écriture verte sur fond vert clair (modèle F), tailles inchangées ; « Petit prix » retiré ;
  étoile (★, sans texte) sur 3 offres : parmi celles qui atteignent les niveaux demandés, le moins de niveaux en trop sur les
  postes demandés, puis le prix le plus bas ; sans besoin indiqué, aucune étoile. Point soumis à Fabrice : une offre moins
  chère qui couvre plus que demandé n'a pas d'étoile avec cette règle.
  Puis (Fabrice, 25/11) : « les libellés, c'est juste les libellés que tu mets en vert » (noms des postes en vert),
  « retire le fond vert et met les textes des % en vert », « réduit la taille de cotisation » (1,4 rem au lieu de 1,75 ;
  « /mois » était déjà là) ; puis « Réduit la taille des cotisation c'est quoi cette taille trop grande » : 1,15 rem
  (1,1 rem sur grand écran).
- **Curseurs sur le flou, puis « Valider » (Fabrice, 25/11, après la mise en ligne du flou : « Il y a un bug dans le
  foutage et le choix des besoins / Il suffit de cliquer sur le foutage pour ouvrir les garanties en plus elle ne sont pas a
  zéro / Tu cliquer sur une et cela sélectionne une autre garanties / Mon avis le sélecteur des besoins au dessus du foutage
  devrait être pro actif / … Curseur / dentaire optique / Hospitalisation Honoraires / Avec un aperçu des niveaux de pour
  chaque poste modifie depuis le curseur / Valider »)** (demande de fusion « besoins-sur-le-flou », modèle montré à
  Fabrice). Sur le flou : les curseurs Dentaire, Optique, Hospitalisation, Honoraires (2 × 2, aussi sur téléphone), le niveau
  de chaque poste écrit au-dessus de son curseur, reliés aux curseurs du haut ; *Valider* dévoile les offres et remonte à
  leur titre ; *ou voir toutes les offres* gardé. Les offres ne se dévoilent plus d'elles-mêmes au premier curseur. Bugs
  signalés : non reproduits sur iPhone et PC simulés (toucher le flou n'ouvre rien ; curseurs à zéro au départ ; toucher le
  rail dentaire règle le dentaire seul) ; à vérifier par Fabrice sur son téléphone avec la nouvelle version.
  Avis demandé par Fabrice : mise en ligne avec mesure (Mon idée) ; « VALID2 » : compteurs Google `besoins_valides` (nombre de
  postes réglés) et `offres_sans_besoins`, seulement après accord aux cookies ; à relire dans deux semaines.
- **Offres floutées tant qu'aucun besoin n'est indiqué (Fabrice, 25/11 : « TU DOIS FLOUTER LES RESULTATS ET SUR LE FLOU
  DEMANDER / Indiquer vos besoins pour dévoiler les offres avec la photo des curseur »)** (demande de fusion
  « offres-floues », modèle montré à Fabrice). Les offres et « Plus de résultats » sont floutées et inactives ; au-dessus,
  une carte avec un dessin de trois curseurs, *Indiquez vos besoins pour dévoiler les offres* (Vos mots), un bouton
  *Choisir mes besoins* qui ramène aux curseurs, et *ou voir toutes les offres* (Mon idée, pour ne pas bloquer un visiteur
  sans besoin particulier). Le premier curseur poussé ou la première précision dévoile les offres pour toute la visite.
  Tests : les tests qui cliquent une offre la dévoilent d'abord ; nouveau test du flou (en échec sans la modification).
  Trouvé en passant : `test-comparateur.js` lit la page `maquette/comparateur-santeo.html`, qui n'est pas dans le dépôt et
  n'est reconstruite que par `build.py` sans `--site` ; depuis le 22/11 je ne la reconstruisais pas, donc ses
  « ERREURS: aucune » des demandes n° 67 à 71 portaient sur une page ancienne. Reconstruite, la suite signalait une attente
  dépassée (5 offres affichées au lieu de 6 depuis le comparateur à curseurs) : corrigée ici. Désormais : reconstruire la
  maquette avant chaque passage de `test-comparateur.js`.
- **Icône « Posez vos questions à notre IA » (Fabrice, 25/11 : « a l'emplacement de la croix rouge mettre une icone sympa
  type oiseaux sur icone whatsapp / Posez vos questions à notre IA / fait moi un modèle », puis « petit par trop gros »)**
  (demande de fusion « icone-ia »). Chaque offre : en haut à droite, l'oiseau (immobile, 34 px) avec une petite pastille
  WhatsApp et *Posez vos questions / à notre IA* (Vos mots) ; le lien ouvre WhatsApp vers la ligne 86 46 avec *Bonjour, je
  viens du comparateur du site Santéo. J'ai une question sur l'option N à X € par mois.* (Mon idée). Deux suites « ERREURS:
  aucune ». Délégué à la protection des données : Fabrice, 25/11 : « il ne faut pas rendre public le numéro de dpo » ; rien
  n'est publié sur le site à ce sujet.
- **Article du jour, 23/11 : au-delà des remboursements, téléconsultation, assistance, réseaux de soins** (demande de fusion
  « article-teleconsultation », chapitre « Choisir sa mutuelle » ; dernier sujet de la semaine « la mutuelle et ce qu'elle
  apporte » ; texte : Mon idée, rédigé par un agent, relu par Claude). Vérifié sur Service-Public : F34696 (27/06/2026 :
  conditions, parcours de soins et exceptions, vidéo ou téléphone, alternance avec le cabinet, médecin du même territoire,
  tarifs 25, 23, 30, 42,50, 50,20, 23 et 32 €, tiers payant ALD, grossesse, C2S, arrêt de travail de 3 jours au plus),
  F303 (01/09/2026 : 3 jours « en principe » pour être indemnisé, médecin traitant ou son remplaçant, sage-femme référente,
  prolongation à distance si vu en personne dans les 12 derniers mois), A18975 (loi n° 2026-534 du 25/06/2026, 3 jours
  renouvellement compris depuis le 27/06/2026), F165 (2 € de participation, exonérations, non remboursée par un contrat
  responsable), F20314 (contrat responsable « le plus couramment commercialisé », ticket modérateur des honoraires pris en
  charge, liste des services d'assistance), F33950, F33956, F34781 (100 % Santé). Par recherche seulement : ameli.fr (70 %,
  15,50 € versés pour 25 €, sociétés de téléconsultation agréées), DGCCRF, HAS, Légifrance (article L863-8 : libre choix,
  critères objectifs, pas d'exclusivité, numerus clausus des seuls opticiens, pas de modulation pour les médecins,
  information des adhérents), DREES 2024, IGAS 2017. Corrigé à la relecture : « mieux remboursée dans le parcours » remplacé
  par la phrase de Service-Public (le parcours permet le remboursement) ; « la loi a permis aux mutuelles de rembourser
  différemment » retiré (version actuelle de l'article L112-1 du code de la mutualité non vérifiée), remplacé par ce que dit
  l'article L863-8 ; espaces insécables avant € et % (un montant coupé sur téléphone). Dossier Dropbox des supports :
  toujours les 4 fichiers vides du 18/11.
- **Tchat : le pseudo dans une petite fenêtre avec l'oiseau (Fabrice, 22/11, capture de son essai : « pourquoi il garde la
  mémoire de conversatiion et le pseudo doit être plus evident un petit popup rigolo type l'oiseau / Bonjour je veux des
  renseignement / avant de faire partir popup du pseudo / comment fond les sites pour différencier les interlaucuteur dans
  les chat ??? »)** (demande de fusion « tchat-pseudo-oiseau »). Le visiteur écrit son premier message ; avant qu'il parte,
  une petite fenêtre s'ouvre dans le tchat : l'oiseau de l'en-tête qui bat des ailes et sautille, *Enchanté ! Comment puis-je
  vous appeler ?*, *Votre prénom ou un pseudo, pour qu'Antony sache à qui il répond.*, champ *Prénom ou pseudo*, bouton
  *Envoyer mon message* (textes : Mon idée). Le message attend, puis part avec le pseudo. Champ vide : la fenêtre tremble,
  rien ne part. La question et le pseudo ne sont plus des bulles du fil. Pages du guide : l'oiseau en une seule image.
  Mémoire : voulue depuis le 10/11 (« la conversation reste après rechargement »), gardée dans le navigateur du visiteur
  7 jours après le dernier message, pour qu'il retrouve la réponse d'Antony s'il quitte la page. Les autres outils de tchat
  (pages d'aide lues le 22/11) : formulaire avant le tchat (tawk.to, Zendesk, Chatwoot ; tawk.to prévient qu'il fait baisser
  le nombre de conversations), nom provisoire puis adresse e-mail demandée après le premier message (Intercom), nom passé
  par le site quand le visiteur est connecté (Crisp, HubSpot).
- **Mentions légales (Fabrice, 22/11 : « fais strictement ce qui est obligatoire et précise que nous les contactons par whatsapp
  pour respecter leur tranquillité et tu expliques les avantages »)** (demande de fusion n° 63, fusionnée par Claude) : hébergeur
  inchangé (GitHub, Inc. ; adresse et téléphone confirmés par la documentation de GitHub, le téléphone étant sa ligne
  commerciale) ; destinataires des données complétés par la catégorie obligatoire « nos prestataires techniques, qui hébergent
  le site et nos logiciels de gestion » ; paragraphe « Pourquoi WhatsApp ? » (Mon idée : tranquillité, réponse quand on veut,
  trace écrite, documents en photo, « STOP ») ; date de mise à jour au 22/11/2026. Point ouvert : l'hébergeur du CRM qui reçoit
  les demandes (Manus) n'a pas de coordonnées vérifiées ; s'il garde les données hors de l'Union européenne, il faudra le dire.
- **Décision de Fabrice (21/11, vers 10 h 40)** : « pourquoi tu ne fusionne pas directement claude cRM whatsapp le fait
  dircetemenyt », puis « validé » à « Voulez-vous que je fusionne moi-même mes demandes à partir de maintenant ? ». Claude
  fusionne désormais ses demandes après les vérifications (règle notée dans `CLAUDE.md` et dans la procédure de l'article du
  jour). Si la sécurité de la session refuse, Fabrice fusionne, comme avant.
- **Article du jour, 21/11 : tiers payant et carte de mutuelle** (demande de fusion « article-tiers-payant », chapitre
  « Comprendre les remboursements » ; texte : Mon idée, rédigé par un agent, relu par Claude). Vérifié sur Service-Public :
  F167 (vérifié le 30/10/2026 : définition, cas de droit dont la C2S, l'AME, le dépistage organisé, la grossesse, l'accident
  du travail, la contraception des moins de 26 ans, l'IVG, les victimes de terrorisme ; refus possible en pharmacie sans
  générique ; radiologie, analyses et médecin traitant au choix du professionnel ; carte Vitale à mettre à jour une fois par
  an), F20314 et F20739 (tiers payant du 100 % Santé dans les contrats responsables, depuis le 1er janvier 2022), F265
  (appli carte Vitale dans toute la France depuis novembre 2025, garder la carte physique, remboursement en une semaine),
  F11616 (feuille papier : 2 ans, exemple du 23/04/2026 au 30/06/2028 ; moins de 100 € par l'appli), F243 et A17679
  (M'T dents chaque année de 3 à 24 ans depuis le 1er avril 2025, 60 % et 40 %, sans avance de frais), F164, F200, F19948.
  Par recherche (ameli.fr) : contenu de la carte de mutuelle, convention nécessaire pour la part complémentaire, annonce de la
  mutuelle dans l'appli carte Vitale (« prochainement », 22/09/2026). Non écrit faute de source : durée de validité de la carte
  de mutuelle, délai de remboursement de la mutuelle.
- **Article du jour, 20/11 : délai de carence** (demande de fusion « article-delai-carence », chapitre « Bien choisir » ;
  texte : Mon idée, rédigé par un agent, relu par Claude). Règle centrale vérifiée dans l'instruction de la Direction de la
  sécurité sociale de 2019 : dans un contrat responsable, ni délai de carence ni clause de stage ne peuvent reporter le
  ticket modérateur (soins de ville et hôpital) ni le forfait journalier. Service-Public : contrat responsable le plus vendu,
  résiliation à tout moment après un an (F20314), 3 jours de carence des indemnités journalières (F3053), définition de la
  franchise (F31257), grossesse à 100 % dès le 6e mois (F164), mutuelle d'entreprise quelle que soit l'ancienneté (F20739),
  portabilité à l'identique (F20744). DGCCRF (par recherche) : de quelques jours à 12 mois, exemples de 9 mois (maternité,
  chambre particulière) et de 6 à 9 mois (dentaire). Commission des clauses abusives, 2017 (par recherche) : laisser croire à
  une carence sur l'hospitalisation d'un contrat responsable est abusif. Non affirmé faute de source : « pas de carence en
  mutuelle d'entreprise », durées habituelles en optique et audition.
- **Formulaire de demande et mesure du parcours (19/11, demande d'Audit Google Ads)** : essai réel sur le site en ligne
  (`?test=1`, prénom inventé, téléphone et e-mail fictifs), sur PC et téléphone à 17 h 21 : le CRM répond `ok: true` avec un
  numéro de fiche, et le visiteur voit « Merci, votre demande est bien arrivée » ; aucune erreur dans la page. Un premier essai
  avec l'ancien téléphone fictif des tests est refusé par le CRM (« ce téléphone ou cet e-mail appartient à une fiche réelle ») :
  normal pour un essai, et la raison s'affiche bien. Ajouté (demande de fusion « mesure-parcours ») : deux événements Google
  Analytics, « comparateur_resultats » (premières offres affichées) et « formulaire_ouvert » (une offre choisie), une fois par
  page, comptés seulement si le visiteur a accepté les cookies, comme « generate_lead ». Test : aucun avant la saisie, un de
  chaque après.
- **Article du jour, 19/11 : lunettes et lentilles** (demande de fusion « article-lunettes-lentilles », chapitre « Soins et
  équipements » ; texte : Mon idée, rédigé par un agent, relu par Claude). Vérifié sur Service-Public F33950 (vérifié le
  13/03/2026) : 60 %, monture 100 % Santé à 30 € au plus, validité des ordonnances (5 ans de 16 à 42 ans, 2 ans par un
  orthoptiste, 3 ans dès 43 ans, 1 an avant 16 ans), lunettes cassées avec une ordonnance de moins de 3 ans, lentilles
  remboursées pour 6 indications à 60 % d'un forfait annuel de 39,48 € par œil ; F20314 : prix limites de 42,50 € par verre
  simple et 30 € par monture. Contrat responsable (instruction de 2019) : minimums et maximums par équipement (50/420 à
  200/800 €), Assurance maladie et ticket modérateur compris, monture à 100 € au plus, un équipement tous les 2 ans dès 16 ans
  (1 an si la vue change), 1 an avant 16 ans, 6 mois jusqu'à 6 ans. Aucune base de remboursement chiffrée (celles de F33950
  semblent anciennes). Chirurgie réfractive : ameli.fr, par recherche.
- **capisante.com renvoie vers www.santeo.net (18/11)** (Fabrice : « on va trasferer capisante.com vers santeo.net »).
  Dépôt public `fabcoh/capisante-com` créé par Fabrice : petites pages de renvoi comme pour santeo.fr (accueil et toute autre
  adresse vers l'accueil, `/cgu` et `/mentions-legales` vers les mentions légales, paramètres gardés), demande de fusion n° 1
  fusionnée par Fabrice, GitHub Pages et domaine `www.capisante.com` réglés par lui. Zone DNS de capisante.com relevée avant
  (13 lignes, gardée dans le bureau privé, jamais ici) ; chez OVH, seule la ligne `www` a changé (CNAME vers
  `fabcoh.github.io.`) ; mails (Google), SPF, DKIM et autres sous-domaines intacts. `capisante.com` sans www passe encore par
  l'ancien hébergeur, qui renvoie vers www (SPF « a » à régler avant de changer cette ligne). Certificat créé à 20 h 41 après
  que Fabrice a retiré puis remis le domaine ; renvoi vérifié sur PC et téléphone à 20 h 42. « Enforce HTTPS » refusé par
  GitHub le soir même (croix rouge), à réessayer.
- **Article du jour, 18/11 : hospitalisation, chambre particulière et dépassements** (demande de fusion
  « article-hospitalisation », chapitre « Comprendre les remboursements » ; texte : Mon idée, rédigé par un agent, relu par
  Claude). Vérifié sur Service-Public : 80 % du tarif conventionnel, 100 % dès le 31e jour, en ALD, pour un nouveau-né de moins
  de 30 jours, avec la C2S ou l'AME, avec une pension d'invalidité (F200, vérifié le 01/03/2026) ; forfait de 32 € pour un
  acte d'au moins 120 €, pas de participation de 2 € en hospitalisation complète (F165) ; forfait journalier de 23 € (17 € en
  psychiatrie), jour de sortie compris (F200, A18830) ; information écrite dès 70 € d'honoraires en cas de dépassement, pas de
  dépassement à l'hôpital public, tarifs affichés (F19948, vérifié le 03/07/2026) ; contrat responsable : ticket modérateur
  et forfait journalier sans limitation de durée (F20314, instruction de 2019), dépassements des non-OPTAM limités à 100 % de
  la base. Forfait journalier inclus dans les 20 % quand ils le dépassent : article L174-4 (par recherche) et Haut Conseil pour
  l'avenir de l'assurance maladie (annexe d'octobre 2025). Retiré à la relecture : « 24 € jusqu'au 31 mars 2026 » (connu par
  recherche seulement) ; les deux forfaits de l'exemple chiffré (leur cumul n'est écrit sur aucune page officielle lue) : le
  tableau ne compte plus que le dépassement et la chambre (840 € sans mutuelle, 290 € avec le contrat fictif).
- **Article du jour, 17/11 : pourquoi prendre une mutuelle santé** (demande de fusion « article-pourquoi-mutuelle »,
  chapitre « Bien choisir », premier sujet de la semaine sur la mutuelle ; texte : Mon idée, rédigé par un agent, relu par
  Claude). Vérifié sur Service-Public : consultation de 30 € (19 € remboursés, 11 € restants sans complémentaire, 2 € avec ;
  F20314), forfait de 32 € des actes lourds et forfait patient urgences de 23 € (F165), forfait journalier de 23 € (17 € en
  psychiatrie), jour de sortie compris (F200), base de 23 € en secteur 2 hors Optam (F17042), aide auditive 100 % Santé
  (F34781), employeur à 50 % au moins (F20739), portabilité de 12 mois au plus et demande du contrat individuel dans les
  6 mois (F20744), C2S gratuite jusqu'à 10 421 € et payante jusqu'à 14 069 € pour une personne seule en métropole, de 8 € à
  30 € par mois selon l'âge (F10027 et barème de la Direction de la sécurité sociale au 1er avril 2026). Couronne 100 %
  Santé à 515 € (base 120 €) : comme le simulateur. Contrat responsable (forfait journalier, majoration hors parcours) :
  instruction de 2019. Part de la population sans complémentaire (3,4 % en 2023) : DREES, par recherche. Retiré à la
  relecture : l'exemple des lunettes (bases de Service-Public qui semblent anciennes, colonne « avec mutuelle » floue) et
  « forfait des actes lourds compris » pour le contrat responsable (même retrait que dans l'article sur les franchises).
  Titres des colonnes du tableau raccourcis : il débordait sur téléphone.
- **Décision de Fabrice (16/11, ses mots)** : « axe un peux plus les articles sur le la mutuelle et les intérets pendant 1
  semaine ». Du 17 au 23/11, les articles du jour portent sur la mutuelle et ce qu'elle apporte : sept sujets (Mon idée) en
  tête de la liste de `docs/redaction/article-du-jour.md`, avant la liste générale, qui reprend ensuite.
- **Article du jour, 16/11 : transports sanitaires** (demande de fusion « article-transports-sanitaires », chapitre « Comprendre
  les remboursements » ; texte : Mon idée, rédigé par un agent, relu par Claude). Vérifié sur Service-Public (F2951, F165,
  vérifiés le 01/10/2026 ; F34068, vérifié le 15/10/2026 ; actualités A18110 du 19/03/2025 et A17166 du 16/09/2026) :
  remboursement à 55 % du tarif de la Sécurité sociale, cas à 100 % (grossesse du 6e mois au 12e jour après l'accouchement,
  nouveau-né de moins de 30 jours, ALD, CAMSP et CMPP, C2S et AME, Alsace-Moselle), accord préalable (plus de 150 km aller,
  4 trajets de plus de 50 km aller en 2 mois, CAMSP et CMPP, avion ou bateau ; sans réponse en 15 jours, accord), franchise
  de 4 € par transport et 8 € par jour, plafond de 70 € par an, transport partagé (10 km de détour par patient, 30 km au
  plus, 45 minutes d'attente au plus ; refus : plus de tiers payant), taxi non conventionné à la charge du patient. Franchise
  passée de 2 € à 4 € le 31/03/2024 : Commission des comptes de la Sécurité sociale (mai 2024). Contrat responsable et
  ticket modérateur des transports : instruction de la Direction de la sécurité sociale de 2019 (exceptions : cures, certains
  médicaments, homéopathie). Part de 45 % laissée à l'assuré : décision publiée au Journal officiel du 1er août 2023, lue par
  recherche sur Légifrance (la date « 1er août 2023 » comme date d'application est devenue « Août 2023 » à la relecture).
  Accident du travail à 100 % : ameli.fr, par recherche. Laissé hors du texte (non confirmé) : tarif au kilomètre en voiture
  personnelle, ancien taux de 65 %, autres cas à 100 % (invalidité, rente). À revérifier début 2027 : Légifrance annonce une
  nouvelle version de l'article R160-5 au 1er janvier 2027, contenu non trouvé.
- **Article du jour, 15/11 : médecines douces** (demande de fusion « article-medecines-douces », chapitre « Comprendre les
  remboursements » ; texte : Mon idée, rédigé par un agent, relu par Claude). Vérifié sur Service-Public : ostéopathie non
  remboursée mais prise en charge par certains contrats (F20314), homéopathie plus remboursée (F21760), information sur les
  tarifs des pédicures-podologues et diététiciens (F19948), recours à la Miviludes (F31654). Dates de l'homéopathie
  (15 % au 1er janvier 2020, fin au 1er janvier 2021) : ministère de la Santé, par recherche. Retiré ou adouci à la relecture
  (sources contradictoires ou lues par recherche seulement) : l'acupuncture « remboursée si faite par un médecin » devient
  « seul un médecin peut la facturer, à vérifier avec lui » ; nombre de séances de podologie par grade et du programme
  « Mission : retrouve ton cap » retirés.
- **Garanties APRIL lues dans garanties.json (14/11, demande de la conversation pilote ; Fabrice : « oui », 16 h 51)** : le
  comparateur de Claude publie depuis 16 h 59 une section « april » dans `src/garanties.json` (11 produits). Fait (demande de
  fusion « garanties-april ») : le site lit les garanties APRIL dans cette section ; les 4 produits qu'elle ne contient pas,
  faute de document APRIL (Simply, Pro Privilège, Protect, Cap Sérénité), gardent les valeurs de la page du comparateur
  (« n.c. »), tant qu'elle les contient. Avant ce changement, le site affichait déjà ces tableaux, lus dans la page du
  comparateur : comparaison faite le 14/11, contenus identiques pour les 11 produits (garanties, extras, contrat
  responsable), seul l'ordre des clés change. Test : chaque niveau des 11 produits affiché comme dans garanties.json.
- **Article du jour, 14/11 : franchises médicales et participation forfaitaire** (demande de fusion « article-franchises »,
  chapitre « Comprendre les remboursements » ; texte : Mon idée, rédigé par un agent, relu par Claude). Vérifié sur
  Service-Public (F165, F21760, F2951, F20314, vérifiés le 01/10/2026 ; actualité A17166 du 16/09/2026) : participation de 2 €
  (8 € par jour chez un même professionnel), franchises de 1 € par boîte ou acte paramédical (4 € par jour) et 4 € par
  transport (8 € par jour), plafonds annuels de 70 € chacun depuis le 1er octobre 2026 (100 € au total auparavant, 140 €
  maintenant). Premier article écrit avec une phrase vers le comparateur et une vers le simulateur ; le test des liens entre
  articles ignore désormais « ../../ » (comparateur). Retiré à la relecture : la ligne sur le forfait de 32 € des actes
  lourds dans un contrat responsable (Service-Public : « selon le contrat » ; instruction de 2019 : prise en charge prévue).
- **Comparateur, WhatsApp et tchat dans chaque article (Fabrice, 13/11, idée d'Antony, ses mots)** : « dans chaque article
  que tu vas faire, tu vas créer au moins une phrase qui va le ramener sur le comparateur et une icône WhatsApp […] sur
  chaque blog, tu as un chat. Et enfin, tu as une icône WhatsApp pour pouvoir poser ses questions […] pour tarifer votre
  mutuelle, cliquez là ». Fait (demande de fusion « guide-tchat-whatsapp ») : sur chaque article, un encart au milieu du
  texte (avant la 3e section) : « Combien coûterait votre mutuelle ? Comparez les offres en quelques secondes […] Antony
  vous répond sur WhatsApp ou dans le tchat » (Mon idée), avec les boutons « Tarifer ma mutuelle » (comparateur) et
  « WhatsApp » ; en bas de page, « Comparer les mutuelles » et « Poser une question sur WhatsApp ». Le lien WhatsApp
  ouvre la ligne de Santéo avec un message déjà écrit qui cite la page lue. Le tchat d'Antony de l'accueil est sur toutes
  les pages du guide et sur le simulateur (mêmes réglages de l'espace admin ; provenance « Site Santéo – Guide » ; sans
  âge ni offre puisque ces pages n'ont pas de comparateur ; avatar : l'oiseau en une image, `images/oiseau.webp`).
  Les prochains articles contiendront aussi une phrase avec un lien vers le comparateur (`docs/redaction/article-du-jour.md`).
  Puis (Fabrice, 13/11, ses mots) : « Il faut aussi le mettre dans le simulateur avec un accès sur le comparateur en disant
  accéder au simulateur de remboursement Sécu. Quand il est sur le simulateur de remboursement Sécu, un accès directement au
  tarificateur ». Fait dans la même demande de fusion : sous « Les offres pour vous » du comparateur, « Combien vous serait
  remboursé un soin ? Accéder au simulateur de remboursement Sécu » ; sous le schéma du simulateur, « Pour voir le prix et
  les remboursements des mutuelles qui correspondent à votre profil, accédez directement à notre tarificateur » avec le
  bouton « Accéder au tarificateur » (textes : Mon idée).
- **Oiseau animé et en-tête sans coupure (Fabrice, 13/11, ses mots)** : « oui remets l'oiseau animé à jour mais ralenti
  de moitie son rythme », puis, avec une capture : « tu peux retirer le fond blanc du logo de santéo pour le fondre dans
  la couleur bleuté et mieux harmoniser les séparations car la on voit vraiment les coupure » et « plus en va vers la
  gauche et plus c'esr bleuté claire ». Fait (demande de fusion n° 6, « mascotte-animee », mise à jour sur main) :
  oiseau animé (vol 6,4 s, ailes 0,68 s, étoile 3,2 s : deux fois plus lent que la version du 09/11), au-dessus de la
  photo du couple ; avatar du tchat refait avec les calques de l'oiseau. Logo Santéo sans fond blanc (le blanc devient
  transparent, `maquette/outils/logo_transparent.py`), publié en fichier à part (`images/santeo-logo.webp`) ; en thème
  sombre, il garde son cadre blanc. Ciel : bleu clair à gauche, bleu du ciel à droite, sans bande blanche. Photo du
  couple refaite (`maquette/outils/couple.py`) : bords fondus des quatre côtés, plus larges à gauche ; la version du
  12/11 était fondue à droite au lieu de gauche, d'où la coupure visible côté titre.
- **Article du jour, 13/11 : la dépendance** (demande de fusion « article-dependance », chapitre « Selon votre
  situation » ; texte : Mon idée, rédigé par un agent, relu par Claude). Vérifié sur Service-Public (pages lues le 13/11) :
  APA dès 60 ans en GIR 1 à 4, plafonds mensuels 2 080,33 € / 1 682,30 € / 1 215,99 € / 811,52 €, participation nulle
  jusqu'à 933,89 € de ressources puis jusqu'à 90 % au-delà de 3 439,31 € (F10009) ; APA jamais récupérée (F11678) ;
  réduction d'impôt de 25 % sur 10 000 € en Ehpad (F17) ; crédit d'impôt de 50 % pour l'aide à domicile (F12) ;
  allocation journalière du proche aidant 66,64 € (F16920) ; expérimentation en Ehpad dans 23 territoires depuis le
  1er juillet 2025, 6,16 € par jour en 2026 (annexe du projet de loi de financement pour 2027). Retiré à la relecture :
  une phrase sur l'aide employée chez un parent bénéficiaire de l'APA (crédit ou réduction d'impôt : sources en désaccord).
- **Simulateur, dentaire (Fabrice, 13/11, ses mots, avec une capture)** : « ajoute les implants dentaire meme si l'implants
  en lui meme n'est pas rembousé certaines partie comme la couronne et autres sont remboursés […] Orthonditie adulte n'est
  pas remboursé mais certaines mutuelle peuvent prendre en charge comme révoluo REV6 RENFORT 100 qui va remboursé jusqu'à
  200% 193.50€ X 2 par semestre / endodontie et parondontie idém.. ». Fait (demande de fusion « simulateur-dentaire ») :
  implant en deux lignes (pose de l'implant : forfaits en euros ; couronne posée sur l'implant : base de 107,50 € à 60 %,
  code HBLD418, source : forum des assurés de l'Assurance maladie, par recherche, à vérifier sur le devis) ; orthodontie
  adulte : 0 € de Sécurité sociale, pourcentages de 100 à 400 % d'une base de 193,50 € par semestre (base d'un semestre
  d'enfant, Service-Public F33956 ; base utilisée par certains contrats : Vos mots) ; soins des gencives non remboursés :
  forfaits (remboursés seulement dans certains cas d'ALD, comme le diabète : Assurance maladie, par recherche) ;
  dévitalisation d'une prémolaire et d'une molaire (1 à 26 ans, F33956). L'endodontie (dévitalisation) est remboursée
  par la Sécurité sociale (60 %, F33956) ; pour les plus de 26 ans, Service-Public ne donne que l'incisive et la canine.
- **Simulateur de remboursement (Fabrice, 12/11, ses mots)** : « Crée le simulateur hyper performant et il faut récupérer
  les données et codification pour mettre en olace l'outil avec les vrais chiffres / Idem simple / Type d'acte 》 ici tu
  ajoutes les sous rubriques / Montants regle / Remboursement secu / Remboursement secu et mutuelle / 100% = … 400%= / Tu
  peux adaptées si tu as un Remboursement en € ». Fait (demande de fusion « simulateur-remboursement ») : page
  /simulateur-remboursement/ (PC et téléphone), 7 types d'acte et 32 sous-rubriques ; montant réglé modifiable ;
  remboursement Sécurité sociale, puis Sécurité sociale + mutuelle et reste à payer à 100, 130, 150, 200, 250, 300 et
  400 % de la base, ou en forfaits en euros (chambre particulière, lunettes hors 100 % Santé, lentilles, aides auditives
  de classe II, psychologue non conventionné, ostéopathe) ; schéma Sécurité sociale / mutuelle / reste à payer ; texte
  d'explication pour les internautes (Mon idée). Règles appliquées : participation forfaitaire et franchises jamais
  remboursées par un contrat responsable ; médecin non OPTAM : 20 points de moins que chez un OPTAM, 200 % au plus
  (instruction de la Direction de la sécurité sociale du 29/05/2019) ; 100 % Santé jusqu'au prix limite. Contrôlé sur
  l'exemple officiel du HCAAM (spécialiste à 65 €, garantie 200 % : 4 € de reste chez un OPTAM, 25,60 € chez un non
  OPTAM) et sur ceux de Service-Public (généraliste, médicament). Données : `maquette/simulateur/actes.json`, chaque acte
  avec ses sources ; montants d'exemple signalés comme tels.
  Pas encore dedans, faute de source officielle lisible : codes des actes (fichier CCAM d'ameli.fr, qui refuse les
  lectures automatiques ; la page de data.gouv.fr envoyée par Fabrice est bloquée par le réseau de la session, et
  l'ajout de data.gouv.fr au réseau a été refusé), analyses, radiologie, kinésithérapie, psychiatre (55 € ou 57 €
  selon la source), implants, transports. **À remettre à jour chaque année** : bases, prix limites, participation et
  franchises.
- **Un article par jour (Fabrice, 12/11, ses mots)** : « Il faut régulièrement mettre a jour le site avec les actualités et
  informations les recherches médicales et autres sujets intéressant pour la mutuelle sante / La dépendance les dispositifs
  mon psy ... / Tu dois écrire chaque jour un article que tu va s ajouter l'histoire de mieux référence le dite et aussi le
  déclare auprès des ia chat gpt et toi ». Premier article (demande de fusion « article-mon-soutien-psy ») : Mon soutien
  psy, rangé dans « Comprendre les remboursements » (texte : Mon idée, rédigé par un agent, relu par Claude). Vérifié sur
  Service-Public (F34917, A17461) : 12 séances par an, dès 3 ans, 50 € la séance sans dépassement, 60 % remboursés par
  l'Assurance maladie, 40 % pour un contrat responsable, accès sans passer par le médecin, tiers payant dans certains cas,
  tiers payant pour tous prévu par la loi de financement pour 2026 (décret attendu). Corrigé à la relecture : la date des
  changements de 2024-2025 (Service-Public les rattache au décret du 13 mai 2025, l'Assurance maladie au 15 juin 2024 :
  les deux textes sont cités sans trancher), le centre médico-psychologique (Service-Public ne parle que du psychiatre),
  une source non lue retirée. Sujet suivant prévu : la dépendance.
  Téléphone : les tableaux des articles n'imposent plus une largeur de 480 px ; à 390 px de large, 44 tableaux sur 47
  tiennent dans l'écran (avant : aucun), les plus larges défilent encore dans leur cadre.
  Déclarer le site aux IA : aucun formulaire n'existe chez ChatGPT ni chez Claude ; le fichier `robots.txt` laisse déjà
  lire tout le site à tous les robots. Pistes (Mon idée) : inscrire le site sur Bing (la recherche de ChatGPT s'appuie en
  partie sur Bing : meilleure explication, non vérifiée) et prévenir Bing à chaque nouvel article.
- **Articles pour les jeunes (12/11, demande de la conversation « Audit compte Google Ads »)** : Fabrice, ses mots
  transmis par cette conversation : « On commence le référencement naturelle » et « ce qui nous intéresse, c'est d'attirer
  les jeunes 20, 25 ans, 30 ans ». Fait (demande de fusion « articles-jeunes ») : nouveau chapitre « Jeunes et premier
  emploi » (titre et présentation : Mon idée), avec 4 articles : mutuelle jeune (20-30 ans), mutuelle étudiante (avec
  « Ce qui a changé pour les étudiants » : fin de la sécurité sociale étudiante, 2018-2019), dispense de mutuelle
  d'entreprise (CDD, apprenti, exemple de lettre écrit par Santéo), mutuelle chômeur ou jeune sans emploi. Rédaction par
  deux agents, relue par Claude (textes : Mon idée). L'ancienne adresse /devis/junior renvoie maintenant vers l'article
  mutuelle jeune ; l'article sur la mutuelle d'entreprise obligatoire renvoie vers celui sur la dispense.
  Vérifié par Claude sur les pages officielles : plafonds de la Complémentaire santé solidaire pour une personne seule en
  métropole (10 421 € gratuite, 14 069 € payante, au 1er avril 2026), 8 € par mois à 29 ans ou moins, revenus d'activité
  comptés à 70 % au chômage indemnisé, C2S payante proposée d'office avec l'allocation du contrat d'engagement jeune
  (1er juillet 2026), demande seul après 25 ans, fin du statut d'ayant droit l'année des 18 ans, régime gardé en entrant
  dans le supérieur. Points restés incertains, écrits prudemment : les pages officielles sur les dispenses datent de mai
  2024 ; aucune page ne dit en ces mots que la mutuelle n'est pas obligatoire pour un étudiant ; l'âge limite sur la
  mutuelle des parents dépend de leur contrat (déjà écrit dans l'article famille).
  **À remettre à jour chaque année** en plus : plafonds et participation de la Complémentaire santé solidaire.
- **Ciel de l'en-tête (Fabrice, 12/11, ses mots, avec une capture)** : « continu le ciel sur toute la partie pour
  harmoniser en estempant vers le titre ». Fait (demande de fusion « ciel-entete ») : bande de ciel en haut de la page, de
  la couleur du ciel de la photo, qui s'estompe vers le titre (à gauche) et vers le bas ; bords haut et gauche de la photo
  plus fondus. Thème sombre : bande bleu nuit.
- **Photo du couple (Fabrice, 12/11, ses mots, avec la photo et une maquette)** : « tu vas ajouter cette photo au site sans
  changer le site tu intégres que la partie du couple avec l'oiseu ». Fait (demande de fusion « photo-couple ») : photo
  recadrée (têtes et épaules), bords gauche et bas fondus en transparence, en haut à droite de l'en-tête sous l'oiseau déjà
  en place ; rien d'autre ne bouge. Fichier à part sur le site (`images/couple.webp`, 27 Ko), intégré dans la maquette.
  Sur les petits téléphones (moins de 360 px de large), le logo cache une partie de la photo.
- **Carte d'offre (Fabrice, 12/11, avec une capture d'une offre sur PC ; ses mots)** : « il faudrait que cette offre
  m'intéresse soit placée plutôt au milieu, tu vois, ou vers la droite, dans le coin droit […] détail et cette offre
  m'intéresserait placée sur la même ligne […] que la ligne ne garde pas cet aspect ce carré. Ça s'agrandit au fur et à
  mesure qu'il coche sur des options ». Fait (demande de fusion « carte-offre ») : les deux boutons sur une ligne, en bas à
  droite ; nom et prix à gauche, garanties à droite ; repère de contrôle à gauche de la ligne des boutons ; sur PC, une option
  cochée ajoute une seule ligne (« Verres complexes 200 € »). Hauteur sur PC : 122 px au lieu de 188 au départ ; téléphone
  inchangé, sauf les boutons alignés à droite.
- **Décision de Fabrice (12/11, ses mots, avec une capture du bas de l'accueil sur téléphone)** : « Je ne veux pas tout
  ses titres / Tu fois les intégrer dans guide de la mutuelle ». Le bas de l'accueil ne montre plus les titres des
  articles : il garde seulement le lien « Guide de la mutuelle » du pied de page ; les titres restent dans le sommaire du
  guide (par chapitre). Annule la partie « liens vers les 11 articles en bas de l'accueil » du lot « accueil-leger ».
- **Reprise des anciennes pages** (demande de fusion « anciennes-pages », Fabrice, ses mots : « Tu reprennes ces pages, tu
  les corriges, tu les améliores et tu les mets dans les bons chapitres ou tu crées des chapitres différents. […] Tu peux
  faire de la progressivité sur les anciennes en disant ce qu'il y avait avant et ce qu'il y a maintenant ») : les 34
  anciennes pages (29 actualités 2010-2023, 5 questions), retrouvées dans le dépôt privé `santeo-net` (lecture seule) et
  montrées à Fabrice dans une page privée, sont reprises en 14 nouveaux articles et 7 parties « avant / maintenant »
  ajoutées aux articles existants : 25 articles en tout. Rédaction par quatre agents, relue par Claude (textes : Mon idée).
  Guide rangé en six chapitres (`maquette/chapitres.json`, champ `chapitre` de chaque article) : sommaire par chapitre avec
  un menu en tête, fil d'Ariane avec le chapitre, « À lire aussi » du même chapitre, bas de l'accueil groupé par chapitre.
  Chaque ancienne adresse renvoie maintenant vers sa nouvelle version (`maquette/renvois.json`) ; seules les annonces de
  produits de 2011-2012, la grippe H1N1, la FAQ et les pages de rubrique restent vers l'accueil ou le guide. Pas d'article
  pour les jeunes : prévu par la conversation Google Ads (l'ancienne adresse /devis/junior pourra y renvoyer).
  Vérifié en plus par Claude : forfait de 32 € sur les actes lourds (1er avril 2026), forfait journalier de 23 €, plafonds
  des franchises à 70 € (1er octobre 2026), règles du démarchage (11 août 2026), gel des cotisations 2026 censuré par le
  Conseil constitutionnel (décision QPC du 23 octobre 2026), contribution de 2,05 % en 2026. Corrigé à la relecture :
  avis d'échéance « moins de 15 jours avant l'échéance » (texte officiel), date de la consultation à 26,50 €, service de
  relecture de Santéo décrit au conditionnel remplacé par ce que le site permet vraiment (tchat, devis).
  **À remettre à jour chaque année** en plus : forfaits hospitaliers, franchises, taxe et contribution des complémentaires.
- **Correction (11/11, après publication de « accueil-leger »)** : sur les articles, les polices chargées sans blocage
  faisaient bouger le texte à leur arrivée (décalage mesuré en ligne 0,11 à 0,14, au-dessus du seuil de 0,1 de Google ;
  0 avant). Les articles reviennent au chargement d'avant (ils s'affichent en moins d'une seconde) ; l'accueil garde le
  chargement sans blocage (décalage 0,06, contenu principal affiché en 1,9 s au lieu de 2,7 s sur téléphone lent simulé).

## Prochains lots proposés (chacun validé par Fabrice avant le suivant)

1. Mettre la source de la maquette dans ce dépôt : dossier `maquette/` (demande de fusion du 08/11/2026).
2. Une version de test du site sur GitHub Pages, sur PC et téléphone : publication automatique préparée le 08/11/2026
   (`.github/workflows/site-de-test.yml`), à activer par Fabrice dans les réglages du dépôt (Pages → GitHub Actions).
3. Le formulaire relié au CRM Santéo.
4. Les pages pour le référencement (Google et moteurs d'IA).
5. Le changement d'adresse dans OVH, ligne par ligne, sans toucher aux mails.
