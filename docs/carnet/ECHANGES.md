# Carnet de la conversation « Santeo.net site » (Claude site)

Ce carnet garde tout ce qui ne doit pas dépendre de la mémoire d'une conversation : demandes aux autres
conversations, décisions de Fabrice, points ouverts. Les entrées adressées aux autres conversations
sont **en haut**, la plus récente d'abord.

Les citations entre « » sont **les mots exacts de Fabrice** (fautes de frappe comprises) ; les noms
de conversations aussi sont entre « ». Les textes affichés dans la maquette sont en *italique*. Le reste
est résumé par Claude.

---

## Entrées pour les autres conversations

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
Reste :
- `santeo.net` sans www : certificat de GitHub pas encore créé à 10 h 26 (Paris) le 11/11 (`https://santeo.net` affiche
  une alerte ; `www` et la saisie de `santeo.net` dans Chrome marchent). Plus tard, ajouter éventuellement les trois autres
  adresses de GitHub Pages pour la ligne `@` ;
- santeo.fr : renvoi vers www.santeo.net par un petit site GitHub (accord de Fabrice, « oui », 11/11), après la mise en
  ligne ; santeo.fr n'a qu'une page d'attente OVH et ses lignes mail (MX, SPF) resteront en place ; le comparateur
  utilise capisante.fr, pas santeo.fr (« je me suis trompé je crois que c'est capisante.fr qui gère le comparateur »).


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
- Attendu de Fabrice : l'identifiant de mesure « G-… » (public, pas un secret) de la propriété Google Analytics de
  www.santeo.net, créée avec le compte Google de Google Ads.
- Compte Google Ads (capture du 11/11) : 4 anciennes campagnes de 2022, en pause, aucune annonce diffusée. Conditions de
  l'avoir de 400 € à vérifier par Fabrice (Facturation, Promotions). Accès de Claude à Google Ads : par un connecteur
  claude.ai (à brancher par Fabrice), lu seulement au démarrage d'une conversation.
- Les chiffres de visites ne s'écrivent jamais dans ce dépôt public.

## Prochains lots proposés (chacun validé par Fabrice avant le suivant)

1. Mettre la source de la maquette dans ce dépôt : dossier `maquette/` (demande de fusion du 08/11/2026).
2. Une version de test du site sur GitHub Pages, sur PC et téléphone : publication automatique préparée le 08/11/2026
   (`.github/workflows/site-de-test.yml`), à activer par Fabrice dans les réglages du dépôt (Pages → GitHub Actions).
3. Le formulaire relié au CRM Santéo.
4. Les pages pour le référencement (Google et moteurs d'IA).
5. Le changement d'adresse dans OVH, ligne par ligne, sans toucher aux mails.
