# Carnet de la conversation « Santeo.net site » (Claude site)

Ce carnet garde tout ce qui ne doit pas dépendre de la mémoire d'une conversation : demandes aux autres
conversations, décisions de Fabrice, points ouverts. Les entrées adressées aux autres conversations
sont **en haut**, la plus récente d'abord.

Les citations entre « » sont **les mots exacts de Fabrice** (fautes de frappe comprises) ; les noms
de conversations aussi sont entre « ». Les textes affichés dans la maquette sont en *italique*. Le reste
est résumé par Claude.

---

## Entrées pour les autres conversations

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
  compagnie. Intitulé dans la maquette : *Simulez sans vous dévoiler : indiquez juste votre âge, CP, régime*.
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
- Services internes de l'ancien comparateur qui passent encore par www.santeo.net : à déplacer avant le
  changement d'adresse (à voir avec les conversations concernées).

## Prochains lots proposés (chacun validé par Fabrice avant le suivant)

1. Mettre la source de la maquette dans ce dépôt.
2. Une version de test du site sur GitHub Pages, sur PC et téléphone.
3. Le formulaire relié au CRM Santéo.
4. Les pages pour le référencement (Google et moteurs d'IA).
5. Le changement d'adresse dans OVH, ligne par ligne, sans toucher aux mails.
