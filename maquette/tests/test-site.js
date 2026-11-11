// Essai du site publié (version en ligne et version de test), téléphone et PC.
//   node maquette/tests/test-site.js "$PWD/maquette" <copie de santeo-tarifs>
// Construit les sites dans un dossier temporaire, puis les sert à leur vraie adresse (www.santeo.net) sans rien
// envoyer sur Internet : l'adresse du CRM est simulée, la demande envoyée est relue et vérifiée.
// Coordonnées inventées seulement (règle 7).
const { chromium, devices } = require('playwright');
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
const construire = (nom, ...opts) => { const d = path.join(tmp, nom); execFileSync('python3', ['-I', S + '/build.py', S, R, '--site', d, '--apicil', RELAIS_APICIL, '--reglages', RELAIS_REGLAGES, ...opts]); return d; };
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
  await p.click('[data-c="0"]'); await p.waitForTimeout(700);
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
    doit(!/fcohen@|santeo\.net\/guide/.test(a.slug) && !/(april|avenir|mcci|alptis|apicil|swiss ?life|harmonie|mgen)/i.test(fs.readFileSync(S + '/guide/' + a.slug + '.html', 'utf8')), a.slug + ' : nom d\'assureur dans un article');
    try { const j = JSON.parse(h.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]); const types = j['@graph'].map(x => x['@type']);
      doit(types.includes('Article') && types.includes('BreadcrumbList') && types.includes('FAQPage'), a.slug + ' : données Google ' + types); }
    catch (e) { err(a.slug + ' : données Google illisibles ' + e.message); }
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
    // Premier message : il attend le prénom ou pseudo (Fabrice, 11/11/2026), rien ne part encore
    const filQ = (await p.textContent('#tchat-fil')) || '';
    doit(envoisT.length === 0 && /Pour envoyer, merci d'indiquer votre prénom ou votre pseudo\./.test(filQ) && /Les lunettes \?/.test(filQ)
      && (await p.getAttribute('#tchat-texte', 'placeholder')) === 'Votre prénom ou pseudo', nom + ' : tchat : la question du pseudo doit venir avant tout envoi (' + filQ + ')');
    await p.fill('#tchat-texte', '  Rose  '); await p.press('#tchat-texte', 'Enter'); await p.waitForTimeout(5200);
    const filD = (await p.textContent('#tchat-fil')) || '';
    doit(/vous répond ici/.test(ligne) && envoisT.length === 1 && envoiT.texte === 'Les lunettes ?' && envoiT.pseudo === 'Rose' && envoiT.conversation === null && envoiT.site_web === '' && 'contexte' in envoiT
      && /200 € tous les deux ans/.test(filD) && !waOuvert, nom + ' : tchat direct (' + ligne + ' | ' + JSON.stringify(envoiT) + ' | ' + filD.slice(-80) + ')');
    doit((await p.getAttribute('#tchat-texte', 'placeholder')) === 'Votre message', nom + ' : tchat : après le pseudo, la zone redevient « Votre message »');
    await p.fill('#tchat-texte', 'Et le dentaire ?'); await p.press('#tchat-texte', 'Enter'); await p.waitForTimeout(400);
    doit(envoisT.length === 2 && envoiT.texte === 'Et le dentaire ?' && envoiT.conversation === 'c-123' && envoiT.pseudo === 'Rose', nom + ' : tchat : 2e message sans nouvelle question, même conversation, même pseudo (' + JSON.stringify(envoiT) + ')');
    await p.reload(); await p.waitForTimeout(300); await p.click('#tchat-bouton');
    const filR = (await p.textContent('#tchat-fil')) || '';
    doit(/200 € tous les deux ans/.test(filR) && (filR.match(/merci d'indiquer/g) || []).length === 1, nom + ' : la conversation du tchat ne reste pas après rechargement');
    console.log(nom, '| tchat direct : envois', envoisT.map(e => e.texte + ' / ' + e.pseudo).join(' ; '), '| lectures', lectures);
    await ctx.close();
    // 7. Visiteur déjà connu (demande de comparatif envoyée) : pas de question, le message part tout de suite avec sa fiche
    ctx = await b.newContext(opt); await servir(ctx, 'https://www.santeo.net/', sites.tchat);
    await ctx.addInitScript(() => { try { localStorage.setItem('santeo-fiche', JSON.stringify({ fiche: '42' })); } catch (e) {} });
    let envoiC = null;
    await ctx.route('https://crm.exemple.invalid/tchat**', r => {
      const req = r.request(), cors = { 'access-control-allow-origin': 'https://www.santeo.net' };
      if (req.method() === 'POST') envoiC = JSON.parse(req.postData());
      r.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: req.method() === 'POST' ? '{"ok":true,"conversation":"c-9","message":"m9"}' : '{"ok":true,"messages":[]}' });
    });
    p = await ctx.newPage(); p.on('pageerror', e => err(nom + ' tchat connu : ' + e.message));
    await p.goto('https://www.santeo.net/'); await p.waitForTimeout(300); await p.click('#tchat-invite');
    await p.fill('#tchat-texte', 'Bonjour'); await p.press('#tchat-texte', 'Enter'); await p.waitForTimeout(400);
    doit(envoiC && envoiC.texte === 'Bonjour' && envoiC.identite && envoiC.identite.fiche === '42' && !/merci d'indiquer/.test((await p.textContent('#tchat-fil')) || ''),
      nom + ' : tchat : un visiteur déjà connu ne doit pas recevoir la question du pseudo (' + JSON.stringify(envoiC) + ')');
    await ctx.close();
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
    await remplir(q); await q.check('#c-accord').catch(() => {}); await q.click('#send'); await q.waitForTimeout(700);
    const evts = await q.evaluate(() => (window.dataLayer || []).map(a => Array.from(a)).filter(a => a[0] === 'event').map(a => a[1]));
    doit(evts.includes('generate_lead'), nom + ' : la demande envoyée doit être comptée (événements : ' + evts.join(',') + ')');
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
    const toutes = async () => { for (let k = 0; k < 10 && await q.isVisible('#more-offers'); k++) { await q.click('#more-offers'); await q.waitForTimeout(150); }
      return q.$$eval('#offers article.offer', l => l.map((o, i) => ({ i, nom: (o.querySelector('.o-real') || {}).textContent || '', prix: (o.querySelector('.o-price') || {}).textContent || '' }))); };
    const liste = await toutes(), api = liste.filter(o => /API SANT/i.test(o.nom));
    doit(appelsApicil.length === 1, nom + ' : un seul appel au relais API Santé attendu (' + appelsApicil.length + ')');
    const p0 = appelsApicil[0] || {};
    doit(p0.codePostalAssure === '75012' && p0.situationProfessionnelle === 'SALARIE' && p0.beneficiaires && p0.beneficiaires[0].dateNaissance === '1966-07-21', nom + ' : profil envoyé ' + JSON.stringify(p0));
    doit(api.length === 3 && api.some(o => /85,52/.test(o.prix)), nom + ' : offres API Santé affichées ' + JSON.stringify(api));
    // Choisir une offre API Santé, puis changer d'étoiles : l'option choisie suit (ou se retire), jamais une autre offre à sa place
    if (api.length) {
      await q.click('[data-c="' + api[0].i + '"]'); await q.waitForTimeout(400);
      const lire = () => q.$eval('#chosen-box', e => ({ opt: (e.querySelector('strong') || {}).textContent || '', prix: (e.querySelector('.ch-prix') || {}).textContent || '' }));
      const avant = await lire();
      await q.locator('#needs .stars button:visible, #needs [data-cyc]:visible').first().click(); await q.waitForTimeout(400);   // une étoile de plus : la liste change
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
      for (let k = 0; k < 10 && await q.isVisible('#more-offers'); k++) { await q.click('#more-offers'); await q.waitForTimeout(120); }
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
    await c.close();
  }
  await b.close(); fs.rmSync(tmp, { recursive: true, force: true });
  console.log('ERREURS:', errs.length ? errs.join(' | ') : 'aucune');
})();
