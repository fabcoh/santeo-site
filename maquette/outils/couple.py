import sys
from PIL import Image
# Photo du couple de l'en-tête (Fabrice, 12/11/2026) : recadrage de la photo fournie (têtes et épaules), puis bords fondus en
# transparence pour qu'elle se fonde dans le ciel de la page, sans coupure visible (Fabrice, 13/11/2026 : « la on voit
# vraiment les coupure ») : fondu large à gauche (côté titre), plus court à droite, en haut et en bas.
# Usage : python3 -I maquette/outils/couple.py <photo source> maquette/images-site/couple.webp
src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB")
W, H = im.size
haut, bas = int(H * 0.035), int(H * 0.69)            # des cheveux aux épaules
im = im.crop((0, haut, W, bas))
w, h = 640, round(640 * im.height / im.width)
im = im.resize((w, h), Image.LANCZOS).convert("RGBA")
def lisse(t):                                          # 0 -> 1 en douceur (début et fin sans cassure)
    t = max(0.0, min(1.0, t)); return t * t * (3 - 2 * t)
GAUCHE, DROITE, HAUT, BAS = 0.48, 0.16, 0.22, 0.28     # part de la largeur ou de la hauteur fondue de chaque côté
ax = [lisse(x / (w * GAUCHE)) * lisse((w - 1 - x) / (w * DROITE)) for x in range(w)]
ay = [lisse(y / (h * HAUT)) * lisse((h - 1 - y) / (h * BAS)) for y in range(h)]
masque = Image.new("L", (w, h))
masque.putdata([round(255 * ax[x] * ay[y]) for y in range(h) for x in range(w)])
im.putalpha(masque)
im.save(dst, "WEBP", quality=82, method=6)
print(dst, im.size)
