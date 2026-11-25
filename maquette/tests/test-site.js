// Essai du site publié (version en ligne et version de test), téléphone et PC.
//   node maquette/tests/test-site.js "$PWD/maquette" <copie de santeo-tarifs>
// Construit les sites dans un dossier temporaire, puis les sert à leur vraie adresse (www.santeo.net) sans rien
// envoyer sur Internet : l'adresse du CRM est simulée, la demande envoyée est relue et vérifiée.
// Coordonnées inventées seulement (règle 7).
const { chromium, devices } = require('playwright');
// Offres floutées tant qu'aucun besoin n'est indiqué (Fabrice, 25/11/2026) : les tests qui cliquent une offre les dévoilent d'abord
const devoiler = async q => { if (await q.isVisible('#voile-tout')) { await q.click('#voile-tout'); await q.waitForTimeout(200); } };
const { execFileSync } = require('child_process');
const fs = require('fs'), os = require('os'), path = require('path');
const S = process.argv[2], R = process.argv[3];
const CRM = 'https://crm.exemple.invalid/devis';
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'site-'));
// Le relais API Santé est toujours simulé (jamais capisante.fr pendant un essai)
const RELAIS_APICIL = 'https://relais.exemple.invalid/apicil.php';
// Réglages de l'espace admin (CRM) : toujours simulés aussi
const RELAIS_REGLAGES = 'https://relais.exemple.invalid/reglages';
let reglagesReponse = { status: 200, corps: { ok: true, produits: {}, logos: {} } };
// Sans « --google », les sites d'essai sont construits sans statistiques Google, quel que soit reglages-site.json
const RELAIS_APRIL = 'https://relais.exemple.invalid/april.php';
let appelsApril = [];
const construire = (nom, ...opts) => { const d = path.join(tmp, nom); execFileSync('python3', ['-I', S + '/build.py', S, R, '--site', d, '--apicil', RELAIS_APICIL, '--reglages', RELAIS_REGLAGES, '--april', RELAIS_APRIL, ...(opts.includes('--google') ? [] : ['--google', '']), ...opts]); return d; };
let appelsApicil = [];
const FORMULES_APICIL = [['siApiSanteEquilibre1', 85.52], ['siApiSanteEquilibre2', 131.97], ['siApiSanteSerenite1', 106.59]];
const sites = { crm: construire('crm', '--en-ligne', '--envoi', CRM), repli: construire('repli', '--en-ligne', '--envoi', '', '--repli', 'whatsapp'), test: construire('test'),
  sansTchat: construire('sanstchat', '--en-ligne', '--envoi', CRM, '--tchat', 'aucun'),
  tchat: construire('tchat', '--en-ligne', '--envoi', CRM, '--tchat', 'direct', '--tchat-crm', 'https://crm.exemple.invalid/tchat'),
  google: construire('google', '--en-ligne', '--envoi', CRM, '--google', 'G-ESSAI123') };
const errs = [], err = m => errs.push(m);
const types = { '.html': 'text/html; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.txt': 'text/plain', '.xml': 'application/xml' };

