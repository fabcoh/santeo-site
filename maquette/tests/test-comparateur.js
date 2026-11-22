const { chromium } = require('playwright');
(async () => {
  const S = process.argv[2]; const b = await chromium.launch(); const errs = [];
  // La mascotte : 4 calques de même taille, bien chargés ; elle bouge (4 animations), sauf si la personne a demandé moins d'animations.
  const mascotte = async (p, name, attendu) => {
    const m = await p.evaluate(() => { const e = document.querySelector('.mascotte'), r = e.getBoundingClientRect(); return {
      calques: [...e.querySelectorAll('img')].map(i => i.className + ' ' + i.naturalWidth + 'x' + i.naturalHeight),
      anims: document.getAnimations().filter(a => /^m-/.test(a.animationName) && a.playState === 'running').length,
      largeur: Math.round(r.width), hauteur: Math.round(r.height), defile: document.documentElement.scrollWidth > document.documentElement.clientWidth }; });
    const tailles = new Set(m.calques.map(c => c.split(' ')[1]));
    if (m.calques.length !== 4 || tailles.size !== 1 || tailles.has('0x0')) errs.push(name + ' mascotte, calques : ' + m.calques.join(', '));
    if (m.anims !== attendu) errs.push(name + ' mascotte : ' + m.anims + ' animations au lieu de ' + attendu);
    if (m.defile || m.hauteur < 30) errs.push(name + ' mascotte : défilement ' + m.defile + ', hauteur ' + m.hauteur);
    console.log(name, '| mascotte', m.largeur + 'x' + m.hauteur, '| calques:', m.calques.join(', '), '| animations:', m.anims);
  };
  // Vos besoins : un curseur par poste (Fabrice, 22/11/2026). Régler le curseur k à v, comme un visiteur (événement « input »).
  const regler = (p, k, v) => p.$eval('#cur-' + k, (e, v) => { e.value = String(v); e.dispatchEvent(new Event('input', { bubbles: true })); }, v);
  // Libellés attendus à chaque niveau (grilles validées par Fabrice) et maximum affiché à droite du curseur
  const PCT = ['Pas de besoin', 'Au moins 100 %', 'Au moins 130 %', 'Au moins 180 %', 'Au moins 300 %', '400 % et plus'];
  const LIBELLES = { hosp: [PCT, '400 %'], hono: [PCT, '400 %'],
    dent: [['Pas de besoin', 'Au moins 100 %', 'Au moins 130 %', 'Au moins 200 %', 'Au moins 300 %', '400 % et plus'], '400 %'],
    opt: [['Pas de besoin', '100 % Santé', 'Au moins 130 €', 'Au moins 200 €', 'Au moins 300 €', '400 € et plus'], '400 €'],
    autres: [['Pas de besoin', 'Un forfait', 'Plus de 80 € par an', 'Plus de 120 € par an', 'Plus de 160 € par an', 'Plus de 200 € par an'], '200 €/an et +'] };
  const NOMS = { hosp: 'Hospitalisation', hono: 'Honoraires', dent: 'Dentaire', opt: 'Optique', autres: 'Autres' };
  // Niveaux des étoiles d'avant, recalculés ici à partir des garanties affichées sur chaque offre (grilles de Fabrice, 08/11/2026) :
  // le curseur réglé à n doit garder exactement les offres de niveau n ou plus, comme les étoiles le faisaient.
  const premier = s => { const m = String(s).replace(/\s/g, '').replace(',', '.').match(/\d+(?:\.\d+)?/); return m ? +m[0] : null; };
  const rien = s => !s || s === '—' || s === 'n.c.';
  const grille = v => v <= 125 ? 1 : v <= 175 ? 2 : v <= 275 ? 3 : v <= 350 ? 4 : 5;
  const NIVEAU = {
    hosp: s => { if (rien(s)) return 0; const v = premier(s); return v == null ? 0 : grille(v); },
    dent: s => { if (rien(s)) return 0; const v = premier(s); return v == null ? 0 : grille(v); },
    opt: s => { if (rien(s)) return 0; if (/%/.test(s)) return 1; const v = premier(s); return v == null ? 0 : grille(v); },
    autres: s => { if (rien(s)) return 0; const t = s.replace(/\s/g, ''); const m = t.match(/(\d+)[×x](\d+)/); let y;
      if (m) y = m[1] * m[2]; else { const v = premier(t); if (v == null) return 0; y = /\/an/.test(t) ? v : v * 4; }
      return !y ? 0 : y <= 80 ? 1 : y <= 120 ? 2 : y <= 160 ? 3 : y <= 200 ? 4 : 5; } };
  NIVEAU.hono = NIVEAU.hosp;
  for (const [name, vp] of [['tel', {width: 400, height: 900}], ['pc', {width: 1280, height: 900}]]) {
    const p = await b.newPage({viewport: vp, deviceScaleFactor: 1});
    p.on('pageerror', e => errs.push(name + ': ' + e.message));
    p.on('console', m => { if (m.type() === 'error') errs.push(name + ' console: ' + m.text()); });
    await p.goto('file://' + S + '/comparateur-santeo.html'); await p.waitForTimeout(300); await mascotte(p, name, 4); await p.fill('#age','21/07/1981'); await p.fill('#cp','75012'); await p.waitForTimeout(200);
    const c0 = await p.textContent('#count');
    // Allumage : une fois la date et le code postal remplis, les cartes s'allument l'une après l'autre sans rien régler ; toucher un curseur l'arrête
    const allume = await p.waitForSelector('#needs .cell.allumage', { timeout: 1500 }).then(() => true).catch(() => false);
    const zeros = await p.$$eval('#needs .curseur', l => l.every(e => e.value === '0'));
    if (!allume || !zeros || (await p.textContent('#count')) !== c0) errs.push(name + ' : allumage des cartes ' + JSON.stringify({ allume, zeros }));
    await regler(p, 'opt', 0); await p.waitForTimeout(950);
    if (await p.$('#needs .cell.allumage')) errs.push(name + ' : l\'allumage doit s\'arrêter dès qu\'un curseur est touché');
    // Chaque poste : un curseur 0 à 5 (pas de 1), nommé par son poste, le bon libellé (affiché et lu par les lecteurs d'écran) à chaque niveau,
    // « Pas de besoin » à gauche et le maximum à droite ; zone tactile d'au moins 44 px de haut
    const curseurs = await p.$$eval('#needs input[type=range]', l => l.map(e => ({ id: e.id, min: e.min, max: e.max, step: e.step, val: e.value,
      nom: e.labels && e.labels[0] ? e.labels[0].textContent : '', haut: Math.round(e.getBoundingClientRect().height), large: Math.round(e.getBoundingClientRect().width) })));
    if (curseurs.map(c => c.id).join() !== 'cur-hosp,cur-hono,cur-dent,cur-opt,cur-autres') errs.push(name + ' : curseurs ' + curseurs.map(c => c.id).join());
    for (const c of curseurs) {
      const k = c.id.slice(4);
      if (c.min !== '0' || c.max !== '5' || c.step !== '1' || c.val !== '0' || c.nom !== NOMS[k]) errs.push(name + ' : curseur ' + JSON.stringify(c));
      if (c.haut < 44 || c.large < 120) errs.push(name + ' : curseur ' + k + ' trop petit pour le doigt (' + c.large + 'x' + c.haut + ')');
      const bornes = await p.$eval('#needs .col[data-k="' + k + '"] .b-bornes', e => [...e.children].map(x => x.textContent));
      if (bornes.join('|') !== 'Pas de besoin|' + LIBELLES[k][1]) errs.push(name + ' : bornes ' + k + ' ' + bornes.join('|'));
      for (let v = 0; v <= 5; v++) {
        await regler(p, k, v);
        const lu = await p.$eval('#needs .col[data-k="' + k + '"]', e => ({ niv: e.querySelector('.b-niv').textContent, aria: e.querySelector('.curseur').getAttribute('aria-valuetext') }));
        if (lu.niv !== LIBELLES[k][0][v] || lu.aria !== LIBELLES[k][0][v]) errs.push(name + ' : ' + k + ' niveau ' + v + ' : ' + JSON.stringify(lu) + ' au lieu de « ' + LIBELLES[k][0][v] + ' »');
      }
      await regler(p, k, 0);
    }
    // Au clavier : flèches, Fin, Début
    await p.focus('#cur-opt'); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight');
    const clav1 = await p.$eval('#cur-opt', e => e.value + ' ' + e.getAttribute('aria-valuetext'));
    await p.keyboard.press('End'); const clav2 = await p.$eval('#cur-opt', e => e.value + ' ' + e.getAttribute('aria-valuetext'));
    await p.keyboard.press('Home'); const clav3 = await p.$eval('#cur-opt', e => e.value + ' ' + e.getAttribute('aria-valuetext'));
    if (clav1 !== '2 Au moins 130 €' || clav2 !== '5 400 € et plus' || clav3 !== '0 Pas de besoin') errs.push(name + ' : clavier ' + [clav1, clav2, clav3].join(' / '));
    if ((await p.textContent('#count')) !== c0) errs.push(name + ' : après remise à zéro, le compte devrait revenir au départ');
    // Toucher le rail place le curseur au cran le plus proche (Safari sur iPhone ne le fait pas de lui-même)
    { await p.$eval('#cur-hono', e => e.scrollIntoView({ block: 'center' }));
      const r = await p.$eval('#cur-hono', e => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top + r.height / 2, w: r.width }; });
      await p.mouse.click(r.x + 13 + (r.w - 26) * 0.6, r.y); const v = await p.$eval('#cur-hono', e => e.value);
      if (v !== '3') errs.push(name + ' : un toucher à 60 % du rail devrait régler le niveau 3 (' + v + ')');
      await regler(p, 'hono', 0);
      // Un clic sur le nom du poste (étiquette du curseur) ne règle rien
      const nomR = await p.$eval('#needs .col[data-k="hono"] .b-nom', e => { const r = e.getBoundingClientRect(); return { x: r.right - 3, y: r.top + r.height / 2 }; });
      await p.mouse.click(nomR.x, nomR.y); const v2 = await p.$eval('#cur-hono', e => e.value);
      if (v2 !== '0') errs.push(name + ' : un clic sur le nom du poste a réglé le curseur à ' + v2); }
    // Le curseur filtre comme les étoiles : liste de référence (toutes les offres, avec leurs garanties), puis chaque poste à chaque niveau
    if (name === 'pc') {
      await p.click('.precise[data-open="autres"]'); await p.fill('#f-autre', 'essai'); await p.press('#f-autre', 'Tab'); await p.keyboard.press('Escape'); await p.waitForTimeout(100);   // « Autres » affiché sans rien filtrer
      for (let k = 0; k < 20 && await p.isVisible('#more-offers'); k++) { await p.click('#more-offers'); await p.waitForTimeout(80); }
      const ref = await p.$$eval('#offers article.offer', l => l.map(o => ({ id: o.querySelector('.o-real').textContent + ' ' + o.querySelector('.o-price').textContent,
        v: Object.fromEntries([...o.querySelectorAll('.o-col')].map(c => [c.querySelector('.lab').textContent, c.querySelector('.pc').textContent])) })));
      if (ref.length < 20 || !ref.every(o => Object.keys(o.v).length === 5)) errs.push('pc : liste de référence incomplète (' + ref.length + ' offres)');
      await p.click('.precise[data-open="autres"]'); await p.fill('#f-autre', ''); await p.press('#f-autre', 'Tab'); await p.keyboard.press('Escape'); await p.waitForTimeout(100);
      const verifier = async (reglage, quoi) => {
        const attendu = ref.filter(o => Object.entries(reglage).every(([k, n]) => NIVEAU[k](o.v[NOMS[k]]) >= n));
        const compte = await p.textContent('#count'), n = attendu.length ? +(compte.match(/^\d+/) || [-1])[0] : 0;
        const vus = await p.$$eval('#offers article.offer', l => l.map(o => o.querySelector('.o-real').textContent + ' ' + o.querySelector('.o-price').textContent));
        const ok = attendu.length ? n === attendu.length && vus.join('|') === attendu.slice(0, vus.length).map(o => o.id).join('|') && vus.length === Math.min(5, attendu.length)
          : /^Aucune offre/.test(compte) && /Baissez un curseur/.test(await p.textContent('#offers'));
        if (!ok) errs.push('pc : ' + quoi + ' : ' + compte + ' ; attendu ' + attendu.length + ' offres');
        return attendu.length;
      };
      const resume = [];
      for (const k of Object.keys(NOMS)) {
        const n = [];
        for (let v = 1; v <= 5; v++) { await regler(p, k, v); n.push(await verifier({ [k]: v }, k + ' à ' + v)); }
        await regler(p, k, 0); resume.push(k + ' ' + n.join('/'));
      }
      await regler(p, 'hosp', 2); await regler(p, 'dent', 3); resume.push('hospi 2 + dentaire 3 : ' + await verifier({ hosp: 2, dent: 3 }, 'hospitalisation 2 et dentaire 3'));
      await regler(p, 'hosp', 0); await regler(p, 'dent', 0);
      if ((await p.textContent('#count')) !== c0) errs.push('pc : après les essais de filtrage, le compte devrait revenir au départ');
      console.log('pc | filtrage, offres gardées aux niveaux 1 à 5 :', resume.join(' ; '), '(sur', ref.length + ')');
    }
    // Avant : deux touchers sur le poste dentaire au téléphone (2 étoiles), l'étoile 3 sur ordinateur ; même réglage au curseur
    await regler(p, 'dent', name === 'tel' ? 2 : 3);
    const c1 = await p.textContent('#count');
    if (c1 === c0) errs.push(name + ' : régler le curseur dentaire ne filtre pas les offres');
    if (!(await p.$('#f-d-imp'))) await p.click('.precise[data-open="dent"]');
    const boxes = await p.$$eval('#needpanel .more label', ls => ls.map(l => l.textContent.trim()));
    const starsInPanel = await p.$$eval('#needpanel .stars, #needpanel input[type=range]', s => s.length);
    if (starsInPanel) errs.push(name + ' : la fenêtre « Précisez » ne doit pas contenir de curseur');
    await p.check('#f-d-imp'); await p.waitForTimeout(100);
    const c2 = await p.textContent('#count');
    await p.check('#f-d-par'); await p.fill('#f-autre', 'Couronne à refaire'); await p.press('#f-autre', 'Tab'); await p.waitForTimeout(100);
    const c3 = await p.textContent('#count');
    const lab = await p.textContent('#needs .col:nth-child(3) .precise');
    await p.keyboard.press('Escape'); await p.waitForTimeout(100); // la fenêtre « Précisez » recouvre les offres : on la ferme d'abord
    // Régler un autre curseur ferme la fenêtre « Précisez » ouverte, sans toucher aux précisions
    await p.click('.precise[data-open="dent"]'); await regler(p, 'hosp', 1);
    if (await p.isVisible('#needpanel .needpanel') || (await p.textContent('#needs .col:nth-child(3) .precise')) !== '(+) Précisez · 3') errs.push(name + ' : un autre curseur doit fermer la fenêtre « Précisez »');
    await regler(p, 'hosp', 0);
    await p.click('[data-c="0"]');
    const chosen = await p.textContent('#chosen-box');
    const hs = await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    if (hs) errs.push(name + ' : défilement de côté');
    console.log(name, '| départ:', c0, '| dentaire', name === 'tel' ? 2 : 3, ':', c1, '| cases:', boxes.join(' / '), '| curseurs dans la case:', starsInPanel, '| implants:', c2, '| + parodontie + autre:', c3, '| case:', lab, '| choisi:', chosen, '| défilement:', hs);
    const sec = await p.$('section.slim'); await sec.scrollIntoViewIfNeeded(); await p.click('.precise[data-open="dent"]'); await p.waitForTimeout(150); await sec.screenshot({path: S + '/panel-' + name + '.png'}); const txt = await p.$$eval('.precise', bs => bs.map(x => x.textContent)); console.log(name, 'boutons :', txt.join(' | '));
    await p.close();
  }
  { // Petit téléphone, animations réduites : la mascotte reste immobile et entière.
    const p = await b.newPage({viewport: {width: 320, height: 700}, deviceScaleFactor: 1, reducedMotion: 'reduce'});
    p.on('pageerror', e => errs.push('calme: ' + e.message));
    await p.goto('file://' + S + '/comparateur-santeo.html'); await p.waitForTimeout(300); await mascotte(p, 'calme 320', 0);
    await p.fill('#age','21/07/1981'); await p.fill('#cp','75012'); await p.waitForTimeout(600);
    if (await p.$('#needs .cell.allumage')) errs.push('calme 320 : pas d\'allumage quand le visiteur a demandé moins d\'animations');
    await p.close();
  }
  // Cartes des postes, de 320 à 1280 px de large : aucun texte qui sort de sa carte ou passe sous « (+) Précisez », aucun défilement de côté
  for (const w of [320, 360, 390, 430, 600, 760, 900, 1060, 1280]) {
    const p = await b.newPage({viewport: {width: w, height: 800}, deviceScaleFactor: 1});
    p.on('pageerror', e => errs.push(w + ' : ' + e.message));
    await p.goto('file://' + S + '/comparateur-santeo.html'); await p.fill('#age','21/07/1981'); await p.fill('#cp','75012'); await p.waitForTimeout(100);
    for (const [k, v] of [['hosp', 3], ['dent', 5], ['autres', 3]]) await regler(p, k, v);   // libellés longs
    const chev = await p.evaluate(() => [...document.querySelectorAll('#needs .cell')].filter(c => {
      const pr = c.querySelector('.precise').getBoundingClientRect(), cr = c.getBoundingClientRect();
      return [...c.querySelectorAll('.b-nom, .b-niv, .b-bornes span')].some(e => { const r = document.createRange(); r.selectNodeContents(e); const t = r.getBoundingClientRect();
        return t.right > cr.right - 1 || t.left < cr.left + 1 || (t.left < pr.right && t.right > pr.left && t.top < pr.bottom && t.bottom > pr.top); }); }).map(c => c.parentElement.dataset.k)
      .concat(document.documentElement.scrollWidth > document.documentElement.clientWidth ? ['défilement de côté'] : []));
    if (chev.length) errs.push(w + ' px : cartes des besoins qui débordent ou se chevauchent : ' + chev.join(', '));
    await p.close();
  }
  console.log('ERREURS:', errs.length ? errs.join(' | ') : 'aucune'); await b.close();
})();
