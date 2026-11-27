# L'article du jour du Guide de la mutuelle

Demande de Fabrice (12/11/2026, ses mots) : « Tu dois écrire chaque jour un article », sur « les actualités et informations
les recherches médicales et autres sujets intéressant pour la mutuelle sante / La dépendance les dispositifs mon psy ».
À la question « Êtes-vous d'accord pour que je mette chaque article en ligne moi-même, après vérification, et que je vous
envoie le lien chaque jour ? », il a répondu : « Oui fais automatiquemt un article ».

Ce fichier est la procédure. Il ne dépend d'aucune conversation : une conversation qui reprend le travail le lit d'abord.

## Chaque jour
1. **Choisir le sujet** dans la liste « Sujets » ci-dessous (le premier non fait), ou une actualité officielle du
   moment (Service-Public, rubrique actualités) qui touche les remboursements ou la complémentaire santé. Vérifier
   qu'aucun article de `maquette/guide/` ne traite déjà le sujet.
2. **Rédiger** (un agent peut le faire) selon les règles ci-dessous, dans un dossier de travail hors du dépôt.
3. **Relire et vérifier chaque chiffre** sur la page officielle téléchargée (date « Vérifié le »). Corriger ou retirer
   ce qui n'est pas confirmé.
4. **Intégrer** : `python3 -I maquette/outils/integrer-article.py <dossier> maquette <slug> <chapitre> <ordre> <date>`
   (`ordre` : le plus grand des articles existants + 1 ; chapitre : un `id` de `maquette/chapitres.json`).
5. **Vérifier** : les deux suites de tests (`maquette/README.md`) affichent `ERREURS: aucune` ; captures sur PC et
   téléphone (l'article dans le sommaire, aucune page qui déborde).
6. **Carnet** (`docs/carnet/ECHANGES.md`) : une ligne par article (sujet, chiffres vérifiés, corrections).
7. **Branche, demande de fusion, fusion**. Depuis le 21/11/2026, Claude fusionne lui-même après les vérifications
   (Fabrice : « validé »), attend la publication, vérifie l'article en ligne sur PC et téléphone, puis envoie à Fabrice le lien
   de l'article en ligne. Si la sécurité de la session refuse la fusion (comme le 12/11/2026), envoyer le lien de la demande
   à Fabrice, qui fusionne.
8. **Bureau commun** : mettre à jour la ligne de l'article du jour dans le fichier de tâches de la conversation.

## Règles de rédaction
- **Exactitude d'abord** (site d'un courtier, profession réglementée). Un chiffre n'entre dans le texte que s'il est
  confirmé par une source officielle à jour : Service-Public d'abord (lecture directe possible), securite-sociale.fr,
  complementaire-sante-solidaire.gouv.fr, impots.gouv.fr. Les sites qui refusent les lectures automatiques (ameli.fr,
  legifrance.gouv.fr, economie.gouv.fr, sante.gouv.fr) ne se consultent que par la recherche, sans jamais contourner ce
  refus, et sont cités comme tels. Ce qui n'est pas confirmé ne s'écrit pas.
- **Santé** : aucun conseil médical, renvoi vers le médecin. Une recherche médicale ne se cite que depuis une source
  institutionnelle (Inserm, Haute Autorité de santé, Santé publique France, Assurance maladie, ministère).
- **Le rôle de la mutuelle** : dire ce que l'Assurance maladie rembourse, ce qui reste à payer et ce qu'une
  complémentaire peut prendre en charge, en général.
- **Ton** : vouvoiement, neutre, phrases courtes, jargon expliqué. Aucun nom d'assureur ni de mutuelle, aucun prix
  d'offre, aucune promesse (« le moins cher », « garanti », « meilleur »). Les textes sont « Mon idée » de Claude.
- **Longueur** : 900 à 1 400 mots hors tableaux et sources ; 4 à 7 sections ; 4 à 6 questions fréquentes. Une section
  « Ce qui a changé » seulement si une règle a vraiment changé.
- **Liens** : 2 à 4 liens vers des articles du guide (`../<slug>/`), jamais dans un titre, la FAQ ou les sources.
- **Vers le comparateur et Antony** (Fabrice, 13/11/2026, idée d'Antony) : dans le texte, au moins une phrase avec un lien vers
  le comparateur (`<a href="../../">…</a>`, par exemple « pour connaître le prix de votre mutuelle, comparez les offres »),
  et de temps en temps une invitation à poser sa question à Antony. La construction ajoute d'elle-même, sur chaque article,
  un encart « Combien coûterait votre mutuelle ? » (comparateur et WhatsApp), le bouton WhatsApp en bas de page et le tchat.
- **Dépôt public** : aucun chiffre de visites ni de recherches, aucun nom, numéro ou adresse de client.

## Format
- `<slug>.html` : un fragment (h1, `p.chapo` de 2 phrases, sections h2, `section.faq` avec des `details/summary`,
  `section.sources` avec les liens officiels). Balises permises : h1, h2, h3, p, ul, ol, li, strong, em, a, table,
  thead, tbody, tr, th, td.
- `<slug>.json` de travail : `slug`, `titre_page` (60 caractères au plus), `description` (150 au plus), `h1`, `lien`
  (40 au plus), `faq` (`[{"q","r"}]`, identique au HTML), `mots_cles`, `points_incertains`. Seuls les champs publics
  sont copiés dans le dépôt par le script d'intégration.

## Sujets (Mon idée, dans l'ordre ; cocher quand l'article est en ligne)
### Semaine du 17 au 23/11/2026 : la mutuelle et ce qu'elle apporte
Demande de Fabrice (16/11/2026, ses mots) : « axe un peux plus les articles sur le la mutuelle et les intérets pendant 1 semaine ».
Les sept sujets sont Mon idée ; chacun dit ce que l'Assurance maladie rembourse, ce qui reste à payer et ce qu'une
complémentaire peut apporter, sans promesse. Après le 23/11, reprendre la liste générale ci-dessous.
- [x] Pourquoi prendre une mutuelle santé : ce qui reste à payer sans complémentaire (17/11/2026)
- [x] Hospitalisation : chambre particulière, dépassements d'honoraires, ce que rembourse la mutuelle (18/11/2026)
- [x] Lunettes et lentilles : remboursement de la Sécurité sociale et de la mutuelle (19/11/2026)
- [x] Le délai de carence (délai d'attente) d'une mutuelle : ce qu'il faut savoir (20/11/2026)
- [x] Le tiers payant et la carte de mutuelle : ne pas avancer les frais (21/11/2026)
- [x] Lire son tableau de garanties : pourcentages, forfaits en euros, plafonds (22/11/2026)
- [x] Au-delà des remboursements : téléconsultation, assistance, réseaux de soins (23/11/2026)

### Liste générale
- [x] Mon soutien psy : séances chez le psychologue (12/11/2026)
- [x] La dépendance : perte d'autonomie, APA, ce que couvrent la Sécurité sociale et les contrats (13/11/2026)
- [x] Les franchises médicales et la participation forfaitaire (14/11/2026)
- [x] Les médecines douces (ostéopathe, etc.) : ce que rembourse une complémentaire (15/11/2026)
- [x] Les transports sanitaires : quand ils sont remboursés (16/11/2026)
- [x] La prévention et le dépistage remboursés (vaccins, examens) (27/11/2026)
- [ ] L'affection de longue durée (ALD) : ce qui reste à payer
- [ ] La maternité : remboursements de la grossesse et de l'accouchement
- [ ] Les soins à l'étranger : carte européenne et complémentaire
- [ ] Le dentaire des enfants et des jeunes : examens de prévention
