# Construit la page du comparateur.
#   python3 -I maquette/build.py maquette <copie de santeo-tarifs>                  -> maquette/comparateur-santeo.html (maquette)
#   python3 -I maquette/build.py maquette <copie de santeo-tarifs> --site <dossier>  -> <dossier>/index.html (site de test)
# La version « site » est une page complète (téléphone compris), cachée aux moteurs de recherche, avec un bandeau
# « version de test », sans les éléments réservés à la maquette (noms des formules, gestion des compagnies, notes).
import json, os, sys
S, R = sys.argv[1], sys.argv[2]
SITE = sys.argv[sys.argv.index("--site") + 1] if "--site" in sys.argv else None
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
mascotte = json.load(open(S + "/logos/mascotte.json"))     # calques de la mascotte animée et points d'articulation
for cle in ("corps", "aile_g", "aile_d", "etoile", "pivot_g", "pivot_d", "pivot_etoile"):
    repere = "__MASCOTTE_%s__" % cle.upper()
    assert repere in out, repere
    out = out.replace(repere, mascotte[cle])
out = out.replace("__COMETE_D__", open(S + "/logos/comete-trajet.txt").read().strip())
if SITE is None:
    open(S + "/comparateur-santeo.html", "w", encoding="utf-8").write(out)
    print("taille", len(out.encode()), "octets")
else:
    tete = ('<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
            '<meta name="robots" content="noindex, nofollow">\n')
    retrait = ('<style>/* Site de test : éléments réservés à la maquette retirés */'
               '.o-real,#admin,details.notes,.a-confirmer{display:none!important}'
               '.bandeau-test{background:var(--warn-soft);color:var(--warn);border:1px dashed var(--warn);border-radius:8px;'
               'padding:.5rem .8rem;font-size:.88rem;text-align:center}</style>\n')
    bandeau = ('<div class="wrap">\n  <p class="bandeau-test" role="note">Version de test du nouveau site Santéo : '
               'les demandes ne sont pas encore transmises.</p>')
    assert out.count('<div class="wrap">') == 1
    page = tete + out.replace("</style>", "</style>\n" + retrait, 1).replace('<div class="wrap">', bandeau, 1) + "\n</html>\n"
    os.makedirs(SITE, exist_ok=True)
    open(os.path.join(SITE, "index.html"), "w", encoding="utf-8").write(page)
    print("site de test :", os.path.join(SITE, "index.html"), len(page.encode()), "octets")
