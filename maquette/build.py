import json, sys
S, R = sys.argv[1], sys.argv[2]
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
open(S + "/comparateur-santeo.html", "w", encoding="utf-8").write(out)
print("taille", len(out.encode()), "octets")
