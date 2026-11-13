# Mascotte découpée en calques pour pouvoir l'animer : corps, aile gauche, aile droite, étoile.
#   python3 -I maquette/outils/mascotte.py maquette      -> maquette/logos/mascotte.json
# Le fond presque blanc devient transparent (seulement la zone reliée aux bords : le ventre et le visage blancs restent),
# l'ombre au sol est retirée. Les quatre calques ont exactement la même taille : empilés, ils redonnent l'image de départ.
import sys, io, base64, json
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

S = sys.argv[1]
im = Image.open(S + "/images-source/mascotte.webp").convert("RGB")
a = np.asarray(im).astype(int)
H, W = a.shape[:2]
d = np.abs(a - np.array([248, 249, 253])).max(-1)          # écart de chaque point avec la couleur du fond

def image_masque(m): return Image.fromarray(np.where(m, 255, 0).astype("uint8"), "L").copy()

def dilate(m, n=1):
    for _ in range(n):
        o = m.copy()
        o[1:] |= m[:-1]; o[:-1] |= m[1:]; o[:, 1:] |= m[:, :-1]; o[:, :-1] |= m[:, 1:]
        m = o
    return m

# 1. Le fond. Remplissage strict depuis les bords (écart < 7) : avec un seuil large, le remplissage entrait dans le visage,
#    dont le contour est blanc sur blanc. Puis on grignote 3 points de liseré pâle autour de l'oiseau (écart < 18).
m = image_masque(d < 7)
for x in range(0, W, 6):
    for y in (0, H - 1):
        if m.getpixel((x, y)) == 255: ImageDraw.floodfill(m, (x, y), 128)
for y in range(0, H, 6):
    for x in (0, W - 1):
        if m.getpixel((x, y)) == 255: ImageDraw.floodfill(m, (x, y), 128)
fond = np.asarray(m) == 128
for _ in range(3): fond = fond | (dilate(fond) & (d < 18))
plein = ~fond
plein[1092:] = False                                        # sans l'ombre au sol (la queue finit à 1087, l'ombre commence à 1097)

# 2. Les miettes isolées (quelques points) sont retirées.
def sans_miettes(masque, mini=300):
    m = image_masque(masque); garde = np.zeros_like(masque)
    while True:
        ys, xs = np.nonzero(np.asarray(m) == 255)
        if len(ys) == 0: return garde
        ImageDraw.floodfill(m, (int(xs[0]), int(ys[0])), 128)
        morceau = np.asarray(m) == 128
        if morceau.sum() >= mini: garde |= morceau
        m.paste(0, mask=image_masque(morceau))
plein = sans_miettes(plein)

# 3. Les ailes : on trace une ligne de coupe à la racine, puis on prend tout ce qui est relié à un point de l'aile.
COUPE_G = [(505,440),(540,485),(572,518),(592,540),(600,560),(625,582),(652,600),(664,622),(655,642),(625,650),(600,645),(585,652),(562,678),(538,706),(505,745)]
COUPE_D = [(882,555),(862,590),(858,618),(854,645),(850,672),(842,682),(836,707),(826,733),(806,768),(812,800)]
COUPE_D2 = [(972,735),(984,698),(1000,672),(1030,672)]      # sépare l'aile droite de la traînée du bas
def morceau_relie(coupes, graine):
    m = image_masque(plein); dr = ImageDraw.Draw(m)
    for c in coupes: dr.line(c, fill=0, width=5)
    assert m.getpixel(graine) == 255, graine
    ImageDraw.floodfill(m, graine, 128)
    return np.asarray(m) == 128
aile_g = morceau_relie([COUPE_G], (300, 400))
aile_d = morceau_relie([COUPE_D, COUPE_D2], (950, 600))
etoile = np.zeros_like(plein); etoile[170:272, 1095:1200] = plein[170:272, 1095:1200]
assert 150000 < aile_g.sum() < 220000 and 30000 < aile_d.sum() < 50000 and 1500 < etoile.sum() < 6000, (aile_g.sum(), aile_d.sum(), etoile.sum())
corps = sans_miettes(plein & ~aile_g & ~aile_d & ~etoile)     # les restes de ligne de coupe vont avec les ailes

