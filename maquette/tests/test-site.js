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
const construire = (nom, ...opts) => { const d = path.join(tmp, nom); execFileSync('python3', ['-I', S + '/build.py', S, R, '--site', d, ...opts]); return d; };
const sites = { crm: construire('crm', '--en-ligne', '--envoi', CRM), repli: construire('repli', '--en-ligne', '--envoi', '', '--repli', 'whatsapp'), test: construire('test') };
const errs = [], err = m => errs.push(m);
const types = { '.html': 'text/html; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.txt': 'text/plain', '.xml': 'application/xml' };

// Sert un dossier construit à une adresse donnée, comme GitHub Pages (dossier/ -> dossier/index.html, sinon 404.html)
async function servir(ctx, base, dir) {
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await ctx.route(/crm\.capisante\.fr/, r => { err('un essai a tenté de joindre le vrai CRM'); r.abort(); });   // jamais de vraie demande pendant un essai
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
    await ctx.close();
  }
  await b.close(); fs.rmSync(tmp, { recursive: true, force: true });
  console.log('ERREURS:', errs.length ? errs.join(' | ') : 'aucune');
})();
