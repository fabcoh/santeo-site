# Images du site en ligne : aperçu de partage (WhatsApp, réseaux) et icônes de l'onglet.
#   python3 -I maquette/outils/partage.py maquette   -> maquette/images-site/partage.jpg, icone-48.png, icone-180.png
# Le fond est la couleur du fond de la mascotte : elle s'y fond sans détourage. Le logo Santéo (fond blanc) est rendu
# transparent par « blanc vers transparence », pour se poser proprement sur ce fond.
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

S = sys.argv[1]
FOND = (248, 249, 253)
POLICE = "/usr/share/fonts/opentype/inter/Inter-%s.otf"

def blanc_transparent(im):
    a = np.asarray(im.convert("RGB")).astype(float)
    alpha = (255 - a).max(-1) / 255.0
    sur = np.where(alpha[..., None] > 0, (a - 255 * (1 - alpha[..., None])) / np.maximum(alpha[..., None], 1e-6), 0)
    out = np.dstack([np.clip(sur, 0, 255), alpha * 255]).astype("uint8")
    return Image.fromarray(out, "RGBA")

logo = blanc_transparent(Image.open(S + "/images-source/santeo.webp"))
logo = logo.crop(logo.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox())
oiseau = Image.open(S + "/images-source/mascotte.webp").convert("RGB")

# Aperçu de partage 1200 x 630
W, H = 1200, 630
img = Image.new("RGB", (W, H), FOND)
lw = 470; logo_p = logo.resize((lw, round(logo.height * lw / logo.width)), Image.LANCZOS)
img.paste(logo_p, (62, 70), logo_p)
d = ImageDraw.Draw(img)
titre = ImageFont.truetype(POLICE % "Bold", 58)
y = 70 + logo_p.height + 40
d.text((74, y), "Comparez votre", font=titre, fill=(15, 36, 48))
d.text((74, y + 70), "mutuelle santé", font=titre, fill=(15, 36, 48))
d.text((76, y + 165), "Le conseil qui vous rassure depuis 1992", font=ImageFont.truetype(POLICE % "SemiBold", 29), fill=(82, 107, 119))
d.text((76, H - 66), "www.santeo.net", font=ImageFont.truetype(POLICE % "SemiBold", 26), fill=(82, 107, 119))
oh = 500; o = oiseau.resize((oh, oh), Image.LANCZOS)
assert d.textlength("Le conseil qui vous rassure depuis 1992", font=ImageFont.truetype(POLICE % "SemiBold", 29)) + 76 < W - oh - 10
img.paste(o, (W - oh - 10, (H - oh) // 2 + 5))
img.save(S + "/images-site/partage.jpg", quality=86, optimize=True, progressive=True)

# Icônes : la mascotte, recadrée au carré autour de l'oiseau (sans l'ombre au sol)
carre = oiseau.crop((40, 60, 1200, 1220))
for n in (48, 180):
    carre.resize((n, n), Image.LANCZOS).save(S + "/images-site/icone-%d.png" % n, optimize=True)
print("partage.jpg", img.size, "icônes 48 et 180")
