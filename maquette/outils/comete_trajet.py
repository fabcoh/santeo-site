# Trajet de la lumière (comète) sur la courbe du logo Santéo.
# Points relevés à la main sur le logo (609 x 180), lissés en courbe : écrit logos/comete-trajet.txt
# et un aperçu comete-trajet-apercu.png (trajet en rouge sur le logo, agrandi 3 fois).
# Usage : python3 -I maquette/outils/comete_trajet.py maquette
import sys, io, base64
import numpy as np
from PIL import Image, ImageDraw

PTS = [(236,172),(190,171.5),(140,168.5),(100,163.5),(70,156),(45,146),(26,134),(12,121),(10,108),(20,97),(40,89),
       (70,81),(110,72),(160,62),(210,54),(255,46),(290,40),(320,30),(350,21.5),(380,15.5),(410,11),(440,9.5),
       (468,11),(490,15),(506,23),(515,35),(517,48),(512,60)]

def controles(p, i):
    p0 = p[i-1] if i > 0 else p[i]; p1 = p[i]; p2 = p[i+1]; p3 = p[i+2] if i+2 < len(p) else p[i+1]
    c1 = (p1[0]+(p2[0]-p0[0])/6, p1[1]+(p2[1]-p0[1])/6)
    c2 = (p2[0]-(p3[0]-p1[0])/6, p2[1]-(p3[1]-p1[1])/6)
    return p1, c1, c2, p2

def chemin_svg(p):
    d = "M%.1f %.1f" % p[0]
    for i in range(len(p)-1):
        _, c1, c2, p2 = controles(p, i)
        d += " C%.1f %.1f %.1f %.1f %.1f %.1f" % (c1+c2+p2)
    return d

def points(p, n=30):
    out = []
    for i in range(len(p)-1):
        p1, c1, c2, p2 = (np.array(v) for v in controles(p, i))
        for t in np.linspace(0, 1, n):
            out.append(tuple((1-t)**3*p1 + 3*(1-t)**2*t*c1 + 3*(1-t)*t*t*c2 + t**3*p2))
    return out

if __name__ == "__main__":
    S = sys.argv[1]
    open(S + "/logos/comete-trajet.txt", "w").write(chemin_svg(PTS))
    logo = Image.open(io.BytesIO(base64.b64decode(open(S + "/logos/santeo.b64").read().split(",", 1)[1]))).convert("RGB")
    k = 3; grand = logo.resize((logo.width*k, logo.height*k)); dessin = ImageDraw.Draw(grand)
    dessin.line([(x*k, y*k) for x, y in points(PTS)], fill=(255, 0, 0), width=2)
    grand.save(S + "/comete-trajet-apercu.png")
    print("trajet écrit :", S + "/logos/comete-trajet.txt")
