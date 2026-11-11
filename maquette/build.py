# Construit la page du comparateur.
#   python3 -I maquette/build.py maquette <copie de santeo-tarifs>                              -> maquette/comparateur-santeo.html (maquette)
#   python3 -I maquette/build.py maquette <copie de santeo-tarifs> --site <dossier>              -> site de test
#   python3 -I maquette/build.py maquette <copie de santeo-tarifs> --site <dossier> --en-ligne   -> www.santeo.net
# La version « site » est un dossier complet (téléphone compris) sans les éléments réservés à la maquette (noms des
# formules, gestion des compagnies, notes) : index.html, mentions-legales/, 404.html, robots.txt, sitemap.xml, images.
# Site de test : caché aux moteurs de recherche, avec un bandeau « version de test ». En ligne : visible, sans bandeau.
# L'adresse du CRM qui reçoit les demandes et le repli éventuel sont dans maquette/reglages-site.json
# (--envoi <adresse> et --repli <mode> les remplacent, pour les essais).
import glob, json, os, re, shutil, sys, datetime
S, R = sys.argv[1], sys.argv[2]
def option(nom, defaut=None): return sys.argv[sys.argv.index(nom) + 1] if nom in sys.argv else defaut
SITE = option("--site")
EN_LIGNE = "--en-ligne" in sys.argv
ADRESSE = "https://www.santeo.net/" if EN_LIGNE else "https://fabcoh.github.io/santeo-site/"
reglages = json.load(open(S + "/reglages-site.json", encoding="utf-8"))
ENVOI = option("--envoi", reglages["envoi_crm"]); REPLI = option("--repli", reglages["repli"])
TCHAT = option("--tchat", reglages.get("tchat", "aucun")); TCHAT_CRM = option("--tchat-crm", reglages.get("tchat_crm", ""))
# Statistiques Google (identifiant de mesure « G-… », public) : chargées seulement après l'accord du visiteur (bandeau cookies)
GOOGLE = option("--google", reglages.get("google_mesure", ""))
if GOOGLE and not re.fullmatch(r"G-[A-Z0-9]{4,20}", GOOGLE): sys.exit("identifiant de mesure Google invalide : " + GOOGLE)
assert TCHAT in ("direct", "aucun"), TCHAT   # le tchat n'ouvre jamais WhatsApp chez le visiteur
assert TCHAT_CRM == "" or TCHAT_CRM.startswith("https://"), "l'adresse du tchat doit commencer par https://"
assert ENVOI == "" or ENVOI.startswith("https://"), "l'adresse du CRM doit commencer par https://"
assert REPLI in ("", "whatsapp"), REPLI
t = open(S + "/template.html", encoding="utf-8").read()
moteur = open(R + "/src/moteur.js", encoding="utf-8").read()
tarifs = json.load(open(R + "/src/tarifs_all.json", encoding="utf-8"))
g = json.load(open(R + "/src/garanties.json", encoding="utf-8"))
keep = ["MCCINOVA","FLEXIA","SOLENCIA","CAPEVO","CAPNR","REV","RF50","RF100","MV","LPSH","TALIS"]
tarifs = {k: v for k, v in tarifs.items() if k not in ("DOCSMD",)}
gammes = g["gammes"]
extras = {k: dict(g["extras"][k]) for k in keep if k in g["extras"]}
def js(o): return json.dumps(o, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
out = t.replace("__MOTEUR__", moteur.replace("</", "<\\/")).replace("__TARIFS__", js(tarifs)).replace("__GAMMES__", js(gammes)).replace("__EXTRAS__", js(extras))
logos = json.load(open(S + "/logos/logos.json"))
out = out.replace("__LOGOS__", "".join('<span class="logo-box" data-co="%s"><img src="%s" alt="%s"></span>' % (l["nom"], l["src"], l["nom"]) for l in logos))
out = out.replace("__SANTEO_LOGO__", open(S + "/logos/santeo.b64").read().strip())
out = out.replace("__SANTEO_MASQUE__", open(S + "/logos/santeo-masque.b64").read().strip())
out = out.replace("__MASCOTTE__", open(S + "/logos/mascotte.b64").read().strip())
out = out.replace("__COMETE_D__", open(S + "/logos/comete-trajet.txt").read().strip())
for repere, valeur in (("__MODE__", "site" if SITE else "maquette"), ("__ENVOI__", ENVOI if SITE else ""), ("__REPLI__", REPLI if SITE else ""),
                       ("__TCHAT_MODE__", TCHAT if SITE else "aucun"), ("__TCHAT_CRM__", TCHAT_CRM if SITE else ""),
                       ("__GOOGLE__", GOOGLE if SITE else "")):
    assert out.count(repere) == 1, repere
    out = out.replace(repere, valeur.replace('"', ""))
if SITE is None:
    out = out.replace('<a href="guide/">Guide de la mutuelle</a> · ', '')   # la maquette (page seule) n'a pas de guide
    open(S + "/comparateur-santeo.html", "w", encoding="utf-8").write(out)
    print("taille", len(out.encode()), "octets")
else:
    # Textes pour Google et pour l'aperçu de partage (WhatsApp, réseaux) : Mon idée, à valider par Fabrice
    TITRE = "Comparateur mutuelle santé | Santéo, courtier depuis 1992"
    DESCRIPTION = ("Comparez les mutuelles santé en quelques secondes : votre date de naissance et votre code postal "
                   "suffisent. Tarifs de nos assureurs partenaires et conseil gratuit d'un courtier depuis 1992.")
    def att(t): return t.replace("&", "&amp;").replace('"', "&quot;").replace("<", "&lt;")
    fiche = {"@context": "https://schema.org", "@type": "InsuranceAgency", "name": "Santéo", "legalName": "CAPI FINANCE",
             "url": ADRESSE, "logo": ADRESSE + "icone-180.png", "image": ADRESSE + "partage.jpg",
             "description": DESCRIPTION, "foundingDate": "1992", "telephone": "+33 1 53 19 17 17", "email": "gestion@santeo.net",
             "address": {"@type": "PostalAddress", "streetAddress": "72 rue du Rendez-vous", "postalCode": "75012",
                         "addressLocality": "Paris", "addressCountry": "FR"},
             "identifier": [{"@type": "PropertyValue", "propertyID": "ORIAS", "value": "07001983"},
                            {"@type": "PropertyValue", "propertyID": "SIREN", "value": "388103301"}],
             "areaServed": "FR"}
    tete = ('<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
            + ('<meta name="robots" content="index, follow">\n' if EN_LIGNE else '<meta name="robots" content="noindex, nofollow">\n'))
    entete = ('<title>%s</title>\n<meta name="description" content="%s">\n<link rel="canonical" href="%s">\n'
              '<meta name="theme-color" content="#0a7aa5">\n'
              '<link rel="icon" type="image/png" sizes="48x48" href="icone-48.png">\n<link rel="apple-touch-icon" href="icone-180.png">\n'
              '<meta property="og:type" content="website">\n<meta property="og:site_name" content="Santéo">\n<meta property="og:locale" content="fr_FR">\n'
              '<meta property="og:title" content="%s">\n<meta property="og:description" content="%s">\n<meta property="og:url" content="%s">\n'
              '<meta property="og:image" content="%spartage.jpg">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n'
              '<meta property="og:image:alt" content="Santéo : comparez votre mutuelle santé">\n<meta name="twitter:card" content="summary_large_image">\n'
              '<script type="application/ld+json">%s</script>\n'
              % (att(TITRE), att(DESCRIPTION), ADRESSE, att(TITRE), att(DESCRIPTION), ADRESSE, ADRESSE, js(fiche)))
    assert out.count("<title>Comparateur Santéo</title>") == 1
    out = out.replace("<title>Comparateur Santéo</title>", entete, 1)
    retrait = ('<style>/* Site : éléments réservés à la maquette retirés */'
               '.o-real,#admin,details.notes,.a-confirmer{display:none!important}'
               '.bandeau-test{background:var(--warn-soft);color:var(--warn);border:1px dashed var(--warn);border-radius:8px;'
               'padding:.5rem .8rem;font-size:.88rem;text-align:center}</style>\n')
    out = out.replace("</style>", "</style>\n" + retrait, 1)
    if not EN_LIGNE:
        bandeau = '<div class="wrap">\n  <p class="bandeau-test" role="note">Version de test du nouveau site Santéo.</p>'
        assert out.count('<div class="wrap">') == 1
        out = out.replace('<div class="wrap">', bandeau, 1)
    page = tete + out + "\n</html>\n"
    os.makedirs(os.path.join(SITE, "mentions-legales"), exist_ok=True)
    def ecrire(nom, texte): open(os.path.join(SITE, nom), "w", encoding="utf-8").write(texte)
    ecrire("index.html", page)
    for f in ("partage.jpg", "icone-48.png", "icone-180.png"): shutil.copyfile(S + "/images-site/" + f, os.path.join(SITE, f))
    # Les devis envoyés par l'ancien comparateur affichent le logo depuis www.santeo.net/images/Logo_santeo_pt.png :
    # cette adresse est gardée (logo Santéo actuel, fond blanc, aux proportions de l'emplacement du mail : 166 x 68).
    os.makedirs(os.path.join(SITE, "images"), exist_ok=True)
    shutil.copyfile(S + "/images-site/logo-mail.png", os.path.join(SITE, "images", "Logo_santeo_pt.png"))
    # Petites pages de renvoi : /mentions-legales (citée dans les devis du comparateur) et toute ancienne adresse (404)
    def renvoi(cible, titre, texte, robots):
        return ('<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
                '<meta name="robots" content="%s">\n<title>%s</title>\n<link rel="icon" type="image/png" href="%sicone-48.png">\n'
                '<meta http-equiv="refresh" content="0; url=%s">\n<script>location.replace("%s")</script>\n</head>\n'
                '<body style="font-family:system-ui,sans-serif;margin:2rem;color:#0f2430;background:#fff">\n<p>%s <a href="%s">Continuer</a></p>\n</body>\n</html>\n'
                % (robots, titre, ADRESSE, cible, cible, texte, cible))
    ecrire("mentions-legales/index.html", renvoi(ADRESSE + "#mentions-legales", "Mentions légales | Santéo",
                                                 "Les mentions légales de Santéo sont sur la page d'accueil.", "noindex, follow"))
    ecrire("404.html", renvoi(ADRESSE, "Santéo", "Cette page n'existe plus : le comparateur Santéo est sur la page d'accueil.", "noindex, follow"))
    # ---------- Guide de la mutuelle : articles (maquette/guide/<slug>.html + <slug>.json) -> /guide/ et /guide/<slug>/
    def bloc(debut, fin):
        m = re.search(re.escape(debut) + r"(.*?)" + re.escape(fin), t, re.S)
        assert m, debut
        return m.group(1)
    art_t = open(S + "/article.html", encoding="utf-8").read()
    ck_css = bloc("/* debut-css-cookies */", "/* fin-css-cookies */")
    ck_html = bloc("<!-- debut-html-cookies -->", "<!-- fin-html-cookies -->")
    ck_js = bloc("/* debut-js-cookies */", "/* fin-js-cookies */").replace("__GOOGLE__", GOOGLE)
    articles = []
    for f in sorted(glob.glob(S + "/guide/*.json")):
        a = json.load(open(f, encoding="utf-8"))
        a["contenu"] = open(f[:-5] + ".html", encoding="utf-8").read().strip()
        articles.append(a)
    articles.sort(key=lambda a: (a.get("ordre", 99), a["slug"]))
    AUJ = datetime.date.today().isoformat()
    MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"]
    def date_fr(iso): a, m, j = iso.split("-"); return "%d %s %s" % (int(j), MOIS[int(m) - 1], a)
    editeur = {"@type": "Organization", "name": "Santéo (CAPI FINANCE)", "url": ADRESSE, "logo": {"@type": "ImageObject", "url": ADRESSE + "icone-180.png"}}
    CTA = ('<aside class="cta"><p>Comparez les mutuelles santé en quelques secondes : votre date de naissance et votre code postal suffisent.</p>'
           '<a class="btn" href="__RACINE__">Comparer les mutuelles</a></aside>')
    def page_guide(racine, url, titre, desc, fil, contenu, ld, og):
        h = art_t
        for k, v in (("__COOKIES_CSS__", ck_css), ("__COOKIES_HTML__", ck_html.replace('href="#mentions-legales"', 'href="' + racine + '#mentions-legales"')),
                     ("__COOKIES_JS__", ck_js), ("__CONTENU__", contenu), ("__FIL__", fil), ("__JSONLD__", js(ld)),
                     ("__ROBOTS__", "index, follow" if EN_LIGNE else "noindex, nofollow"), ("__TITRE__", att(titre)),
                     ("__DESCRIPTION__", att(desc)), ("__CANONIQUE__", url), ("__OG_TYPE__", og), ("__ADRESSE__", ADRESSE)):
            h = h.replace(k, v)
        h = h.replace("__RACINE__", racine)
        assert not re.search(r"__[A-Z][A-Z_]*__", h), re.findall(r"__[A-Z][A-Z_]*__", h)
        return h
    for a in articles:
        url = ADRESSE + "guide/" + a["slug"] + "/"
        maj = a.get("maj", AUJ)
        corps = re.sub(r"(<table.*?</table>)", r'<div class="tableau">\1</div>', a["contenu"], flags=re.S)
        autres = "".join('<li><a href="../%s/"><strong>%s</strong><span>%s</span></a></li>' % (b["slug"], b["h1"], b["description"])
                         for b in articles if b is not a)
        contenu = ('<article>\n%s\n<p class="maj">Mis à jour le %s · Santéo (CAPI FINANCE), courtier en assurance santé depuis 1992. '
                   "Ces informations sont générales : seuls les textes officiels et les documents de votre contrat font foi.</p>\n</article>\n"
                   % (corps, date_fr(maj))) + CTA + ('\n<section><h2>À lire aussi</h2><ul class="liste">%s</ul></section>' % autres if autres else "")
        ld = {"@context": "https://schema.org", "@graph": [
            {"@type": "Article", "headline": a["h1"], "description": a["description"], "inLanguage": "fr-FR",
             "datePublished": a.get("publie", maj), "dateModified": maj, "mainEntityOfPage": url, "author": editeur, "publisher": editeur},
            {"@type": "BreadcrumbList", "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Accueil", "item": ADRESSE},
                {"@type": "ListItem", "position": 2, "name": "Guide de la mutuelle", "item": ADRESSE + "guide/"},
                {"@type": "ListItem", "position": 3, "name": a["h1"], "item": url}]}]
            + ([{"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q["q"], "acceptedAnswer": {"@type": "Answer", "text": q["r"]}}
                                                    for q in a["faq"]]}] if a.get("faq") else [])}
        fil = '<a href="../../">Accueil</a> › <a href="../">Guide de la mutuelle</a> › <span>%s</span>' % a["h1"]
        os.makedirs(os.path.join(SITE, "guide", a["slug"]), exist_ok=True)
        ecrire("guide/%s/index.html" % a["slug"], page_guide("../../", url, a["titre_page"], a["description"], fil, contenu, ld, "article"))
    if articles:
        liste = "".join('<li><a href="%s/"><strong>%s</strong><span>%s</span></a></li>' % (a["slug"], a["h1"], a["description"]) for a in articles)
        g_titre = "Guide de la mutuelle santé : comprendre et choisir | Santéo"
        g_desc = "Contrat responsable, Complémentaire santé solidaire, surcomplémentaire, remboursements : les explications simples de Santéo, courtier depuis 1992."
        contenu = ('<h1>Guide de la mutuelle santé</h1>\n<p class="chapo">Des explications simples pour comprendre votre complémentaire santé et '
                   'choisir sans vous tromper, rédigées par Santéo, courtier en assurance santé depuis 1992.</p>\n<ul class="liste">%s</ul>\n' % liste) + CTA
        ld = {"@context": "https://schema.org", "@type": "CollectionPage", "name": "Guide de la mutuelle santé", "url": ADRESSE + "guide/",
              "inLanguage": "fr-FR", "publisher": editeur,
              "hasPart": [{"@type": "Article", "headline": a["h1"], "url": ADRESSE + "guide/" + a["slug"] + "/"} for a in articles]}
        ecrire("guide/index.html", page_guide("../", ADRESSE + "guide/", g_titre, g_desc,
                                              '<a href="../">Accueil</a> › <span>Guide de la mutuelle</span>', contenu, ld, "website"))
    ecrire("robots.txt", ("User-agent: *\nAllow: /\nSitemap: %ssitemap.xml\n" % ADRESSE) if EN_LIGNE else "User-agent: *\nDisallow: /\n")
    pages = [(ADRESSE, AUJ)] + ([(ADRESSE + "guide/", max(a.get("maj", AUJ) for a in articles))] if articles else []) \
            + [(ADRESSE + "guide/" + a["slug"] + "/", a.get("maj", AUJ)) for a in articles]
    ecrire("sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
           + "".join('  <url><loc>%s</loc><lastmod>%s</lastmod></url>\n' % p for p in pages) + '</urlset>\n')
    print("site", "EN LIGNE" if EN_LIGNE else "de test", ":", SITE, len(page.encode()), "octets ;",
          "envoi vers le CRM" if ENVOI else ("repli " + REPLI if REPLI else "aucun envoi"))
