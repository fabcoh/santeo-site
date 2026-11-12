# Construit la page du comparateur.
#   python3 -I maquette/build.py maquette <copie de santeo-tarifs>                              -> maquette/comparateur-santeo.html (maquette)
#   python3 -I maquette/build.py maquette <copie de santeo-tarifs> --site <dossier>              -> site de test
#   python3 -I maquette/build.py maquette <copie de santeo-tarifs> --site <dossier> --en-ligne   -> www.santeo.net
# La version « site » est un dossier complet (téléphone compris) sans les éléments réservés à la maquette (noms des
# formules, gestion des compagnies, notes) : index.html, mentions-legales/, 404.html, robots.txt, sitemap.xml, images.
# Site de test : caché aux moteurs de recherche, avec un bandeau « version de test ». En ligne : visible, sans bandeau.
# L'adresse du CRM qui reçoit les demandes et le repli éventuel sont dans maquette/reglages-site.json
# (--envoi <adresse> et --repli <mode> les remplacent, pour les essais).
import base64, glob, json, os, re, shutil, sys, datetime
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
# Relais de tarification API Santé (VERALTI) de Santéo : appelé par le site seulement (il n'accepte que santeo.net)
APICIL = option("--apicil", reglages.get("apicil", ""))
# Espace admin : réglages lus dans le CRM (« reglages_crm ») et adresse de la page de réglages du CRM (« admin_crm »)
REGLAGES = option("--reglages", reglages.get("reglages_crm", "")); ADMIN = option("--admin", reglages.get("admin_crm", ""))
CATALOGUE = json.load(open(S + "/catalogue.json", encoding="utf-8"))
if GOOGLE and not re.fullmatch(r"G-[A-Z0-9]{4,20}", GOOGLE): sys.exit("identifiant de mesure Google invalide : " + GOOGLE)
assert TCHAT in ("direct", "aucun"), TCHAT   # le tchat n'ouvre jamais WhatsApp chez le visiteur
assert TCHAT_CRM == "" or TCHAT_CRM.startswith("https://"), "l'adresse du tchat doit commencer par https://"
assert ENVOI == "" or ENVOI.startswith("https://"), "l'adresse du CRM doit commencer par https://"
assert REPLI in ("", "whatsapp"), REPLI
t = open(S + "/template.html", encoding="utf-8").read()
moteur = open(R + "/src/moteur.js", encoding="utf-8").read()
tarifs = json.load(open(R + "/src/tarifs_all.json", encoding="utf-8"))
g = json.load(open(R + "/src/garanties.json", encoding="utf-8"))
keep = ["MCCINOVA","FLEXIA","SOLENCIA","CAPEVO","CAPNR","REV","RF50","RF100","MV","LPSH","TALIS","APICIL"]
tarifs = {k: v for k, v in tarifs.items() if k not in ("DOCSMD",)}
gammes = g["gammes"]
extras = {k: dict(g["extras"][k]) for k in keep if k in g["extras"]}
# APRIL : garanties (APRIL_GAR) et rang des produits (APRIL_ORDRE_RANG) lus dans la page du comparateur de Claude, en lecture
# seule, tant qu'ils ne sont pas dans garanties.json ; mêmes règles que sa page (fi = rang × 100 + niveau ; « n.c. » = non
# communiqué, jamais « non couvert » ; orthodontie non remboursée comptée dans le forfait dentaire chez Only, Pro, Pro Start).
APRIL_URL = option("--april", reglages.get("april", ""))
_cmp = open(R + "/src/comparateur.html", encoding="utf-8").read()
APRIL_GAR = json.loads(re.search(r"^const APRIL_GAR=(\{.*?\});\s*$", _cmp, re.M).group(1))
APRIL_ORDRE = json.loads(re.search(r"const APRIL_ORDRE_RANG=(\[.*?\]);", _cmp, re.S).group(1))
_noms = {p["code"][6:]: p["nom"] for c in CATALOGUE["compagnies"] if c["nom"] == "APRIL" for p in c["produits"]}
_GA = {"label": "APRIL", "resp": False, "ins": "april", "names": {}}
for _k in ("hospO", "hospN", "honoO", "honoN", "dent", "opt", "aud", "ch", "md"): _GA[_k] = {}
_EA = {k: {} for k in ("imp", "orthR", "orthN", "lentA", "lentR", "optC", "pharR", "pharN", "aud", "plaf")}
for _code, _g in APRIL_GAR.items():
    if _code not in APRIL_ORDRE: continue
    _r = APRIL_ORDRE.index(_code)
    for _i, _n in enumerate(_g["niv"]):
        _fi = str(_r * 100 + _n)
        _GA["names"][_fi] = _noms.get(_code, _code) + " Niv. " + str(_n)
        for _k in ("hospO", "hospN", "honoO", "honoN", "dent", "opt", "aud", "ch", "md"): _GA[_k][_fi] = _g[_k][_i]
        for _k in ("imp", "orthR", "lentA", "lentR", "aud"): _EA[_k][_fi] = _g[_k][_i]
        for _k in ("optC", "pharR", "pharN", "plaf"): _EA[_k][_fi] = _g[_k][_i] if _k in _g else "n.c."
        _EA["orthN"][_fi] = "n.c." if _g["imp"][_i] == "n.c." else (_g["imp"][_i] if _code in ("OnlySante", "SantePro", "SanteProStart") else "—")