// Sert un dossier construit à une adresse donnée, comme GitHub Pages (dossier/ -> dossier/index.html, sinon 404.html)
async function servir(ctx, base, dir) {
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await ctx.route(/crm\.capisante\.fr/, r => { err('un essai a tenté de joindre le vrai CRM'); r.abort(); });   // jamais de vraie demande pendant un essai
  await ctx.route(/\/\/capisante\.fr\//, r => { err('un essai a tenté de joindre le vrai relais'); r.abort(); });
  await ctx.route(RELAIS_REGLAGES, r => r.fulfill({ status: reglagesReponse.status, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(reglagesReponse.corps) }));
  await ctx.route(RELAIS_APRIL, r => { if (r.request().method() === 'OPTIONS') return r.fulfill({ status: 204, headers: { 'access-control-allow-origin': 'https://www.santeo.net', 'access-control-allow-headers': 'Content-Type', 'access-control-allow-methods': 'POST, OPTIONS' } });
    const corps = JSON.parse(r.request().postData() || 'null'); appelsApril.push(corps);
    const tarifs = { SanteMix: { '01|01': 72.6, '02|01': 80.1, '02|02': 86.52 }, SimplySante: { '01': 89.35, '02': 100.98 } };
    r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': 'https://www.santeo.net' },
      body: JSON.stringify({ environnement: 'production', famille: false, liensFamille: true, produits: (corps.produits || []).map(c => tarifs[c] ? { produit: c, etat: 'ok', niveaux: tarifs[c] } : { produit: c, etat: 'refus', message: 'essai' }) }) }); });
  await ctx.route(RELAIS_APICIL, r => { if (r.request().method() === 'OPTIONS') return r.fulfill({ status: 204, headers: { 'access-control-allow-origin': 'https://www.santeo.net', 'access-control-allow-headers': 'Content-Type', 'access-control-allow-methods': 'POST, OPTIONS' } });
    appelsApicil.push(JSON.parse(r.request().postData() || 'null'));
    r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': 'https://www.santeo.net' }, body: JSON.stringify({ Formules: FORMULES_APICIL.map(([c, t]) => ({ LibelleFormule: c, TarifFormule: String(t) })) }) }); });
  await ctx.route(base + '**', r => {
    let f = decodeURIComponent(new URL(r.request().url()).pathname.slice(new URL(base).pathname.length));
    if (f === '' || f.endsWith('/')) f += 'index.html';
    let p = path.join(dir, f), status = 200;
    // GitHub Pages renvoie dossier -> dossier/ ; Playwright ne suit pas un renvoi intercepté, on sert donc directement dossier/index.html
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
    if (!fs.existsSync(p)) { p = path.join(dir, '404.html'); status = 404; }
    r.fulfill({ status, body: fs.readFileSync(p), contentType: types[path.extname(p)] || 'application/octet-stream' });
  });
}

async function remplir(p) {
  await p.fill('#age', '21/07/1981'); await p.fill('#cp', '75012'); await p.waitForTimeout(250);
  await devoiler(p); await p.click('[data-c="0"]'); await p.waitForTimeout(700);
  await p.selectOption('#civ', 'Madame'); await p.fill('#prenom', 'Camille'); await p.fill('#nom', 'Essai');
  await p.fill('#tel', '06 12 34 56 78'); await p.fill('#mail', 'camille.essai@exemple.fr');
}

(async () => {
  const b = await chromium.launch();
  // 1. Fichiers du site en ligne
  const d = sites.crm, idx = fs.readFileSync(d + '/index.html', 'utf8');
  for (const f of ['index.html', '404.html', 'mentions-legales/index.html', 'robots.txt', 'sitemap.xml', 'partage.jpg', 'icone-48.png', 'icone-180.png', 'images/Logo_santeo_pt.png'])
    if (!fs.existsSync(path.join(d, f))) err('en ligne : fichier manquant ' + f);
  const doit = (cond, m) => { if (!cond) err(m); };
  doit(/<meta name="robots" content="index, follow">/.test(idx), 'en ligne : pas « index, follow »');
  doit(!/noindex/.test(idx) && !/bandeau-test" role/.test(idx), 'en ligne : noindex ou bandeau de test présent');
  doit(/<link rel="canonical" href="https:\/\/www\.santeo\.net\/">/.test(idx), 'en ligne : adresse canonique');
  doit(/og:image" content="https:\/\/www\.santeo\.net\/partage\.jpg"/.test(idx), 'en ligne : image de partage');
  doit((idx.match(/<title>/g) || []).length === 1, 'en ligne : un seul titre');
  doit(!/__[A-Z][A-Z_]*__/.test(idx), 'en ligne : repère non remplacé');
  doit(!/fcohen@/.test(idx), 'en ligne : adresse e-mail personnelle');
  try { const j = JSON.parse(idx.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1]); doit(j['@type'] === 'InsuranceAgency', 'fiche Google : type'); }
  catch (e) { err('fiche Google illisible : ' + e.message); }
  doit(/Sitemap: https:\/\/www\.santeo\.net\/sitemap\.xml/.test(fs.readFileSync(d + '/robots.txt', 'utf8')), 'robots.txt en ligne');
  // Guide de la mutuelle : une page par article, liste, plan du site, données pour Google
  const guide = fs.readdirSync(S + '/guide').filter(f => f.endsWith('.json')).map(f => JSON.parse(fs.readFileSync(S + '/guide/' + f, 'utf8')));
  doit(guide.length >= 6, 'guide : au moins 6 articles (' + guide.length + ')');
  doit(/<a href="guide\/">Guide de la mutuelle<\/a>/.test(idx), 'accueil : lien « Guide de la mutuelle » absent du pied de page');
  doit(!/guide-liens|<a href="guide\/[a-z0-9-]+\/">/.test(idx), 'accueil : les titres des articles ne doivent pas être sur l\'accueil (ils sont dans le guide)');
  doit(idx.includes('<img class="couple" src="images/couple.webp"') && fs.existsSync(d + '/images/couple.webp'), 'accueil : photo du couple absente (en-tête)');
  doit(idx.includes('<img class="brand-logo" src="images/santeo-logo.webp"') && fs.existsSync(d + '/images/santeo-logo.webp'), 'accueil : logo Santéo absent (fichier à part)');
  { const chap = JSON.parse(fs.readFileSync(S + '/chapitres.json', 'utf8')).chapitres.map(c => c.id), som = fs.readFileSync(d + '/guide/index.html', 'utf8');
    for (const a of guide) doit(chap.includes(a.chapitre), a.slug + ' : chapitre absent ou inconnu (' + a.chapitre + ')');
    for (const c of chap) if (guide.some(a => a.chapitre === c)) doit(som.includes('<section class="chapitre" id="' + c + '">'), 'sommaire du guide : chapitre absent ' + c); }
  doit((idx.match(/<h1[ >]/g) || []).length === 1, 'accueil : un seul titre h1 (' + (idx.match(/<h1[ >]/g) || []).length + ')');
  { const m = idx.match(/<meta name="description" content="([^"]*)"/); doit(m && m[1].length <= 155, 'accueil : description pour Google trop longue ou absente'); }
  { const l = (idx.match(/data:image\/[a-z]+;base64,[A-Za-z0-9+\/=]+/g) || []).reduce((s, x) => s + x.length, 0);
    doit(l < 120 * 1024, 'accueil : images intégrées trop lourdes (' + Math.round(l / 1024) + ' Ko)'); }
  const plan = fs.readFileSync(d + '/sitemap.xml', 'utf8');
  doit(plan.includes('https://www.santeo.net/guide/</loc>'), 'plan du site : page du guide absente');
  for (const a of guide) {
    const f = path.join(d, 'guide', a.slug, 'index.html');
    if (!fs.existsSync(f)) { err('guide : page manquante ' + a.slug); continue; }
    const h = fs.readFileSync(f, 'utf8');
    doit((h.match(/<h1>/g) || []).length === 1, a.slug + ' : un seul titre h1');
    doit(h.includes('<link rel="canonical" href="https://www.santeo.net/guide/' + a.slug + '/">'), a.slug + ' : adresse canonique');
    doit(/<meta name="robots" content="index, follow">/.test(h) && !/__[A-Z][A-Z_]*__/.test(h), a.slug + ' : robots ou repère non remplacé');
    doit(a.titre_page.length <= 60 && a.description.length <= 160, a.slug + ' : titre ou description trop longs pour Google');
    doit(plan.includes('https://www.santeo.net/guide/' + a.slug + '/</loc>'), a.slug + ' : absent du plan du site');
    doit(!/fcohen@|santeo\.net\/guide/.test(a.slug) && !/(april|avenir(?! de l'assurance maladie)|mcci|alptis|apicil|swiss ?life|harmonie|mgen)/i.test(fs.readFileSync(S + '/guide/' + a.slug + '.html', 'utf8')), a.slug + ' : nom d\'assureur dans un article');
    { const src = fs.readFileSync(S + '/guide/' + a.slug + '.html', 'utf8'), liens = [...src.matchAll(/href="\.\.\/([a-z0-9-]+)\/"/g)].map(m => m[1]);   // « ../../ » (comparateur) n'est pas un article
      for (const l of liens) doit(l !== a.slug && guide.some(g => g.slug === l), a.slug + ' : lien vers un article absent ou vers lui-même : ' + l);
      doit(liens.length >= 2, a.slug + ' : moins de 2 liens vers d\'autres articles (' + liens.length + ')'); }
    if (a.schema_dents) doit(h.includes('<figure class="schema-dents">') && !h.includes('<div class="schema-dents"></div>')
      && (h.match(/class="sd-mat"/g) || []).length === Object.keys(a.schema_dents.materiaux).length, a.slug + ' : schéma des dents absent ou incomplet');
    try { const j = JSON.parse(h.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]); const types = j['@graph'].map(x => x['@type']);
      doit(types.includes('Article') && types.includes('BreadcrumbList') && types.includes('FAQPage'), a.slug + ' : données Google ' + types); }
    catch (e) { err(a.slug + ' : données Google illisibles ' + e.message); }
  }
  // Anciennes adresses de l'ancien site connues de Google : une page de renvoi immédiat vers une page qui existe
  const renvois = JSON.parse(fs.readFileSync(S + '/renvois.json', 'utf8')).renvois;
  doit(Object.keys(renvois).length >= 40, 'renvois : au moins 40 anciennes adresses (' + Object.keys(renvois).length + ')');
  for (const [ancienne, cible] of Object.entries(renvois)) {
    const f = path.join(d, ancienne.slice(1) + (ancienne.endsWith('/') ? 'index.html' : '.html'));
    if (!fs.existsSync(f)) { err('renvoi absent : ' + ancienne); continue; }
    const h = fs.readFileSync(f, 'utf8'), u = 'https://www.santeo.net' + cible;
    doit(h.includes('<link rel="canonical" href="' + u + '">') && h.includes('content="0; url=' + u + '"') && h.includes('location.replace("' + u + '")')
      && h.includes('content="index, follow"'), 'renvoi incomplet : ' + ancienne);
    doit(fs.existsSync(path.join(d, cible.slice(1), 'index.html')), 'renvoi vers une page absente : ' + ancienne + ' -> ' + cible);
    doit(!plan.includes(ancienne), 'renvoi présent dans le plan du site : ' + ancienne);
  }
  const t = fs.readFileSync(sites.test + '/index.html', 'utf8');
  doit(/noindex, nofollow/.test(t) && /bandeau-test" role/.test(t) && /Disallow: \//.test(fs.readFileSync(sites.test + '/robots.txt', 'utf8')), 'site de test : doit rester caché, avec bandeau');

  for (const [nom, opt] of [['tel', devices['iPhone 13']], ['pc', { viewport: { width: 1280, height: 900 } }]]) {
    // 2. Envoi vers le CRM (simulé), visiteur venu par le lien WhatsApp
    let ctx = await b.newContext(opt); await servir(ctx, 'https://www.santeo.net/', sites.crm);
    let recu = null, reponse = { status: 200, body: '{"ok":true,"id":"T1"}' };
    await ctx.route(CRM, r => { if (r.request().method() === 'POST') recu = JSON.parse(r.request().postData()); r.fulfill({ status: reponse.status, contentType: 'application/json', body: reponse.body, headers: { 'access-control-allow-origin': 'https://www.santeo.net' } }); });
    let p = await ctx.newPage(); p.on('pageerror', e => err(nom + ' : ' + e.message));
    await p.goto('https://www.santeo.net/?src=whatsapp'); await remplir(p);
    // « Votre accord » : le détail des accords et des données est replié, et s'affiche au clic
    const replie = !(await p.isVisible('.votre-accord p.rgpd')); await p.click('.votre-accord summary');
    doit(replie && await p.isVisible('.votre-accord p.rgpd'), nom + ' : « Votre accord » ne s\'ouvre pas comme prévu');
    await p.click('#send'); await p.waitForTimeout(500);
    const fin = (await p.textContent('#done')) || '';
    doit(/bien arrivée/.test(fin), nom + ' : pas de confirmation après envoi (' + fin.slice(0, 60) + ')');
    doit(/Merci Camille/.test(fin) && /camille\.essai@exemple\.fr/.test(fin) && /Aucun appel/.test(fin) && !(await p.isVisible('#form-panel .form-intro'))
      && (await p.textContent('#t-form')) === 'Demande envoyée', nom + ' : confirmation incomplète ou phrase « Indiquez vos coordonnées » encore affichée');
    doit(recu && recu.provenance === 'Site Santéo – WhatsApp' && recu.prenom === 'Camille' && recu.offre && recu.offre.numero === 1
      && recu.offre.cotisation_mensuelle > 0 && recu.offre.gamme && recu.code_postal === '75012' && recu.date_naissance === '21/07/1981'
      && recu.accord_recontact === false && recu.texte_accord === '' && recu.site_web === '' && recu.test === false && /^https:\/\/www\.santeo\.net\//.test(recu.page),
      nom + ' : demande reçue incomplète ' + JSON.stringify(recu));
    console.log(nom, '| CRM :', fin.trim().slice(0, 70), '| provenance :', recu && recu.provenance, '| offre :', recu && JSON.stringify(recu.offre));
    // 2 bis. Le CRM répond par une erreur : le visiteur peut réessayer ou passer par WhatsApp
    reponse = { status: 409, body: '{"ok":false,"erreur":"Essai refusé : ce téléphone appartient à une fiche réelle"}' };
    await p.goto('https://www.santeo.net/'); await remplir(p); await p.check('#c-accord');
    await p.click('#send'); await p.waitForTimeout(500);
    const e2 = (await p.textContent('#form-err')) || '';
    doit(/n'a pas pu partir : Essai refusé : ce téléphone appartient à une fiche réelle\. Corrigez et réessayez/.test(e2) && await p.isEnabled('#send') && await p.isVisible('#lead'), nom + ' : erreur du CRM mal signalée (' + e2 + ')');
    doit(recu.provenance === 'Site Santéo – WhatsApp', nom + ' : la provenance doit rester pendant la visite');
    doit(recu.accord_recontact === true && recu.texte_accord.length > 20, nom + ' : accord coché non transmis');
    console.log(nom, '| erreur CRM :', e2.trim());
    // 2 ter. L'adresse renvoie une page (CRM pas encore en service) : ce n'est pas une confirmation
    reponse = { status: 200, body: '<!doctype html><html></html>' };
    await p.goto('https://www.santeo.net/'); await remplir(p); await p.click('#send'); await p.waitForTimeout(500);
    const e3 = (await p.textContent('#form-err')) || '';
    doit(/n'a pas pu partir\. Vérifiez votre connexion/.test(e3) && !(await p.isVisible('#done')), nom + ' : une page HTML a été prise pour une confirmation (' + e3 + ')');
    // 3. Anciennes adresses : /mentions-legales ouvre les mentions, toute autre adresse revient à l'accueil
    await p.goto('https://www.santeo.net/mentions-legales'); await p.waitForURL('https://www.santeo.net/#mentions-legales', { timeout: 8000 }).catch(() => {}); await p.waitForTimeout(400);
    doit(p.url() === 'https://www.santeo.net/#mentions-legales' && await p.isVisible('#vue-mentions'), nom + ' : /mentions-legales -> ' + p.url());
    const ment = (await p.textContent('#vue-mentions', { timeout: 3000 }).catch(() => '')) || '';
    doit(/21 342 €/.test(ment) && /GitHub, Inc\./.test(ment) && !/OVH SAS/.test(ment) && !/à compléter/.test(await p.innerText('#vue-mentions')), nom + ' : mentions légales à jour');
    await p.goto('https://www.santeo.net/questions'); await p.waitForURL('https://www.santeo.net/', { timeout: 8000 }).catch(() => {}); await p.waitForTimeout(400);
    doit(p.url() === 'https://www.santeo.net/' && await p.isVisible('#vue-comparateur'), nom + ' : ancienne adresse -> ' + p.url());
    const hs = await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    doit(!hs, nom + ' : défilement horizontal');
    await ctx.close();
    // 4. Repli WhatsApp (CRM pas encore ouvert)
    ctx = await b.newContext(opt); await servir(ctx, 'https://www.santeo.net/', sites.repli);
    await ctx.route(/wa\.me|whatsapp\.com/, r => r.fulfill({ status: 200, body: 'WhatsApp' }));
    p = await ctx.newPage(); p.on('pageerror', e => err(nom + ' repli : ' + e.message));
    await p.goto('https://www.santeo.net/'); await remplir(p); await p.click('#send'); await p.waitForTimeout(500);
    const lien = await p.getAttribute('#done a.btn', 'href').catch(() => null);
    const msg = lien ? decodeURIComponent(new URL(lien).searchParams.get('text') || '') : '';
    doit(/^https:\/\/wa\.me\/33153198646\?text=/.test(lien || '') && /Option 1 à/.test(msg) && /Camille Essai/.test(msg) && /75012/.test(msg), nom + ' : repli WhatsApp ' + lien);
    console.log(nom, '| repli WhatsApp :', msg.split('\n').length, 'lignes');
    // 5. Réglage « aucun » : pas de tchat
    { const c5 = await b.newContext(opt); await servir(c5, 'https://www.santeo.net/', sites.sansTchat); const p5 = await c5.newPage();
      await p5.goto('https://www.santeo.net/'); await p5.waitForTimeout(300);
      doit(!(await p5.isVisible('#tchat-bouton')), nom + ' : avec le réglage « aucun », le tchat doit être caché'); await c5.close(); }
    await ctx.close();
    // 6. Tchat « direct » : le message part au CRM (simulé), la réponse d'Antony s'affiche ici, la conversation reste après rechargement
    ctx = await b.newContext(opt); await servir(ctx, 'https://www.santeo.net/', sites.tchat);
    let envoiT = null, lectures = 0, waOuvert = false; const envoisT = [];
    await ctx.route(/wa\.me|whatsapp\.com/, r => { waOuvert = true; r.abort(); });
    await ctx.route('https://crm.exemple.invalid/tchat**', r => {
      const req = r.request(), cors = { 'access-control-allow-origin': 'https://www.santeo.net' };
      if (req.method() === 'POST') { envoiT = JSON.parse(req.postData()); envoisT.push(envoiT); return r.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: '{"ok":true,"conversation":"c-123","message":"m1"}' }); }
      lectures++;
      const msgs = lectures === 1 ? [{ id: 'm1', de: 'visiteur', texte: 'Les lunettes ?' }, { id: 'm2', de: 'antony', texte: 'Bonjour, oui : 200 € tous les deux ans.' }] : [];
      r.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify({ ok: true, messages: msgs }) });
    });
    p = await ctx.newPage(); p.on('pageerror', e => err(nom + ' tchat direct : ' + e.message));
    await p.goto('https://www.santeo.net/'); await p.waitForTimeout(300);
    doit(/Posez-moi vos questions/.test((await p.textContent('#tchat-invite')) || '') && await p.isVisible('#tchat-invite'), nom + ' : bulle « Posez-moi vos questions » absente');
    await p.click('#tchat-invite'); const ligne = 'vous répond ici';
    doit(await p.isVisible('#tchat-fenetre') && !(await p.isVisible('#tchat-invite')), nom + ' : la bulle doit ouvrir le tchat et se cacher');
    doit((await p.textContent('.tchat-envoyer')) === 'Envoyer' && ((await p.textContent('#tchat-fil')) || '').trim() === '', nom + ' : tchat direct : bouton « Envoyer » et fenêtre vide au départ');
    await p.fill('#tchat-texte', 'Les lunettes ?'); await p.press('#tchat-texte', 'Enter'); await p.waitForTimeout(400);   // Entrée envoie
    // Premier message : il attend le prénom ou pseudo (Fabrice, 11/11/2026), demandé dans une petite fenêtre avec l'oiseau
    // (Fabrice, 22/11/2026 : « un petit popup rigolo type l'oiseau »), rien ne part encore
    const filQ = (await p.textContent('#tchat-fil')) || '';
    const popQ = await p.evaluate(() => { const f = document.getElementById('tchat-fenetre').getBoundingClientRect(), c = document.querySelector('.tchat-pseudo-carte').getBoundingClientRect(),
      i = document.getElementById('tchat-pseudo-champ').getBoundingClientRect(), o = document.querySelector('.tchat-pseudo-oiseau').getBoundingClientRect();
      return { dedans: c.left >= f.left - 1 && c.right <= f.right + 1 && o.top >= f.top - 1 && i.bottom <= f.bottom + 1, oiseau: o.width > 60 && o.height > 40,
        calques: document.querySelectorAll('.tchat-pseudo-oiseau .m-pseudo img').length, focus: document.activeElement && document.activeElement.id, titre: document.getElementById('tchat-pseudo-titre').textContent }; });
    doit(envoisT.length === 0 && /Les lunettes \?/.test(filQ) && !/merci d'indiquer/.test(filQ) && await p.isVisible('#tchat-pseudo') && popQ.dedans && popQ.oiseau && popQ.calques === 4
      && popQ.focus === 'tchat-pseudo-champ' && /Comment puis-je vous appeler/.test(popQ.titre),
      nom + ' : tchat : la petite fenêtre du pseudo, avec l\'oiseau, doit venir avant tout envoi (' + filQ + ' | ' + JSON.stringify(popQ) + ')');
    await p.press('#tchat-pseudo-champ', 'Enter'); await p.waitForTimeout(300);
    doit(envoisT.length === 0 && await p.isVisible('#tchat-pseudo') && await p.evaluate(() => document.getElementById('tchat-pseudo').classList.contains('erreur')),
      nom + ' : tchat : un pseudo vide ne doit rien envoyer');
    await p.fill('#tchat-pseudo-champ', '  Rose  '); await p.press('#tchat-pseudo-champ', 'Enter'); await p.waitForTimeout(5200);
    const filD = (await p.textContent('#tchat-fil')) || '';
    doit(/vous répond ici/.test(ligne) && envoisT.length === 1 && envoiT.texte === 'Les lunettes ?' && envoiT.pseudo === 'Rose' && envoiT.conversation === null && envoiT.site_web === '' && 'contexte' in envoiT
      && /200 € tous les deux ans/.test(filD) && !waOuvert, nom + ' : tchat direct (' + ligne + ' | ' + JSON.stringify(envoiT) + ' | ' + filD.slice(-80) + ')');
    doit(!(await p.isVisible('#tchat-pseudo')) && !/Rose/.test(filD) && (await p.getAttribute('#tchat-texte', 'placeholder')) === 'Votre message',
      nom + ' : tchat : après le pseudo, la petite fenêtre se ferme et le pseudo n\'est pas un message du fil');
    await p.fill('#tchat-texte', 'Et le dentaire ?'); await p.press('#tchat-texte', 'Enter'); await p.waitForTimeout(400);
    doit(envoisT.length === 2 && envoiT.texte === 'Et le dentaire ?' && envoiT.conversation === 'c-123' && envoiT.pseudo === 'Rose', nom + ' : tchat : 2e message sans nouvelle question, même conversation, même pseudo (' + JSON.stringify(envoiT) + ')');
    await p.reload(); await p.waitForTimeout(300); await p.click('#tchat-bouton');
    const filR = (await p.textContent('#tchat-fil')) || '';
    doit(/200 € tous les deux ans/.test(filR) && !(await p.isVisible('#tchat-pseudo')), nom + ' : la conversation du tchat ne reste pas après rechargement');
    console.log(nom, '| tchat direct : envois', envoisT.map(e => e.texte + ' / ' + e.pseudo).join(' ; '), '| lectures', lectures);
    await ctx.close();
    // 7. Visiteur connu par sa fiche (demande de comparatif envoyée une autre fois) : le pseudo est demandé quand même
    // (Fabrice, 22/11/2026 : « il fallait ajouter qu'il ajoute son pseudo »), puis le message part avec la fiche et le pseudo.
    // 7 bis. Conversation commencée sans pseudo (avant le 11/11/2026) : le pseudo est demandé au message suivant.
    for (const [cas, init] of [
      ['fiche', () => { try { localStorage.setItem('santeo-fiche', JSON.stringify({ fiche: '42' })); } catch (e) {} }],
      ['conversation', () => { try { localStorage.setItem('santeo-tchat', JSON.stringify({ conversation: 'c-ancienne', messages: [{ id: '7', de: 'visiteur', texte: 'Ancien message' }], dernier: '7', activite: Date.now(), pseudo: null, attendPseudo: false })); } catch (e) {} }],
    ]) {
      ctx = await b.newContext(opt); await servir(ctx, 'https://www.santeo.net/', sites.tchat);
      await ctx.addInitScript(init);
      const envoisC = [];
      await ctx.route('https://crm.exemple.invalid/tchat**', r => {
        const req = r.request(), cors = { 'access-control-allow-origin': 'https://www.santeo.net' };
        if (req.method() === 'POST') envoisC.push(JSON.parse(req.postData()));
        r.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: req.method() === 'POST' ? '{"ok":true,"conversation":"' + (cas === 'fiche' ? 'c-9' : 'c-ancienne') + '","message":"m9"}' : '{"ok":true,"messages":[]}' });
      });
      p = await ctx.newPage(); p.on('pageerror', e => err(nom + ' tchat ' + cas + ' : ' + e.message));
      await p.goto('https://www.santeo.net/'); await p.waitForTimeout(300); await p.click('#tchat-bouton');
      await p.fill('#tchat-texte', 'Bonjour'); await p.press('#tchat-texte', 'Enter'); await p.waitForTimeout(400);
      const filC = (await p.textContent('#tchat-fil')) || '';
      doit(envoisC.length === 0 && /Bonjour/.test(filC) && await p.isVisible('#tchat-pseudo'),
        nom + ' : tchat (' + cas + ') : sans pseudo connu, la petite fenêtre du pseudo doit venir avant l\'envoi (' + filC + ')');
      await p.fill('#tchat-pseudo-champ', 'Lina'); await p.click('#tchat-pseudo-form button'); await p.waitForTimeout(400);
      const e = envoisC[0] || {};
      doit(envoisC.length === 1 && e.texte === 'Bonjour' && e.pseudo === 'Lina'
        && (cas === 'fiche' ? e.identite && e.identite.fiche === '42' && e.conversation === null : e.conversation === 'c-ancienne'),
        nom + ' : tchat (' + cas + ') : le message doit partir avec le pseudo (' + JSON.stringify(envoisC) + ')');
      await p.fill('#tchat-texte', 'Et ensuite ?'); await p.press('#tchat-texte', 'Enter'); await p.waitForTimeout(400);
      doit(envoisC.length === 2 && envoisC[1].pseudo === 'Lina' && !(await p.isVisible('#tchat-pseudo')),
        nom + ' : tchat (' + cas + ') : le pseudo n\'est demandé qu\'une fois');
      await ctx.close();
    }
  }
  // 8. Bandeau cookies (statistiques Google) : rien de Google avant l'accord, « Refuser » aussi simple qu'« Accepter »
  for (const [nom, opt] of [['tel', devices['iPhone 13']], ['pc', { viewport: { width: 1280, height: 850 } }]]) {
    const gtm = [];
    const nouveau = async () => { const c = await b.newContext(opt); await servir(c, 'https://www.santeo.net/', sites.google);
      await c.route(CRM, r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': 'https://www.santeo.net' }, body: '{"ok":true,"id":"777"}' }));
      await c.route(/googletagmanager\.com|google-analytics\.com|doubleclick\.net|googleadservices\.com/, r => { gtm.push(r.request().url()); r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }); });
      return c; };
    // Sans réglage : pas de bandeau, pas de lien « Cookies »
    { const c = await b.newContext(opt); await servir(c, 'https://www.santeo.net/', sites.crm); const q = await c.newPage(); await q.goto('https://www.santeo.net/'); await q.waitForTimeout(300);
      doit(!(await q.isVisible('#cookies')) && !(await q.isVisible('#cookies-lien')), nom + ' : sans statistiques Google, ni bandeau ni lien « Cookies »'); await c.close(); }
    // Refuser
    let c = await nouveau(); let q = await c.newPage(); q.on('pageerror', e => err(nom + ' cookies : ' + e.message));
    await q.goto('https://www.santeo.net/'); await q.waitForTimeout(400);
    const bt = await q.$$eval('.cookies-choix button', l => l.map(x => [x.textContent, getComputedStyle(x).backgroundColor, getComputedStyle(x).fontSize, x.offsetWidth]));
    doit(await q.isVisible('#cookies') && gtm.length === 0, nom + ' : bandeau visible et rien de Google avant le choix (' + gtm.join(' ') + ')');
    doit(bt.length === 2 && bt[0][0] === 'Refuser' && bt[1][0] === 'Accepter' && bt[0][1] === bt[1][1] && bt[0][2] === bt[1][2] && Math.abs(bt[0][3] - bt[1][3]) <= 2, nom + ' : « Refuser » et « Accepter » doivent se ressembler ' + JSON.stringify(bt));
    const tchatBas = await q.$eval('#tchat', x => x.getBoundingClientRect().bottom), bandeauHaut = await q.$eval('#cookies', x => x.getBoundingClientRect().top);
    doit(tchatBas <= bandeauHaut + 1, nom + ' : la bulle du tchat ne doit pas être cachée par le bandeau (' + tchatBas + ' > ' + bandeauHaut + ')');
    await q.click('#cookies-non'); await q.waitForTimeout(300);
    doit(!(await q.isVisible('#cookies')) && gtm.length === 0, nom + ' : après « Refuser », bandeau caché et rien de Google');
    await q.reload(); await q.waitForTimeout(400);
    doit(!(await q.isVisible('#cookies')) && gtm.length === 0 && await q.isVisible('#cookies-lien'), nom + ' : le refus doit être gardé, avec le lien « Cookies » en bas de page');
    await q.click('#cookies-lien'); await q.waitForTimeout(200);
    doit(await q.isVisible('#cookies'), nom + ' : le lien « Cookies » doit rouvrir le bandeau');
    await c.close();
    // Accepter, puis une demande envoyée est comptée
    c = await nouveau(); q = await c.newPage(); q.on('pageerror', e => err(nom + ' cookies : ' + e.message));
    await q.goto('https://www.santeo.net/'); await q.waitForTimeout(300); await q.click('#cookies-oui'); await q.waitForTimeout(400);
    doit(gtm.some(u => /gtag\/js\?id=G-ESSAI123/.test(u)), nom + ' : après « Accepter », la balise Google doit se charger (' + gtm.join(' ') + ')');
    const avant = await q.evaluate(() => (window.dataLayer || []).map(a => Array.from(a)).filter(a => a[0] === 'event').map(a => a[1]));
    doit(!avant.includes('comparateur_resultats') && !avant.includes('formulaire_ouvert'), nom + ' : aucun événement de parcours avant la saisie (' + avant.join(',') + ')');
    await remplir(q); await q.check('#c-accord').catch(() => {}); await q.click('#send'); await q.waitForTimeout(700);
    const evts = await q.evaluate(() => (window.dataLayer || []).map(a => Array.from(a)).filter(a => a[0] === 'event').map(a => a[1]));
    doit(evts.includes('generate_lead'), nom + ' : la demande envoyée doit être comptée (événements : ' + evts.join(',') + ')');
    doit(evts.filter(e => e === 'comparateur_resultats').length === 1 && evts.filter(e => e === 'formulaire_ouvert').length === 1,
      nom + ' : offres affichées et formulaire ouvert doivent être comptés une fois chacun (événements : ' + evts.join(',') + ')');
    const consent = await q.evaluate(() => (window.dataLayer || []).map(a => Array.from(a)).filter(a => a[0] === 'consent').map(a => a[1] + ':' + a[2].analytics_storage));
    doit(consent.join(',') === 'default:denied,update:granted', nom + ' : signaux d\'accord Google ' + consent.join(','));
    console.log(nom, '| cookies : boutons', bt.map(x => x[0]).join('/'), '| Google chargé après accord :', gtm.length > 0, '| événements', evts.join(','));
    await c.close();
  }
  // 10. API Santé (VERALTI) : un appel au relais par profil complet, offres ajoutées, choix suivi par son identité
  for (const [nom, opt] of [['tel', devices['iPhone 13']], ['pc', { viewport: { width: 1280, height: 850 } }]]) {
    appelsApicil = [];
    const c = await b.newContext(opt); await servir(c, 'https://www.santeo.net/', sites.crm); const q = await c.newPage();
    q.on('pageerror', e => err(nom + ' api santé : ' + e.message));
    await q.goto('https://www.santeo.net/'); await q.waitForTimeout(300);
    await q.fill('#cp', '75012'); await q.type('#age', '21071966', { delay: 30 }); await q.waitForTimeout(1500);
    const toutes = async () => { for (let k = 0; k < 10 && await q.isVisible('#more-offers'); k++) { await devoiler(q); await q.click('#more-offers'); await q.waitForTimeout(150); }
      return q.$$eval('#offers article.offer', l => l.map((o, i) => ({ i, nom: (o.querySelector('.o-real') || {}).textContent || '', prix: (o.querySelector('.o-price') || {}).textContent || '' }))); };
    const liste = await toutes(), api = liste.filter(o => /API SANT/i.test(o.nom));
    doit(appelsApicil.length === 1, nom + ' : un seul appel au relais API Santé attendu (' + appelsApicil.length + ')');
    const p0 = appelsApicil[0] || {};
    doit(p0.codePostalAssure === '75012' && p0.situationProfessionnelle === 'SALARIE' && p0.beneficiaires && p0.beneficiaires[0].dateNaissance === '1966-07-21', nom + ' : profil envoyé ' + JSON.stringify(p0));
    doit(api.length === 3 && api.some(o => /85,52/.test(o.prix)), nom + ' : offres API Santé affichées ' + JSON.stringify(api));
    // Choisir une offre API Santé, puis changer un curseur : l'option choisie suit (ou se retire), jamais une autre offre à sa place
    if (api.length) {
      await devoiler(q); await q.click('[data-c="' + api[0].i + '"]'); await q.waitForTimeout(400);
      const lire = () => q.$eval('#chosen-box', e => ({ opt: (e.querySelector('strong') || {}).textContent || '', prix: (e.querySelector('.ch-prix') || {}).textContent || '' }));
      const avant = await lire();
      await q.$eval('#cur-hosp', e => { e.value = String(+e.value + 1); e.dispatchEvent(new Event('input', { bubbles: true })); }); await q.waitForTimeout(400);   // un cran de plus au curseur : la liste change
      const apres = await lire(), liste2 = await toutes(), n = +(apres.opt.match(/\d+/) || [0])[0];
      const ligne = liste2[n - 1];
      doit(!apres.opt || (ligne && /API SANT/i.test(ligne.nom) && ligne.prix.replace(/\s/g, '') === apres.prix.replace(/\s/g, '') && apres.prix === avant.prix),
        nom + ' : l\'option choisie a changé d\'offre ' + JSON.stringify({ avant, apres, ligne }));
    }
    await q.fill('#cp', '75011'); await q.waitForTimeout(1200);
    doit(appelsApicil.length === 2, nom + ' : un nouveau profil doit faire un nouvel appel (' + appelsApicil.length + ')');
    console.log(nom, '| API Santé :', api.map(o => o.prix.trim()).join(' ; '), '| appels', appelsApicil.length);
    await c.close();
  }
  // 11. Espace admin : réglages lus dans le CRM (produits, logos, tchat), derniers réglages gardés si le CRM ne répond pas
  { const cat = JSON.parse(fs.readFileSync(sites.tchat + '/catalogue.json', 'utf8'));
    const codes = cat.compagnies.flatMap(c => c.produits.map(p => p.code));
    doit(codes.includes('MCCINOVA') && codes.includes('APICIL') && codes.includes('APRIL:SanteMix') && cat.version, 'catalogue.json : codes ou version manquants');
    doit(/noindex/.test(fs.readFileSync(sites.tchat + '/admin/index.html', 'utf8')), 'admin : page absente ou indexable'); }
  for (const [nom, opt] of [['tel', devices['iPhone 13']], ['pc', { viewport: { width: 1280, height: 850 } }]]) {
    const c = await b.newContext(opt); await servir(c, 'https://www.santeo.net/', sites.tchat); const q = await c.newPage();
    q.on('pageerror', e => err(nom + ' réglages : ' + e.message));
    const etat = async () => { await q.fill('#cp', '75012'); await q.fill('#age', '21/07/1966'); await q.waitForTimeout(1300);
      for (let k = 0; k < 10 && await q.isVisible('#more-offers'); k++) { await devoiler(q); await q.click('#more-offers'); await q.waitForTimeout(120); }
      return q.evaluate(() => ({ mcci: [...document.querySelectorAll('#offers .o-real')].filter(e => /MCCINOVA|FLEXIA|SOLENCIA/.test(e.textContent)).length,
        offres: document.querySelectorAll('#offers article.offer').length, logoMcci: !document.querySelector('.logo-box[data-co="MCCI"]').hidden,
        tchat: !document.getElementById('tchat').hidden })); };
    reglagesReponse = { status: 200, corps: { ok: true, produits: { MCCINOVA: false, FLEXIA: false, SOLENCIA: false }, logos: { MCCI: false }, tchat: false } };
    await q.goto('https://www.santeo.net/'); const e1 = await etat();
    doit(e1.mcci === 0 && e1.offres > 0 && !e1.logoMcci && !e1.tchat, nom + ' : réglages de l\'admin non appliqués ' + JSON.stringify(e1));
    reglagesReponse = { status: 503, corps: { ok: false } };
    await q.reload(); const e2 = await etat();
    doit(e2.mcci === 0 && !e2.logoMcci && !e2.tchat, nom + ' : CRM muet, les derniers réglages doivent rester ' + JSON.stringify(e2));
    await c.close();
    const c2 = await b.newContext(opt); await servir(c2, 'https://www.santeo.net/', sites.tchat); const q2 = await c2.newPage();
    await q2.goto('https://www.santeo.net/'); await q2.fill('#cp', '75012'); await q2.fill('#age', '21/07/1966'); await q2.waitForTimeout(1300);
    const e3 = await q2.evaluate(() => ({ offres: document.querySelectorAll('#offers article.offer').length, logoMcci: !document.querySelector('.logo-box[data-co="MCCI"]').hidden, tchat: !document.getElementById('tchat').hidden }));
    doit(e3.offres > 0 && e3.logoMcci && e3.tchat, nom + ' : CRM muet et aucun réglage connu : réglages par défaut attendus ' + JSON.stringify(e3));
    console.log(nom, '| espace admin : réglages appliqués', JSON.stringify(e1), '| CRM muet', JSON.stringify(e2), '| défaut', JSON.stringify(e3));
    await c2.close();
    reglagesReponse = { status: 200, corps: { ok: true, produits: {}, logos: {} } };
  }
  // 12. Vue de contrôle : noms des compagnies visibles seulement avec ?controle=1
  for (const [nom, opt] of [['tel', devices['iPhone 13']], ['pc', { viewport: { width: 1280, height: 850 } }]]) {
    const c = await b.newContext(opt); await servir(c, 'https://www.santeo.net/', sites.crm); const q = await c.newPage();
    q.on('pageerror', e => err(nom + ' contrôle : ' + e.message));
    const noms = async u => { await q.goto(u); await q.fill('#cp', '75012'); await q.fill('#age', '21/07/1966'); await q.waitForTimeout(1300);
      return q.$$eval('#offers .o-real', l => l.filter(e => e.offsetParent).map(e => e.textContent)); };
    const ordinaire = await noms('https://www.santeo.net/'), controle = await noms('https://www.santeo.net/?controle=1');
    doit(ordinaire.length === 0, nom + ' : un visiteur ordinaire ne doit pas voir les noms (' + ordinaire.length + ')');
    doit(controle.length >= 5 && controle.every(t => /^Contrôle : /.test(t)), nom + ' : vue de contrôle sans les noms ' + JSON.stringify(controle.slice(0, 2)));
    console.log(nom, '| vue de contrôle :', controle.slice(0, 2).join(' ; '));
    await c.close();
  }
  // 13. APRIL : un appel par profil, produits cochés (pas de produit d'indépendant pour un salarié), niveaux de la diagonale
  for (const [nom, opt] of [['tel', devices['iPhone 13']], ['pc', { viewport: { width: 1280, height: 850 } }]]) {
    appelsApril = [];
    const c = await b.newContext(opt); await servir(c, 'https://www.santeo.net/', sites.crm); const q = await c.newPage();
    q.on('pageerror', e => err(nom + ' april : ' + e.message));
    await q.goto('https://www.santeo.net/?controle=1'); await q.fill('#cp', '75012'); await q.type('#age', '21071966', { delay: 30 }); await q.waitForTimeout(1800);
    for (let k = 0; k < 12 && await q.isVisible('#more-offers'); k++) { await devoiler(q); await q.click('#more-offers'); await q.waitForTimeout(120); }
    const april = await q.$$eval('#offers article.offer', l => l.map(o => o.querySelector('.o-real').textContent + ' ' + o.querySelector('.o-price').textContent).filter(t => /APRIL/.test(t)));
    const a0 = appelsApril[0] || {};
    doit(appelsApril.length === 1 && JSON.stringify(a0.produits) === '["SanteMix","SimplySante"]' && a0.regime === 'SS' && a0.cp === '75012' && a0.assures && a0.assures[0].naissance === '1966-07-21' && a0.remise === false,
      nom + ' : appel APRIL ' + appelsApril.length + ' ' + JSON.stringify(a0));
    doit(april.length === 4 && april.some(t => /Santé Mix Proximité · Niv\. 1.*72,60/.test(t)) && !april.some(t => /80,10/.test(t)), nom + ' : offres APRIL ' + JSON.stringify(april));
    // Simply Santé n'a pas de tableau publié : « n.c. » (non communiqué), jamais « — » (non couvert)
    const simply = await q.$$eval('#offers article.offer', l => { const o = l.find(a => /Simply Santé/.test(a.textContent)); return o ? [...o.querySelectorAll('.pc')].map(e => e.textContent) : null; });
    doit(simply && simply.length && simply.every(t => t === 'n.c.'), nom + ' : garanties non communiquées affichées comme non couvertes ' + JSON.stringify(simply));
    await q.selectOption('#reg', 'TNS'); await q.waitForTimeout(1500);
    doit(appelsApril.length === 2 && appelsApril[1] && appelsApril[1].regime === 'TNS', nom + ' : appel APRIL pour un indépendant ' + JSON.stringify(appelsApril[1]));
    console.log(nom, '| APRIL :', april.join(' ; ').replace(/Contrôle : /g, ''), '| appels', appelsApril.length);
    await c.close();
  }
  // 14. Vos besoins en curseurs et les offres en cartes (Fabrice, 22/11/2026, d'après le comparateur de son CRM) : 3 cartes
  // d'offres par ligne sur ordinateur, 2 de 600 à 899 px, 1 sur téléphone ; rien qui déborde ; « Petit prix » sur la première
  // seulement (liste de la moins chère à la plus chère) ; aucun nom d'assureur ni promesse dans les cartes, APRIL et API Santé compris
  const ASSUREURS = /avenir|mcci|mutuelle verte|r[ée]voluo|april|apicil|alptis|veralti|api sant[ée]|\bnova\b|flexia|solencia|cap [ée]volution|cap nr|sant[ée] mix|simply|gamme|formule/i;
  for (const [nom, opt, parLigne, lignesBesoins] of [['tel', devices['iPhone 13'], 1, 5], ['moyen', { viewport: { width: 760, height: 900 } }, 2, 3], ['pc', { viewport: { width: 1280, height: 900 } }, 3, 1]]) {
    appelsApril = []; appelsApicil = [];
    const c = await b.newContext(opt); await servir(c, 'https://www.santeo.net/', sites.crm); const q = await c.newPage();
    q.on('pageerror', e => err(nom + ' cartes : ' + e.message));
    await q.goto('https://www.santeo.net/'); await q.fill('#age', '21/07/1981'); await q.fill('#cp', '75012'); await q.waitForTimeout(1800);   // offres APRIL et API Santé arrivées
    const mesure = () => q.evaluate(() => {
      const offres = [...document.querySelectorAll('#offers article.offer')], r = offres.map(o => o.getBoundingClientRect()), zone = document.getElementById('offers').getBoundingClientRect();
      const prix = offres.map(o => parseFloat(o.querySelector('.o-price').textContent.replace(/\s/g, '').replace(',', '.')));
      return { n: offres.length, lignes: new Set(r.map(x => Math.round(x.top))).size, premiereLigne: r.filter(x => Math.abs(x.top - r[0].top) < 2).length,
        largeur: r.length ? Math.round(r[0].width / zone.width * 100) : 0,
        deborde: [...document.querySelectorAll('#offers article.offer, #offers .o-col, #offers .o-actions, #needs .cell, #needs .b-tete, #needs .b-bornes')].filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.className),
        hs: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        badges: [...document.querySelectorAll('#offers .o-badge')].map(e => offres.indexOf(e.closest('article.offer')) + ':' + e.textContent),
        croissant: prix.every((x, i) => !i || prix[i - 1] <= x), textes: offres.map(o => o.innerText).join(' | '),
        nomsVisibles: [...document.querySelectorAll('#offers .o-real')].filter(e => e.offsetParent).length,
        boutons: offres.every(o => o.querySelector('[data-c]') && o.querySelector('[data-d]')),
        besoinsLignes: new Set([...document.querySelectorAll('#needs .col')].map(e => Math.round(e.getBoundingClientRect().top))).size,
        curseurs: [...document.querySelectorAll('#needs input[type=range]')].map(e => Math.round(e.getBoundingClientRect().height)) };
    });
    const m1 = await mesure();
    doit(m1.n === 6 && m1.premiereLigne === parLigne && m1.lignes === Math.ceil(6 / parLigne) && !m1.hs && !m1.deborde.length && m1.boutons
      && m1.largeur <= Math.ceil(100 / parLigne) && m1.largeur >= Math.floor(100 / parLigne) - 4,
      nom + ' : cartes d\'offres : ' + parLigne + ' par ligne attendues ' + JSON.stringify({ n: m1.n, lignes: m1.lignes, premiereLigne: m1.premiereLigne, largeur: m1.largeur, deborde: m1.deborde, hs: m1.hs }));
    doit(m1.besoinsLignes === lignesBesoins && m1.curseurs.length === 5 && m1.curseurs.every(h => h >= 44), nom + ' : cartes des besoins : ' + m1.besoinsLignes + ' lignes (attendu ' + lignesBesoins + '), curseurs ' + m1.curseurs.join(','));
    // « Petit prix » retiré ; sans besoin indiqué, aucune étoile (Fabrice, 25/11/2026) ; niveaux en écriture verte sur fond vert
    const vert = await q.evaluate(() => { const e = document.querySelector('#offers .pc.pc-oui'), z = document.querySelector('#offers .pc:not(.pc-oui)'); return e ? [getComputedStyle(e).color, getComputedStyle(e).backgroundColor, z ? z.textContent : '', getComputedStyle(document.querySelector('#offers .o-col .lab')).color] : null; });
    doit(m1.croissant && !m1.badges.length && vert && vert[0] === 'rgb(15, 107, 58)' && vert[1] === 'rgb(227, 245, 234)' && vert[3] === 'rgb(15, 122, 64)' && (!vert[2] || /—|n\.c\./.test(vert[2])),
      nom + ' : sans besoin, ni « Petit prix » ni étoile ; niveaux en vert sur fond vert ' + JSON.stringify([m1.badges, vert]));
    // Toutes les offres (APRIL et API Santé comprises) : aucun nom d'assureur, de gamme ni de formule, aucune promesse
    for (let k = 0; k < 12 && await q.isVisible('#more-offers'); k++) { await devoiler(q); await q.click('#more-offers'); await q.waitForTimeout(120); }
    const m2 = await mesure();
    doit(appelsApril.length === 1 && appelsApicil.length === 1 && m2.n > 40 && !ASSUREURS.test(m2.textes) && !/recommand|offert|gratuit|meilleur/i.test(m2.textes) && m2.nomsVisibles === 0,
      nom + ' : nom d\'assureur ou promesse dans les cartes : ' + ((m2.textes.match(ASSUREURS) || m2.textes.match(/recommand|offert|gratuit|meilleur/i) || [''])[0]) + ' (' + m2.n + ' offres, ' + m2.nomsVisibles + ' noms visibles)');
    doit(!m2.badges.length && m2.croissant && !m2.hs && !m2.deborde.length, nom + ' : toutes les offres : badge ' + JSON.stringify(m2.badges) + ', débordement ' + JSON.stringify(m2.deborde));
    // Au doigt (téléphone) ou à la souris : toucher le rail à 60 % règle le niveau 3 et filtre les offres
    const avant = await q.textContent('#count');
    await q.$eval('#cur-hono', e => e.scrollIntoView({ block: 'center' }));
    const rail = await q.$eval('#cur-hono', e => { const r = e.getBoundingClientRect(); return { x: r.left + 13 + (r.width - 26) * .6, y: r.top + r.height / 2 }; });
    if (nom === 'tel') await q.touchscreen.tap(rail.x, rail.y); else await q.mouse.click(rail.x, rail.y);
    await q.waitForTimeout(200);
    const touche = await q.$eval('#cur-hono', e => e.value + ' ' + e.getAttribute('aria-valuetext')), apres = await q.textContent('#count');
    doit(touche === '3 Au moins 180 %' && apres !== avant && /atteignent vos niveaux/.test(apres), nom + ' : curseur au toucher : ' + touche + ' | ' + apres);
    // Étoile sur les 3 offres les plus proches de la demande (honoraires au moins 3), au tarif le plus bas : les moins d'écart au
    // niveau demandé, puis les moins chères ; recalculé ici à partir des niveaux de toutes les offres affichées
    { for (let k = 0; k < 12 && await q.isVisible('#more-offers'); k++) { await devoiler(q); await q.click('#more-offers'); await q.waitForTimeout(120); }
      const et = await q.evaluate(() => { const offres = [...document.querySelectorAll('#offers article.offer')];
        return { etoiles: offres.map((o, i) => o.querySelector('.o-etoile') ? i : -1).filter(i => i >= 0), textes: [...document.querySelectorAll('#offers .o-badge')].map(e => e.textContent),
          hono: offres.map(o => { const c = [...o.querySelectorAll('.o-col')].find(c => c.querySelector('.lab').textContent === 'Honoraires'); return c ? c.querySelector('.pc').textContent : ''; }),
          prix: offres.map(o => parseFloat(o.querySelector('.o-price').textContent.replace(/\s/g, '').replace(',', '.'))) }; });
      const niv = s => { const n = parseFloat(String(s).replace(',', '.')); return isNaN(n) ? 0 : n >= 400 ? 5 : n >= 300 ? 4 : n >= 180 ? 3 : n >= 130 ? 2 : n >= 100 ? 1 : 0; };
      const attendu = et.prix.map((p, i) => ({ i, e: niv(et.hono[i]) - 3, p })).sort((a, b) => a.e - b.e || a.p - b.p).slice(0, 3).map(x => x.i).sort((a, b) => a - b);
      doit(et.etoiles.length === 3 && et.textes.every(t => t === '★') && et.etoiles.join() === attendu.join(), nom + ' : étoiles ' + JSON.stringify(et.etoiles) + ', attendu ' + JSON.stringify(attendu)); }
    // L'offre choisie reste mise en évidence ; le formulaire s'ouvre
    await devoiler(q); await q.click('[data-c="1"]'); await q.waitForTimeout(500);
    const choisie = await q.$$eval('#offers article.offer', l => l.map((o, i) => o.classList.contains('chosen') ? i : -1).filter(i => i >= 0));
    doit(choisie.join() === '1' && await q.isVisible('#form-panel'), nom + ' : offre choisie ' + JSON.stringify(choisie));
    console.log(nom, '| cartes :', m1.premiereLigne, 'par ligne,', m1.lignes, 'lignes pour', m1.n, 'offres | besoins sur', m1.besoinsLignes, 'ligne(s) | toutes les offres :', m2.n, '| toucher :', touche, '|', apres);
    await c.close();
  }
  // 9. Pages du guide sur téléphone et PC : lisibles, sans défilement de côté, bouton vers le comparateur
  for (const [nom, opt] of [['tel', devices['iPhone 13']], ['pc', { viewport: { width: 1280, height: 850 } }]]) {
    const c = await b.newContext(opt); await servir(c, 'https://www.santeo.net/', sites.crm); const q = await c.newPage();
    q.on('pageerror', e => err(nom + ' guide : ' + e.message));
    await q.goto('https://www.santeo.net/guide/'); await q.waitForTimeout(300);
    const n = await q.$$eval('.liste a', l => l.length);
    doit(n >= 6, nom + ' : la page du guide doit lister les articles (' + n + ')');
    await q.click('.liste a'); await q.waitForTimeout(300);
    const info = await q.evaluate(() => ({ url: location.pathname, hs: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      cta: [...document.querySelectorAll('a.btn')].map(a => a.getAttribute('href')), bandeau: !!document.getElementById('cookies') && !document.getElementById('cookies').hidden }));
    doit(/^\/guide\/[a-z0-9-]+\/$/.test(info.url) && !info.hs && info.cta.every(h => h === '../../') && !info.bandeau, nom + ' : article ' + JSON.stringify(info));
    await q.click('.cta a.btn'); await q.waitForTimeout(400);
    doit(q.url() === 'https://www.santeo.net/' && await q.isVisible('#vue-comparateur'), nom + ' : le bouton de l\'article doit mener au comparateur (' + q.url() + ')');
    console.log(nom, '| guide :', n, 'articles, article ouvert', info.url);
    for (const a of guide.filter(a => a.schema_dents)) {   // schéma des dents : visible, en entier, sans défilement de côté
      await q.goto('https://www.santeo.net/guide/' + a.slug + '/'); await q.waitForTimeout(300);
      const s = await q.evaluate(() => { const f = document.querySelector('figure.schema-dents'), r = f && f.getBoundingClientRect();
        return { ok: !!f, rangs: document.querySelectorAll('.sd-mat svg').length, hs: document.documentElement.scrollWidth > document.documentElement.clientWidth, l: r ? Math.round(r.width) : 0 }; });
      doit(s.ok && s.rangs === Object.keys(a.schema_dents.materiaux).length && !s.hs && s.l > 250, nom + ' : schéma des dents ' + a.slug + ' ' + JSON.stringify(s));
      console.log(nom, '| schéma des dents :', JSON.stringify(s));
    }
    await c.close();
  }
  // Pages du guide (Fabrice, 13/11/2026, idée d'Antony) : dans chaque article, une phrase et un bouton vers le comparateur, un bouton
  // WhatsApp vers Antony (ligne Santéo, message déjà écrit) ; sur chaque page du guide et le simulateur, le tchat d'Antony.
  {
    const d = sites.crm, num = (fs.readFileSync(path.join(S, 'template.html'), 'utf8').match(/const WA_NUMERO="(\d+)"/) || [])[1];
    const pages = fs.readdirSync(d + '/guide').filter(f => fs.existsSync(d + '/guide/' + f + '/index.html')).map(f => 'guide/' + f + '/index.html');
    let n = 0;
    for (const f of pages) {
      const h = fs.readFileSync(d + '/' + f, 'utf8'); n++;
      doit(/<aside class="encart-tarif">.*?<a href="\.\.\/\.\.\/">.*?<\/aside>/s.test(h), f + ' : encart vers le comparateur absent');
      doit(h.includes('href="https://wa.me/' + num + '?text=Bonjour%20Antony'), f + ' : lien WhatsApp vers Antony absent');
      doit(h.includes('id="tchat"') && h.includes('images/oiseau.webp'), f + ' : tchat absent');
    }
    for (const f of ['guide/index.html', 'simulateur-remboursement/index.html']) {
      const h = fs.readFileSync(d + '/' + f, 'utf8');
      doit(h.includes('id="tchat"') && h.includes('href="https://wa.me/' + num), f + ' : tchat ou WhatsApp absent');
    }
    doit(n >= 30 && fs.existsSync(d + '/images/oiseau.webp'), 'guide : ' + n + ' articles vérifiés, avatar ' + fs.existsSync(d + '/images/oiseau.webp'));
    // Comparateur -> simulateur, et simulateur -> tarificateur (Fabrice, 13/11/2026)
    doit(/<p class="lien-simu">[^<]*<a href="simulateur-remboursement\/">Accéder au simulateur de remboursement Sécu<\/a>/.test(fs.readFileSync(d + '/index.html', 'utf8')), 'accueil : accès au simulateur absent');
    doit(/<aside class="s-acces">.*?<a class="btn" href="\.\.\/">Accéder au tarificateur<\/a>/s.test(fs.readFileSync(d + '/simulateur-remboursement/index.html', 'utf8')), 'simulateur : accès au tarificateur absent');
  }
  // Garanties APRIL : celles de garanties.json, section « april » (publiée le 14/11/2026), sont celles que le site affiche
  {
    const G = JSON.parse(fs.readFileSync(path.join(R, 'src', 'garanties.json'), 'utf8')).april || { gammes: {}, extras: {} };
    const h = fs.readFileSync(sites.crm + '/index.html', 'utf8');
    const GS = JSON.parse(h.match(/<script type="application\/json" id="d-gammes">(.*?)<\/script>/s)[1]).APRIL;
    const XS = JSON.parse(h.match(/<script type="application\/json" id="d-extras">(.*?)<\/script>/s)[1]).APRIL;
    let n = 0;
    for (const [code, g] of Object.entries(G.gammes)) g.fi.forEach((fi, i) => {
      for (const k of ['hospO', 'honoO', 'dent', 'opt', 'aud']) { n++; doit(GS[k][String(fi)] === g[k][i], 'APRIL ' + code + ' niv. ' + g.niv[i] + ' ' + k + ' : ' + GS[k][String(fi)] + ' au lieu de ' + g[k][i]); }
      for (const k of ['imp', 'orthN', 'optC', 'plaf']) { n++; doit(XS[k][String(fi)] === G.extras[code][k][i], 'APRIL ' + code + ' niv. ' + g.niv[i] + ' ' + k); }
    });
    doit(Object.keys(G.gammes).length >= 11 && n > 0, 'APRIL : section absente de garanties.json (' + Object.keys(G.gammes).length + ' produits)');
  }
  // Simulateur de remboursement (/simulateur-remboursement/) : calcul vérifié sur des cas faits à la main, puis la page sur PC et téléphone
  {
    const SC = require(path.join(S, 'simulateur', 'calcul.js'));
    const SIM = JSON.parse(fs.readFileSync(path.join(S, 'simulateur', 'actes.json'), 'utf8'));
    const tot = (a, m) => SC.calculer(a, m).lignes.map(l => l.total).join(' ');
    // généraliste secteur 1 : 30 € réglés, base 30 €, 70 %, participation de 2 € -> 19 € Sécu ; 28 € remboursés à tous les niveaux
    doit(SC.calculer({ br: 30, taux: .7, retenue: 2, garantie: 'pct' }, 30).secu === 19 && tot({ br: 30, taux: .7, retenue: 2, garantie: 'pct' }, 30) === '28 28 28 28 28 28 28', 'simulateur : généraliste');
    // médecin non OPTAM : 20 points de moins que chez un OPTAM, jamais plus de 200 % de la base au total (contrat responsable)
    doit(tot({ br: 30, taux: .7, retenue: 2, garantie: 'pct', optam: false }, 100) === '28 31 37 52 58 58 58', 'simulateur : plafond non OPTAM ' + tot({ br: 30, taux: .7, retenue: 2, garantie: 'pct', optam: false }, 100));
    // exemple officiel (HCAAM, octobre 2025) : spécialiste à 65 €, garantie 200 % : il reste 4 € chez un OPTAM (base 31,50 €), 25,60 € chez un non OPTAM (base 23 €)
    const reste200 = (br, optam) => SC.calculer({ br, taux: .7, retenue: 2, garantie: 'pct', optam }, 65).lignes.find(l => l.niveau === 200).reste;
    doit(reste200(31.5, true) === 4 && reste200(23, false) === 25.6, 'simulateur : exemple HCAAM ' + reste200(31.5, true) + ' / ' + reste200(23, false));
    // médicament à 65 % de 20 € (exemple Service-Public) : 12 € Sécu, 7 € mutuelle, 1 € de franchise à payer
    const med = SC.calculer({ br_egal_prix: true, taux: .65, retenue: 1, garantie: 'pct' }, 20);
    doit(med.secu === 12 && med.lignes[0].mutuelle === 7 && med.lignes[0].reste === 1, 'simulateur : médicament ' + JSON.stringify(med.lignes[0]));
    // lunettes 100 % Santé : total jusqu'au prix limite, part Sécu non détaillée
    doit(tot({ garantie: '100s', secu_non_detaillee: true, plafond: 115 }, 115) === '115' && SC.calculer({ garantie: '100s', secu_non_detaillee: true, plafond: 115 }, 115).secu === null, 'simulateur : lunettes 100 % Santé');
    // orthodontie adulte (Fabrice, 13/11 : « jusqu'à 200% 193.50€ X 2 par semestre ») : Sécu 0 €, % d'une base de 193,50 €
    const orth = SC.calculer({ base_ref: 193.5, garantie: 'pct' }, 700);
    doit(orth.secu === 0 && orth.lignes.map(l => l.total).join(' ') === '193.5 251.55 290.25 387 483.75 580.5 700', 'simulateur : orthodontie adulte ' + orth.lignes.map(l => l.total).join(' '));
    // forfait en euros plafonné (contrat responsable)
    doit(tot({ br: 0, taux: 0, garantie: 'eur', forfaits: [300, 500], plafond: 420 }, 600) === '300 420', 'simulateur : plafond en euros');
    doit(tot({ br: 30, taux: .7, retenue: 2, garantie: 'pct', optam: true }, 100) === '28 37 43 58 73 88 98', 'simulateur : OPTAM ' + tot({ br: 30, taux: .7, retenue: 2, garantie: 'pct', optam: true }, 100));
    doit(tot({ br: 0, taux: 0, garantie: 'eur', forfaits: [50, 100] }, 60) === '50 60', 'simulateur : forfait en euros');
    doit(tot({ br: 100, taux: .6, garantie: '100s', plafond: 500 }, 500) === '500' && tot({ br: 100, taux: .6, garantie: '100s', plafond: 500 }, 600) === '500', 'simulateur : 100 % Santé');
    let nActes = 0;
    for (const r of SIM.rubriques) for (const a of r.actes) {
      nActes++;
      for (const m of [a.prix, a.prix / 2, a.prix * 3, 0.5]) {
        const res = SC.calculer(a, m); let avant = -1;
        for (const l of res.lignes) {
          doit(l.total <= res.montant + 1e-9 && l.reste >= -1e-9 && Math.abs(l.total + l.reste - res.montant) < 0.011 && l.total >= avant - 1e-9,
            'simulateur : ' + a.nom + ' à ' + m + ' € ' + JSON.stringify(l));
          avant = l.total;
        }
      }
    }
    doit(nActes >= 20, 'simulateur : au moins 20 actes (' + nActes + ')');
    const d = sites.crm;
    doit(fs.readFileSync(d + '/sitemap.xml', 'utf8').includes('https://www.santeo.net/simulateur-remboursement/'), 'simulateur : plan du site');
    doit(fs.readFileSync(d + '/index.html', 'utf8').includes('href="simulateur-remboursement/"'), "simulateur : lien en bas de l'accueil");
    for (const [nom, opts] of [['pc', { viewport: { width: 1280, height: 900 } }], ['tel', devices['iPhone 13']]]) {
      const c = await b.newContext(opts); await servir(c, 'https://www.santeo.net/', d);
      const q = await c.newPage(); q.on('pageerror', e => err(nom + ' simulateur : ' + e.message));
      await q.goto('https://www.santeo.net/simulateur-remboursement/'); await q.waitForTimeout(300);
      const lire = () => q.evaluate(() => ({ rub: document.getElementById('s-rub').options.length, actes: document.getElementById('s-acte').options.length,
        secu: document.getElementById('s-secu').textContent, lignes: document.querySelectorAll('#s-table tbody tr').length,
        choisi: (document.querySelector('#s-table tr.s-choisi td') || {}).textContent, barres: document.querySelectorAll('#s-barre span').length,
        hs: document.documentElement.scrollWidth > document.documentElement.clientWidth }));
      const r0 = await lire();
      doit(r0.rub === SIM.rubriques.length && r0.actes === SIM.rubriques[0].actes.length && /\u00a0€$/.test(r0.secu) && r0.lignes >= 1 && r0.barres >= 1 && !r0.hs, nom + ' simulateur : ' + JSON.stringify(r0));
      // chaque type d'acte et chaque sous-rubrique s'affichent sans erreur ni défilement de côté
      for (let i = 0; i < SIM.rubriques.length; i++) {
        await q.selectOption('#s-rub', String(i));
        for (let j = 0; j < SIM.rubriques[i].actes.length; j++) {
          await q.selectOption('#s-acte', String(j));
          const r = await lire(), a = SIM.rubriques[i].actes[j];
          const attendu = a.garantie === 'pct' ? 7 : a.garantie === 'eur' ? (a.forfaits || SC.NIVEAUX_EUR).length : 1;
          doit(r.lignes === attendu && r.barres >= 1 && !r.hs, nom + ' simulateur : ' + a.nom + ' ' + JSON.stringify(r));
        }
      }
      // le montant saisi et la ligne touchée changent le résultat et le schéma
      await q.selectOption('#s-rub', '0'); await q.selectOption('#s-acte', '0');
      await q.fill('#s-montant', '1000'); await q.click('#s-table tbody tr:first-child'); const r2 = await lire();
      doit(r2.choisi === (SC.calculer(SIM.rubriques[0].actes[0], 1000).lignes[0].libelle), nom + ' simulateur : ligne touchée ' + JSON.stringify(r2));
      console.log(nom, '| simulateur :', SIM.rubriques.length, "types d'acte,", nActes, 'actes');
      await c.close();
    }
  }
  await b.close(); fs.rmSync(tmp, { recursive: true, force: true });
  console.log('ERREURS:', errs.length ? errs.join(' | ') : 'aucune');
})();
