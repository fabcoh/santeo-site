# Carnet de la conversation « Santeo.net site » (Claude site)

Ce carnet garde tout ce qui ne doit pas dépendre de la mémoire d'une conversation : demandes aux autres
conversations, décisions de Fabrice, points ouverts. Les entrées adressées aux autres conversations
sont **en haut**, la plus récente d'abord.

Les citations entre « » sont **les mots exacts de Fabrice** (fautes de frappe comprises) ; les noms
de conversations aussi sont entre « ». Les textes affichés dans la maquette sont en *italique*. Le reste
est résumé par Claude.

---

## Entrées pour les autres conversations

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
  Date de naissance, code postal (et date du conjoint) : fond rouge pâle tant qu'ils sont vides ou incomplets, pour
  montrer où remplir (demande de Fabrice, 09/11/2026).
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
- Étape 2 : le volet *Précisez* devient une petite fenêtre accrochée au poste, qui se ferme seule après 4 secondes
  sans action.
- Étape 3 : 5 offres, puis *Plus de résultats* qui affiche tout ; le détail d'une offre s'ouvre en fenêtre, sous forme
  de tableau (postes en gras, sous-postes en normal) ; les logos des compagnies et leur vague animée (avec étoile et
  *IA*) sont sous les résultats.
- Étape 4 : formulaire mis en avant ; pas de nom fictif dans les champs (« ne pas mettre de nom fictif »).
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

## Prochains lots proposés (chacun validé par Fabrice avant le suivant)

1. Mettre la source de la maquette dans ce dépôt : dossier `maquette/` (demande de fusion du 08/11/2026).
2. Une version de test du site sur GitHub Pages, sur PC et téléphone : publication automatique préparée le 08/11/2026
   (`.github/workflows/site-de-test.yml`), à activer par Fabrice dans les réglages du dépôt (Pages → GitHub Actions).
3. Le formulaire relié au CRM Santéo.
4. Les pages pour le référencement (Google et moteurs d'IA).
5. Le changement d'adresse dans OVH, ligne par ligne, sans toucher aux mails.
