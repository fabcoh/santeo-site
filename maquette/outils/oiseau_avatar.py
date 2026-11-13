import sys, json, base64, io
from PIL import Image
# L'oiseau en une seule image (avatar d'Antony dans le tchat des pages du guide, qui n'ont pas l'oiseau animé de l'accueil) :
# les quatre calques de maquette/logos/mascotte.json superposés dans l'ordre de l'accueil (aile droite, corps, aile gauche, étoile).
# Usage : python3 -I maquette/outils/oiseau_avatar.py maquette/logos/mascotte.json maquette/images-site/oiseau.webp
m = json.load(open(sys.argv[1], encoding="utf-8"))
img = lambda k: Image.open(io.BytesIO(base64.b64decode(m[k].split(",", 1)[1]))).convert("RGBA")
out = img("aile_d")
for k in ("corps", "aile_g", "etoile"): out = Image.alpha_composite(out, img(k))
out.save(sys.argv[2], "WEBP", quality=88, alpha_quality=90, method=6)
print(sys.argv[2], out.size)
