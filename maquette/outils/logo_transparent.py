import sys, base64, io
from PIL import Image
# Logo Santéo sans son fond blanc (Fabrice, 13/11/2026 : « retirer le fond blanc du logo de santéo pour le fondre dans la
# couleur bleuté »). Méthode « couleur vers transparence » : le blanc devient transparent, les couleurs claires (la traînée
# de la comète) deviennent en partie transparentes ; posé sur du blanc, le logo est identique à l'original.
# Usage : python3 -I maquette/outils/logo_transparent.py maquette/logos/santeo.b64 (le fichier est remplacé)
p = sys.argv[1]
b = open(p).read().strip()
entete, donnees = b.split(",", 1) if b.startswith("data:") else ("data:image/png;base64", b)
im = Image.open(io.BytesIO(base64.b64decode(donnees))).convert("RGBA")
px = []
for r, g, bl, a0 in list(im.get_flattened_data() if hasattr(im, "get_flattened_data") else im.getdata()):
    a = max(255 - r, 255 - g, 255 - bl) / 255.0
    if a <= 0.035: px.append((255, 255, 255, 0)); continue   # presque blanc (bruit de compression) : transparent
    c = lambda v: max(0, min(255, round(255 - (255 - v) / a)))
    px.append((c(r), c(g), c(bl), round(255 * a * a0 / 255)))
im.putdata(px)
out = io.BytesIO(); im.save(out, "WEBP", quality=88, alpha_quality=90, method=6)   # WebP : léger, avec transparence
open(p, "w").write("data:image/webp;base64," + base64.b64encode(out.getvalue()).decode() + "\n")
print(p, im.size, len(out.getvalue()), "octets")
