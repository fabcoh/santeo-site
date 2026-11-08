# Mascotte : fond quasi blanc rendu transparent (seulement la zone reliée aux bords, le ventre blanc reste), recadrée sans l'ombre au sol.
import sys, io, base64
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
S = sys.argv[1]
im = Image.open(S + "/images-source/mascotte.webp").convert("RGB")
a = np.asarray(im).astype(int)
bg = np.array([248, 249, 253])
d = np.abs(a - bg).max(-1)
proche = Image.fromarray(np.where(d < 18, 255, 0).astype("uint8"), "L").copy()
H, W = d.shape
for x in range(0, W, 6):
    for y in (0, H - 1):
        if proche.getpixel((x, y)) == 255: ImageDraw.floodfill(proche, (x, y), 128)
for y in range(0, H, 6):
    for x in (0, W - 1):
        if proche.getpixel((x, y)) == 255: ImageDraw.floodfill(proche, (x, y), 128)
fond = np.asarray(proche) == 128
alpha = np.where(fond, 0, 255).astype("uint8")
# bord adouci + transition douce pour les zones pâles (ailes translucides, traînées)
A = Image.fromarray(alpha, "L").filter(ImageFilter.GaussianBlur(1.2))
rgba = im.convert("RGBA"); rgba.putalpha(A)
# recadrage : sans l'ombre au sol (bas de l'image)
rgba = rgba.crop((0, 0, W, int(H * 0.86)))
bbox = rgba.getchannel("A").point(lambda v: 255 if v > 20 else 0).getbbox()
rgba = rgba.crop(bbox)
rgba.thumbnail((220, 220), Image.LANCZOS)
q = rgba.quantize(colors=200, method=Image.Quantize.FASTOCTREE)   # PNG à palette : garde la transparence, reste léger
buf = io.BytesIO(); q.save(buf, "PNG", optimize=True)
open(S + "/logos/mascotte.b64", "w").write("data:image/png;base64," + base64.b64encode(buf.getvalue()).decode())
rgba.save(S + "/mascotte-apercu.png")
fond_noir = Image.new("RGBA", rgba.size, (12, 22, 27, 255)); fond_noir.alpha_composite(rgba); fond_noir.save(S + "/mascotte-sur-sombre.png")
print("mascotte", rgba.size, len(buf.getvalue()), "octets")
