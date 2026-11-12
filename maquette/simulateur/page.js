// Interface du simulateur de remboursement (page /simulateur-remboursement/). Données : <script id="s-data"> (actes.json),
// calcul : SimuCalcul (calcul.js). Tout se fait dans le navigateur, rien n'est envoyé.
(function () {
  var D = JSON.parse(document.getElementById("s-data").textContent);
  var $ = function (id) { return document.getElementById(id); };
  var rub = $("s-rub"), acte = $("s-acte"), mt = $("s-montant"), choix = null;
  function eur(x) { return x.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €"; }
  function pct(t) { return Math.round(t * 100) + " %"; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  D.rubriques.forEach(function (r, i) { rub.add(new Option(r.nom, i)); });
  function actes() { return D.rubriques[+rub.value].actes; }
  function remplirActes() {
    acte.length = 0;
    actes().forEach(function (a, i) { acte.add(new Option(a.nom, i)); });
    nouvelActe();
  }
  function courant() { return actes()[+acte.value]; }
  function nouvelActe() { var a = courant(); mt.value = a.prix; choix = null; calculer(); }
  function info(a) {
    var t = [];
    if (a.code) t.push("Code : " + esc(a.code));
    if (a.br) t.push("Base de remboursement : " + eur(a.br) + " ; remboursée à " + pct(a.taux) + " par la Sécurité sociale");
    else t.push("Non remboursé par la Sécurité sociale");
    if (a.retenue) t.push(esc(a.retenue_lib || "Retenue") + " : " + eur(a.retenue) + ", jamais remboursée par un contrat responsable");
    if (a.plafond != null) t.push("Prix limite : " + eur(a.plafond));
    if (a.note) t.push(esc(a.note));
    return t.join(". ") + ".";
  }
  function calculer() {
    var a = courant(), r = SimuCalcul.calculer(a, mt.value);
    $("s-info").innerHTML = info(a);
    $("s-secu").textContent = eur(r.secu);
    var tb = $("s-table").tBodies[0]; tb.innerHTML = "";
    if (choix == null || !r.lignes.some(function (l) { return l.niveau === choix; }))
      choix = (r.lignes.filter(function (l) { return l.niveau === (a.garantie === "eur" ? 100 : 200); })[0] || r.lignes[0]).niveau;
    r.lignes.forEach(function (l) {
      var tr = tb.insertRow(); tr.tabIndex = 0; tr.dataset.n = l.niveau;
      if (l.niveau === choix) tr.className = "s-choisi";
      tr.insertCell().textContent = l.libelle;
      tr.insertCell().textContent = eur(l.total);
      tr.insertCell().textContent = eur(l.reste);
    });
    $("s-titre-mut").textContent = a.garantie === "eur" ? "Remboursement Sécurité sociale + mutuelle (garantie en euros)" :
      a.garantie === "pct" ? "Remboursement Sécurité sociale + mutuelle" : "Remboursement Sécurité sociale + mutuelle (même résultat à tous les niveaux)";
    schema(r, r.lignes.filter(function (l) { return l.niveau === choix; })[0], a);
  }
  function schema(r, l, a) {
    var W = 320, H = 44, total = r.montant || 1, x = 0, svg = [];
    var parts = [["s-p-secu", r.secu, "Sécurité sociale"], ["s-p-mut", l.mutuelle, "Mutuelle"], ["s-p-rac", l.reste, "Reste à payer"]];
    parts.forEach(function (p) {
      var w = W * p[1] / total; if (w <= 0) return;
      svg.push('<rect class="' + p[0] + '" x="' + x.toFixed(1) + '" y="8" width="' + w.toFixed(1) + '" height="' + H + '" rx="3"/>');
      if (w > 46) svg.push('<text x="' + (x + w / 2).toFixed(1) + '" y="' + (8 + H / 2 + 4) + '">' + eur(p[1]).replace(",00", "") + '</text>');
      x += w;
    });
    if (r.br > 0 && r.br < total) {
      var bx = (W * r.br / total).toFixed(1);
      svg.push('<path class="s-br" d="M' + bx + ',2 V' + (H + 14) + '"/><text class="s-br-t" x="' + bx + '" y="' + (H + 27) + '">base ' + eur(r.br).replace(",00", "") + '</text>');
    }
    $("s-svg").innerHTML = svg.join("");
    $("s-svg").setAttribute("aria-label", "Sur " + eur(r.montant) + " réglés : Sécurité sociale " + eur(r.secu) + ", mutuelle " + eur(l.mutuelle) + ", reste à payer " + eur(l.reste) + ".");
    $("s-leg").innerHTML = parts.map(function (p) { return '<li><i class="' + p[0] + '"></i>' + p[2] + " : <strong>" + eur(p[1]) + "</strong></li>"; }).join("");
    $("s-cap").textContent = "Sur " + eur(r.montant) + " réglés, avec une garantie " + (l.niveau ? l.libelle.toLowerCase().replace("forfait", "forfait de") : "responsable");
  }
  rub.addEventListener("change", remplirActes);
  acte.addEventListener("change", nouvelActe);
  mt.addEventListener("input", calculer);
  $("s-table").addEventListener("click", function (e) { var tr = e.target.closest("tr[data-n]"); if (tr) { choix = +tr.dataset.n; calculer(); } });
  $("s-table").addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { var tr = e.target.closest("tr[data-n]"); if (tr) { e.preventDefault(); choix = +tr.dataset.n; calculer(); } } });
  remplirActes();
})();