gammes = dict(gammes, APRIL=_GA)
extras["APRIL"] = _EA
APRIL_DATA = {"url": "", "ordre": APRIL_ORDRE, "resp": {c: v.get("resp") is True for c, v in APRIL_GAR.items()},
              "tns": [p["code"][6:] for c in CATALOGUE["compagnies"] if c["nom"] == "APRIL" for p in c["produits"] if p.get("tns")]}
def js(o): return json.dumps(o, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
out = t.replace("__MOTEUR__", moteur.replace("</", "<\\/")).replace("__TARIFS__", js(tarifs)).replace("__GAMMES__", js(gammes)).replace("__EXTRAS__", js(extras))
logos = json.load(open(S + "/logos/logos.json"))
out = out.replace("__CATALOGUE__", js(CATALOGUE)).replace("__APRIL__", js(dict(APRIL_DATA, url=APRIL_URL if SITE else "")))
out = out.replace("__LOGOS__", "".join('<span class="logo-box" data-co="%s"><img src="%s" alt="%s"></span>' % (l["nom"], l["src"], l["nom"]) for l in logos))
out = out.replace("__SANTEO_LOGO__", open(S + "/logos/santeo.b64").read().strip())
out = out.replace("__SANTEO_MASQUE__", open(S + "/logos/santeo-masque.b64").read().strip())
out = out.replace("__MASCOTTE__", open(S + "/logos/mascotte.b64").read().strip())
# Photo du couple en haut à droite, sous l'oiseau (Fabrice, 12/11/2026) : fichier à part sur le site, intégrée dans la maquette (page seule)
out = out.replace("__COUPLE__", "images/couple.webp" if SITE else "data:image/webp;base64," + base64.b64encode(open(S + "/images-site/couple.webp", "rb").read()).decode())
out = out.replace("__COMETE_D__", open(S + "/logos/comete-trajet.txt").read().strip())
for repere, valeur in (("__MODE__", "site" if SITE else "maquette"), ("__ENVOI__", ENVOI if SITE else ""), ("__REPLI__", REPLI if SITE else ""),
                       ("__TCHAT_MODE__", TCHAT if SITE else "aucun"), ("__TCHAT_CRM__", TCHAT_CRM if SITE else ""),
                       ("__GOOGLE__", GOOGLE if SITE else ""), ("__APICIL__", APICIL if SITE else ""),
                       ("__REGLAGES__", REGLAGES if SITE else "")):
    assert out.count(repere) == (2 if repere == "__MODE__" else 1), repere
    out = out.replace(repere, valeur.replace('"', ""))
if SITE is None:
    out = out.replace('<a href="guide/">Guide de la mutuelle</a> · ', '')   # la maquette (page seule) n'a pas de guide
    open(S + "/comparateur-santeo.html", "w", encoding="utf-8").write(out)
    print("taille", len(out.encode()), "octets")
else:
    # Textes pour Google et pour l'aperçu de partage (WhatsApp, réseaux) : Mon idée, à valider par Fabrice
    TITRE = "Comparateur mutuelle santé | Santéo, courtier depuis 1992"
    # (155 caractères au plus : Google coupe au-delà)
    DESCRIPTION = ("Comparez les mutuelles santé en quelques secondes avec votre date de naissance et votre code postal. "
                   "Conseil gratuit d'un courtier depuis 1992.")
    assert len(DESCRIPTION) <= 155, len(DESCRIPTION)
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
    # Bas de l'accueil : seulement le lien « Guide de la mutuelle » du pied de page ; les titres des articles sont dans le guide
    # (Fabrice, 12/11/2026 : « Je ne veux pas tout ses titres. Tu dois les intégrer dans guide de la mutuelle »)
    guide_liens = [json.load(open(f, encoding="utf-8")) for f in glob.glob(S + "/guide/*.json")]
    CHAPITRES = json.load(open(S + "/chapitres.json", encoding="utf-8"))["chapitres"]
    for a in guide_liens:
        assert a.get("chapitre") in {c["id"] for c in CHAPITRES}, a["slug"] + " : chapitre absent ou inconnu"
    page = tete + out + "\n</html>\n"
    os.makedirs(os.path.join(SITE, "mentions-legales"), exist_ok=True)
    def ecrire(nom, texte): open(os.path.join(SITE, nom), "w", encoding="utf-8").write(texte)
    ecrire("index.html", page)
    for f in ("partage.jpg", "icone-48.png", "icone-180.png"): shutil.copyfile(S + "/images-site/" + f, os.path.join(SITE, f))
    # Les devis envoyés par l'ancien comparateur affichent le logo depuis www.santeo.net/images/Logo_santeo_pt.png :
    # cette adresse est gardée (logo Santéo actuel, fond blanc, aux proportions de l'emplacement du mail : 166 x 68).
    os.makedirs(os.path.join(SITE, "images"), exist_ok=True)
    shutil.copyfile(S + "/images-site/logo-mail.png", os.path.join(SITE, "images", "Logo_santeo_pt.png"))
    shutil.copyfile(S + "/images-site/couple.webp", os.path.join(SITE, "images", "couple.webp"))
    # Petites pages de renvoi : /mentions-legales (citée dans les devis du comparateur) et toute ancienne adresse (404)
    def renvoi(cible, titre, texte, robots, canonique=False):
        # canonique : l'adresse de destination est aussi donnée à Google comme adresse officielle (anciennes pages déplacées)
        return ('<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
                '<meta name="robots" content="%s">\n<title>%s</title>\n<link rel="icon" type="image/png" href="%sicone-48.png">\n%s'
                '<meta http-equiv="refresh" content="0; url=%s">\n<script>location.replace("%s")</script>\n</head>\n'
                '<body style="font-family:system-ui,sans-serif;margin:2rem;color:#0f2430;background:#fff">\n<p>%s <a href="%s">Continuer</a></p>\n</body>\n</html>\n'
                % (robots, titre, ADRESSE, '<link rel="canonical" href="%s">\n' % cible if canonique else "", cible, cible, texte, cible))
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
    # Schéma des dents (article des prothèses) : le repère <div class="schema-dents"></div> de l'article est remplacé par un
    # dessin en SVG construit à partir de "schema_dents" de son JSON (panier de chaque couronne selon la dent et le matériau).
    GROUPES = [("incisives", "incisives"), ("canines", "canines"), ("premieres_premolaires", "premières prémolaires"),
               ("deuxiemes_premolaires", "deuxièmes prémolaires"), ("molaires", "molaires")]
    # (groupe, forme, largeur, petite étiquette, écart avec la dent suivante : plus large entre deux groupes pour que les noms ne se chevauchent pas)
    DENTS = [("incisives", "inc", 28, "", 6), ("incisives", "inc", 24, "", 15), ("canines", "can", 26, "", 18),
             ("premieres_premolaires", "pm", 26, "1re", 6), ("deuxiemes_premolaires", "pm", 26, "2e", 15),
             ("molaires", "mol", 32, "", 6), ("molaires", "mol", 30, "", 6), ("molaires", "mol", 28, "", 0)]
    LARGEUR = 304
    PANIERS = [("d100", "100 % Santé", "prix plafonné, entièrement remboursé par la Sécurité sociale et un contrat responsable"),
               ("dmai", "Tarifs maîtrisés", "prix plafonné, un reste à charge est possible selon votre contrat"),
               ("dlib", "Tarifs libres", "prix fixé librement par le dentiste")]
    def panier(v):
        v = v.lower()
        k = "d100" if "100" in v else "dmai" if ("maîtris" in v or "modér" in v) else "dlib" if "libre" in v else None
        assert k, "schéma des dents : panier inconnu " + v
        return k
    def dent(x, w, h, typ):
        # couronne vue de face : collet en haut (contre la gencive), bord qui mord en bas
        P = lambda fx, fy: "%.1f,%.1f" % (x + fx * w, 6 + fy * h)
        cote = "M%s L%s Q%s %s " % (P(.15, 0), P(.85, 0), P(1, .2), P(1, .55))
        fin = " Q%s %s Z" % (P(0, .2), P(.15, 0))
        if typ == "inc":
            bas = "L%s Q%s %s L%s Q%s %s L%s" % (P(1, .9), P(1, 1), P(.86, 1), P(.14, 1), P(0, 1), P(0, .9), P(0, .55))
        elif typ == "can":
            bas = "L%s Q%s %s Q%s %s L%s" % (P(1, .72), P(.75, .88), P(.5, 1), P(.25, .88), P(0, .72), P(0, .55))
        elif typ == "pm":
            bas = "L%s Q%s %s Q%s %s Q%s %s Q%s %s L%s" % (P(1, .75), P(.92, 1), P(.74, 1), P(.6, 1), P(.5, .9), P(.4, 1), P(.26, 1),
                                                         P(.08, 1), P(0, .75), P(0, .55))
        else:
            bas = "L%s Q%s %s Q%s %s Q%s %s Q%s %s Q%s %s Q%s %s L%s" % (P(1, .78), P(1, 1), P(.83, 1), P(.7, 1), P(.66, .92), P(.6, 1), P(.5, 1),
                                                                       P(.4, 1), P(.34, .92), P(.3, 1), P(.17, 1), P(0, 1), P(0, .78), P(0, .55))
        return cote + bas + fin
    def rangee(h, classes, etiquettes):
        x, out, pos = 6.0, [], []
        out.append('<rect class="sd-gencive" x="0" y="0" width="%d" height="11" rx="5.5"/>' % LARGEUR)
        for i, (g, typ, w, sous, ecart) in enumerate(DENTS):
            out.append('<path class="%s" d="%s"/>' % (classes[i], dent(x, w, h, typ)))
            pos.append((x, w, g, sous))
            x += w + ecart
        if etiquettes:
            y = h + 22
            for (x0, w, g, sous) in pos:
                if sous: out.append('<text class="sd-sous" x="%.1f" y="%.1f">%s</text>' % (x0 + w / 2, y - 7, sous))
            for g, nom in (("incisives", "Incisives"), ("canines", "Canine"), ("pm", "Prémolaires"), ("molaires", "Molaires")):
                l = [(x0, w) for (x0, w, gg, s) in pos if gg == g or (g == "pm" and gg.endswith("premolaires"))]
                a0, a1 = l[0][0], l[-1][0] + l[-1][1]
                yy = y
                out.append('<path class="sd-trait" d="M%.1f,%.1f V%.1f H%.1f V%.1f"/>' % (a0 + 2, yy - 4, yy, a1 - 2, yy - 4))
                out.append('<text class="sd-nom" x="%.1f" y="%.1f">%s</text>' % ((a0 + a1) / 2, yy + 13, nom))
        return "".join(out), (h + 50 if etiquettes else h + 10)
    def schema_dents(sd):
        assert not sd.get("a_confirmer"), "schéma des dents : des valeurs restent à confirmer " + str(sd.get("a_confirmer"))
        assert [g for g, _ in GROUPES] == sd["groupes"], "schéma des dents : groupes " + str(sd["groupes"])
        dessin, hh = rangee(44, ["sd-dent"] * len(DENTS), True)
        h = ['<figure class="schema-dents">',
             '<figcaption>Couronnes : le panier selon la dent et le matériau</figcaption>',
             '<p class="sd-aide">Une moitié de mâchoire vue de face, du milieu de la bouche (à gauche) vers le fond (à droite). '
             'Les autres moitiés suivent la même règle.</p>',
             '<svg class="sd-svg" viewBox="0 0 %d %d" role="img" aria-label="Les dents, du milieu de la bouche vers le fond : deux incisives, '
             'une canine, deux prémolaires (la première, puis la deuxième) et trois molaires.">%s</svg>' % (LARGEUR, hh, dessin),
             '<ul class="sd-legende">' + "".join('<li><i class="%s" aria-hidden="true"></i><span><strong>%s</strong> : %s</span></li>' % p for p in PANIERS) + '</ul>']
        for mat, val in sd["materiaux"].items():
            assert set(val) == set(sd["groupes"]), "schéma des dents : " + mat
            cl = [panier(val[d[0]]) for d in DENTS]
            par = []
            for k, nom, _ in PANIERS:
                gs = [lib for g, lib in GROUPES if panier(val[g]) == k]
                if gs: par.append("%s : %s" % (nom, gs[0] if len(gs) == 1 else ", ".join(gs[:-1]) + " et " + gs[-1]))
            texte = ". ".join(par) + "."
            dessin, hh = rangee(34, cl, False)
            h.append('<div class="sd-mat"><p class="sd-mat-nom">%s</p><svg class="sd-svg" viewBox="0 0 %d %d" role="img" aria-label="%s">%s</svg>'
                     '<p class="sd-mat-txt">%s</p></div>' % (mat[:1].upper() + mat[1:], LARGEUR, hh, att(mat + " : " + texte), dessin, texte))
        h.append('</figure>')
        return "\n".join(h)
    REPERE_DENTS = '<div class="schema-dents"></div>'
    for a in articles:
        url = ADRESSE + "guide/" + a["slug"] + "/"
        maj = a.get("maj", AUJ)
        corps = re.sub(r"(<table.*?</table>)", r'<div class="tableau">\1</div>', a["contenu"], flags=re.S)
        if REPERE_DENTS in corps or a.get("schema_dents"):
            assert a.get("schema_dents") and corps.count(REPERE_DENTS) == 1, a["slug"] + " : schéma des dents (repère et données)"
            corps = corps.replace(REPERE_DENTS, schema_dents(a["schema_dents"]))
        meme = [b for b in articles if b is not a and b["chapitre"] == a["chapitre"]]
        ailleurs = [b for b in articles if b is not a and b["chapitre"] != a["chapitre"]]
        autres = "".join('<li><a href="../%s/"><strong>%s</strong><span>%s</span></a></li>' % (b["slug"], b["h1"], b["description"])
                         for b in (meme + ailleurs[:max(0, 4 - len(meme))]))
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
        chap = next(c for c in CHAPITRES if c["id"] == a["chapitre"])
        fil = ('<a href="../../">Accueil</a> › <a href="../">Guide de la mutuelle</a> › <a href="../#%s">%s</a> › <span>%s</span>'
               % (chap["id"], chap["titre"], a["h1"]))
        os.makedirs(os.path.join(SITE, "guide", a["slug"]), exist_ok=True)
        ecrire("guide/%s/index.html" % a["slug"], page_guide("../../", url, a["titre_page"], a["description"], fil, contenu, ld, "article"))
    if articles:
        liste = "".join('<section class="chapitre" id="%s"><h2>%s</h2><p class="intro-chap">%s</p><ul class="liste">%s</ul></section>\n' % (
            c["id"], c["titre"], c["intro"], "".join('<li><a href="%s/"><strong>%s</strong><span>%s</span></a></li>' % (a["slug"], a["h1"], a["description"])
                                                   for a in articles if a["chapitre"] == c["id"]))
                        for c in CHAPITRES if any(a["chapitre"] == c["id"] for a in articles))
        g_titre = "Guide de la mutuelle santé : comprendre et choisir | Santéo"
        g_desc = "Contrat responsable, Complémentaire santé solidaire, surcomplémentaire, remboursements : les explications simples de Santéo, courtier depuis 1992."
        contenu = ('<h1>Guide de la mutuelle santé</h1>\n<p class="chapo">Des explications simples pour comprendre votre complémentaire santé et '
                   'choisir sans vous tromper, rédigées par Santéo, courtier en assurance santé depuis 1992.</p>\n%s%s' % (
                       '<nav class="chapitres" aria-label="Chapitres du guide"><ul>%s</ul></nav>\n' % "".join(
                           '<li><a href="#%s">%s</a></li>' % (c["id"], c["titre"]) for c in CHAPITRES if any(a["chapitre"] == c["id"] for a in articles)),
                       liste)) + CTA
        ld = {"@context": "https://schema.org", "@type": "CollectionPage", "name": "Guide de la mutuelle santé", "url": ADRESSE + "guide/",
              "inLanguage": "fr-FR", "publisher": editeur,
              "hasPart": [{"@type": "Article", "headline": a["h1"], "url": ADRESSE + "guide/" + a["slug"] + "/"} for a in articles]}
        ecrire("guide/index.html", page_guide("../", ADRESSE + "guide/", g_titre, g_desc,
                                              '<a href="../">Accueil</a> › <span>Guide de la mutuelle</span>', contenu, ld, "website"))
    # Catalogue des produits, lu par l'espace admin du CRM ; /admin renvoie vers la page de réglages du CRM (connexion du CRM)
    ecrire("catalogue.json", json.dumps(dict(CATALOGUE, version=AUJ), ensure_ascii=False, indent=1))
    os.makedirs(os.path.join(SITE, "admin"), exist_ok=True)
    ecrire("admin/index.html", renvoi(ADMIN, "Espace admin | Santéo", "Espace admin de Santéo :", "noindex, nofollow") if ADMIN else
           ('<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
            '<meta name="robots" content="noindex, nofollow">\n<title>Espace admin | Santéo</title>\n</head>\n'
            '<body style="font-family:system-ui,sans-serif;margin:2rem;color:#0f2430;background:#fff">\n'
            '<p>L\'espace admin de Santéo sera bientôt ouvert ici. <a href="../">Retour au comparateur</a></p>\n</body>\n</html>\n'))
    # Anciennes adresses de l'ancien site que Google connaît (maquette/renvois.json) : une petite page de renvoi immédiat à la
    # même adresse, vers la page la plus proche du nouveau site, pour que Google y reporte la place gagnée au lieu d'une erreur 404.
    slugs = {a["slug"] for a in articles}
    for ancienne, cible in json.load(open(S + "/renvois.json", encoding="utf-8"))["renvois"].items():
        assert re.fullmatch(r"/(actu|question|devis)/[a-z0-9-]*", ancienne), "renvoi : ancienne adresse " + ancienne
        m = re.fullmatch(r"/(guide/(?:([a-z0-9-]+)/)?)?", cible)
        assert m and (not m.group(2) or m.group(2) in slugs), "renvoi : page cible absente " + cible
        fichier = ancienne[1:] + ("index.html" if ancienne.endswith("/") else ".html")
        os.makedirs(os.path.dirname(os.path.join(SITE, fichier)), exist_ok=True)
        ecrire(fichier, renvoi(ADRESSE + cible[1:], "Page déplacée | Santéo", "Cette page a été déplacée.",
                               "index, follow" if EN_LIGNE else "noindex, nofollow", canonique=True))
    ecrire("robots.txt", ("User-agent: *\nAllow: /\nSitemap: %ssitemap.xml\n" % ADRESSE) if EN_LIGNE else "User-agent: *\nDisallow: /\n")
    pages = [(ADRESSE, AUJ)] + ([(ADRESSE + "guide/", max(a.get("maj", AUJ) for a in articles))] if articles else []) \
            + [(ADRESSE + "guide/" + a["slug"] + "/", a.get("maj", AUJ)) for a in articles]
    ecrire("sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
           + "".join('  <url><loc>%s</loc><lastmod>%s</lastmod></url>\n' % p for p in pages) + '</urlset>\n')
    print("site", "EN LIGNE" if EN_LIGNE else "de test", ":", SITE, len(page.encode()), "octets ;",
          "envoi vers le CRM" if ENVOI else ("repli " + REPLI if REPLI else "aucun envoi"))
