const { chromium } = require('playwright');
(async () => {
  const S = process.argv[2]; const b = await chromium.launch(); const errs = [];
  for (const [name, vp] of [['tel', {width: 400, height: 900}], ['pc', {width: 1280, height: 900}]]) {
    const p = await b.newPage({viewport: vp, deviceScaleFactor: 1});
    p.on('pageerror', e => errs.push(name + ': ' + e.message));
    p.on('console', m => { if (m.type() === 'error') errs.push(name + ' console: ' + m.text()); });
    await p.goto('file://' + S + '/comparateur-santeo.html'); await p.waitForTimeout(300); await p.fill('#age','21/07/1981'); await p.fill('#cp','75012'); await p.waitForTimeout(200);
    const c0 = await p.textContent('#count');
    if (name === 'tel') { await p.click('[data-cyc="dent"]'); await p.click('[data-cyc="dent"]'); }
    else { await p.click('#needs .col:nth-child(3) .stars button[data-v="3"]'); }
    const c1 = await p.textContent('#count');
    if (!(await p.$('#f-d-imp'))) await p.click('.precise[data-open="dent"]');
    const boxes = await p.$$eval('#needpanel .more label', ls => ls.map(l => l.textContent.trim()));
    const starsInPanel = await p.$$eval('#needpanel .stars', s => s.length);
    await p.check('#f-d-imp'); await p.waitForTimeout(100);
    const c2 = await p.textContent('#count');
    await p.check('#f-d-par'); await p.fill('#f-autre', 'Couronne à refaire'); await p.press('#f-autre', 'Tab'); await p.waitForTimeout(100);
    const c3 = await p.textContent('#count');
    const lab = await p.textContent('#needs .col:nth-child(3) .precise');
    await p.keyboard.press('Escape'); await p.waitForTimeout(100); // la fenêtre « Précisez » recouvre les offres : on la ferme d'abord
    await p.click('[data-c="0"]');
    const chosen = await p.textContent('#chosen-box');
    const hs = await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    console.log(name, '| départ:', c0, '| dentaire 3★:', c1, '| cases:', boxes.join(' / '), '| étoiles dans la case:', starsInPanel, '| implants:', c2, '| + parodontie + autre:', c3, '| case:', lab, '| choisi:', chosen, '| défilement:', hs);
    const sec = await p.$('section.slim'); await sec.scrollIntoViewIfNeeded(); await p.click('.precise[data-open="dent"]'); await p.waitForTimeout(150); await sec.screenshot({path: S + '/panel-' + name + '.png'}); const txt = await p.$$eval('.precise', bs => bs.map(x => x.textContent)); console.log(name, 'boutons :', txt.join(' | '));
    await p.close();
  }
  console.log('ERREURS:', errs.length ? errs.join(' | ') : 'aucune'); await b.close();
})();