# 4. Les raccords, pour qu'aucun jour n'apparaisse à l'épaule quand l'aile tourne.
#    Aile gauche (devant le corps) : le corps garde un bout de l'aile, seulement autour de l'épaule. Ailleurs la coupe suit
#    le vrai contour de la tête et du dos : rien à ajouter.
#    Aile droite (derrière le corps) : elle est prolongée sous le corps avec ses propres couleurs.
EPAULE_G, EPAULE_D = (640, 615), (852, 668)                 # points autour desquels les ailes tournent
yy, xx = np.mgrid[0:H, 0:W]
pres_epaule = (xx - EPAULE_G[0]) ** 2 + (yy - EPAULE_G[1]) ** 2 < 75 ** 2
calque_corps = corps | (aile_g & dilate(corps, 26) & pres_epaule)
calque_g = dilate(aile_g, 3) & plein & ~aile_d & ~etoile
zone = dilate(aile_d, 28) & corps
zone[:, 905:] = False                                       # pas sous la traînée
couleurs_d = a.astype(float); connu = aile_d.copy()
for _ in range(30):
    somme = np.zeros_like(couleurs_d); nb = np.zeros(connu.shape)
    for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
        k = np.roll(connu, (dy, dx), (0, 1)); c = np.roll(couleurs_d * connu[..., None], (dy, dx), (0, 1))
        somme += c; nb += k
    nouveau = zone & ~connu & (nb > 0)
    couleurs_d[nouveau] = somme[nouveau] / nb[nouveau][:, None]
    connu |= nouveau
calque_d = connu | (dilate(aile_d, 3) & plein & ~corps & ~aile_g & ~etoile)

# 5. Même cadre et même taille pour tous les calques.
def calque(masque, couleurs=None):
    rgb = im if couleurs is None else Image.fromarray(np.clip(couleurs, 0, 255).astype("uint8"), "RGB")
    c = rgb.convert("RGBA"); c.putalpha(image_masque(masque).filter(ImageFilter.GaussianBlur(1.2)))
    return c
calques = {"corps": calque(calque_corps), "aile_g": calque(calque_g), "aile_d": calque(calque_d, couleurs_d), "etoile": calque(etoile)}
tout = calque(plein)
cadre = tout.getchannel("A").point(lambda v: 255 if v > 20 else 0).getbbox()
x0, y0, x1, y1 = cadre
LARGEUR = 220; HAUTEUR = round(LARGEUR * (y1 - y0) / (x1 - x0))
def petit(c): return c.crop(cadre).resize((LARGEUR, HAUTEUR), Image.LANCZOS)
def en_texte(c):
    q = c.quantize(colors=200, method=Image.Quantize.FASTOCTREE)   # PNG à palette : garde la transparence, reste léger
    buf = io.BytesIO(); q.save(buf, "PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()
def pivot(x, y): return "%.1f%% %.1f%%" % ((x - x0) / (x1 - x0) * 100, (y - y0) / (y1 - y0) * 100)
sortie = {k: en_texte(petit(c)) for k, c in calques.items()}
ys, xs = np.nonzero(etoile)
sortie["pivot_g"] = pivot(*EPAULE_G)
sortie["pivot_d"] = pivot(*EPAULE_D)
sortie["pivot_etoile"] = pivot(xs.mean(), ys.mean())
json.dump(sortie, open(S + "/logos/mascotte.json", "w"), indent=0)

# 6. Images de contrôle (non versionnées) : calques empilés sur fond clair et sombre, et chaque calque seul.
def empile(fond_couleur, lesquels=("aile_d", "corps", "aile_g", "etoile")):
    f = Image.new("RGBA", (LARGEUR * 3, HAUTEUR * 3), fond_couleur)
    for k in lesquels: f.alpha_composite(calques[k].crop(cadre).resize((LARGEUR * 3, HAUTEUR * 3), Image.LANCZOS))
    return f.convert("RGB")
empile((255, 255, 255, 255)).save(S + "/mascotte-apercu.png")
empile((12, 22, 27, 255)).save(S + "/mascotte-sur-sombre.png")
for k in calques: empile((255, 0, 200, 255), (k,)).save(S + "/mascotte-calque-%s.png" % k)
print("mascotte", (LARGEUR, HAUTEUR), {k: len(v) for k, v in sortie.items() if k[0] != "p"}, {k: v for k, v in sortie.items() if k[0] == "p"})
print("cadre", cadre, "aile g", int(aile_g.sum()), "aile d", int(aile_d.sum()), "etoile", int(etoile.sum()))
