# Masque des lettres du logo Santéo : blanc = la lumière est visible, noir = elle passe derrière les lettres.
import sys, io, base64
import numpy as np
from PIL import Image, ImageFilter
S = sys.argv[1]
d = open(S + "/logos/santeo.b64").read().strip().split(",", 1)[1]
im = np.asarray(Image.open(io.BytesIO(base64.b64decode(d))).convert("RGB")).astype(int)
lum = im.mean(-1)
lettres = (lum < 175)                      # bleu foncé du texte (et dégradé du O)
zone = np.zeros_like(lettres); zone[56:129, 44:585] = True   # seulement la ligne SANTÉO, pas la courbe ni le sous-titre
lettres &= zone
m = Image.fromarray(np.where(lettres, 0, 255).astype("uint8"), "L")
m = m.filter(ImageFilter.MinFilter(3))     # élargit les lettres d'1 px pour un bord net
m = m.filter(ImageFilter.GaussianBlur(0.8))
buf = io.BytesIO(); m.save(buf, "PNG", optimize=True)
open(S + "/logos/santeo-masque.b64", "w").write("data:image/png;base64," + base64.b64encode(buf.getvalue()).decode())
m.save(S + "/logo-masque.png")
print("masque", len(buf.getvalue()), "octets")
