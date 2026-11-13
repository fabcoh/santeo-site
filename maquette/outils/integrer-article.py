import json, sys, os
# Intègre un article rédigé (fragment HTML + JSON de travail) dans le Guide de la mutuelle.
# Usage : python3 -I maquette/outils/integrer-article.py <dossier de travail> maquette <slug> <chapitre> <ordre> <date AAAA-MM-JJ> [corrections.json]
# Ne copie que les champs publics du JSON (les mots-clés et les points incertains restent dans le dossier de travail).
# corrections.json : liste de {"avant", "apres"} ; chaque « avant » doit apparaître une seule fois dans le texte.
src, maq, slug, chapitre, ordre, date = sys.argv[1:7]
h = open(os.path.join(src, slug + ".html"), encoding="utf-8").read()
if len(sys.argv) > 7:
    for c in json.load(open(sys.argv[7], encoding="utf-8")):
        assert h.count(c["avant"]) == 1, c["avant"][:80]
        h = h.replace(c["avant"], c["apres"])
a = json.load(open(os.path.join(src, slug + ".json"), encoding="utf-8"))
assert a["slug"] == slug and len(a["titre_page"]) <= 60 and len(a["description"]) <= 160 and len(a["lien"]) <= 40, slug
chapitres = [c["id"] for c in json.load(open(os.path.join(maq, "chapitres.json"), encoding="utf-8"))["chapitres"]]
assert chapitre in chapitres, (chapitre, chapitres)
pub = {"slug": slug, "chapitre": chapitre, "lien": a["lien"], "ordre": int(ordre), "publie": date, "maj": date,
       "titre_page": a["titre_page"], "description": a["description"], "h1": a["h1"], "faq": a["faq"]}
G = os.path.join(maq, "guide")
open(os.path.join(G, slug + ".html"), "w", encoding="utf-8").write(h.strip() + "\n")
json.dump(pub, open(os.path.join(G, slug + ".json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("article", slug, "->", chapitre, ordre, date)
