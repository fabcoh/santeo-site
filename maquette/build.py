# Construit la page du comparateur.
#   python3 -I maquette/build.py maquette <copie de santeo-tarifs>                              -> maquette/comparateur-santeo.html (maquette)
#   python3 -I maquette/build.py maquette <copie de santeo-tarifs> --site <dossier>              -> site de test
#   python3 -I maquette/build.py maquette <copie de santeo-tarifs> --site <dossier> --en-ligne   -> www.santeo.net
# La version « site » est un dossier complet (téléphone compris) sans les éléments réservés à la maquette (noms des
# formules, gestion des compagnies, notes) : index.html, mentions-legales/, 404.html, robots.txt, sitemap.xml, images.
# Site de test : caché aux moteurs de recherche, avec un bandeau « version de test ». En ligne : visible, sans bandeau.
# L'adresse du CRM qui reçoit les demandes et le repli éventuel sont dans maquette/reglages-site.json
# (--envoi <adresse> et --repli <mode> les remplacent, pour les essais).
import json, os, shutil, sys, datetime
S, R = sys.argv[1], sys.argv[2]
def option(nom, defaut=None): return sys.argv[sys.argv.index(nom) + 1] if nom in sys.argv else defaut
SITE = option("--site")
EN_LIGNE = "--en-ligne" in sys.argv
ADRESSE = "https://www.santeo.net/" if EN_LIGNE else "https://fabcoh.github.io/santeo-site/"
reglages = json.load(open(S + "/reglages-site.json", encoding="utf-8"))
ENVOI = option("--envoi", reglages["envoi_crm"]); REPLI = option("--repli", reglages["repli"])
TCHAT = option("--tchat", reglages.get("tchat", "whatsapp")); TCHAT_CRM = option("--tchat-crm", reglages.get("tchat_crm", ""))
assert TCHAT in ("whatsapp", "direct", "aucun"), TCHAT
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
                       ("__TCHAT_MODE__", TCHAT if SITE else "whatsapp"), ("__TCHAT_CRM__", TCHAT_CRM if SITE else "")):
    assert out.count(repere) == 1, repere
    out = out.replace(repere, valeur.replace('"', ""))
if SITE is None:
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
    ecrire("robots.txt", ("User-agent: *\nAllow: /\nSitemap: %ssitemap.xml\n" % ADRESSE) if EN_LIGNE else "User-agent: *\nDisallow: /\n")
    ecrire("sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
           '  <url><loc>%s</loc><lastmod>%s</lastmod></url>\n</urlset>\n' % (ADRESSE, datetime.date.today().isoformat()))
    print("site", "EN LIGNE" if EN_LIGNE else "de test", ":", SITE, len(page.encode()), "octets ;",
          "envoi vers le CRM" if ENVOI else ("repli " + REPLI if REPLI else "aucun envoi"))
