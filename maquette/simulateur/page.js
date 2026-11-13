// Interface du simulateur de remboursement (page /simulateur-remboursement/). Données : <script id="s-data"> (actes.json),
// calcul : SimuCalcul (calcul.js). Tout se fait dans le navigateur, rien n'est envoyé.
(function () {
  var D = JSON.parse(document.getElementById("s-data").textContent);
  var $ = function (id) { return document.getElementById(id); };
  var rub = $("s-rub"), acte = $("s-acte"), mt = $("s-montant"), choix = null;
  function eur(x) { return x.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "\u00a0€"; }
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
    if (a.br_egal_prix) t.push("Remboursé à " + pct(a.taux) + " du prix par la Sécurité sociale");
    else if (a.br) t.push("Base de remboursement : " + eur(a.br) + " ; remboursée à " + pct(a.taux) + " par la Sécurité sociale");
    else if (!a.secu_non_detaillee) t.push("Non remboursé par la Sécurité sociale");
    if (a.base_ref) t.push("Pourcentages calculés sur une base de " + eur(a.base_ref) + ", utilisée par certains contrats");
    if (a.retenue) t.push(esc(a.retenue_lib || "Retenue") + " : " + eur(a.retenue) + ", jamais remboursée par un contrat responsable");
    if (a.plafond != null) t.push("Prix limite : " + eur(a.plafond));
    if (a.note) t.push(esc(a.note));
    if (a.exemple) t.push("Le montant affiché est un exemple : remplacez-le par le vôtre");
    return t.join(". ") + ".";
  }
  function calculer() {
    var a = courant(), r = SimuCalcul.calculer(a, mt.value);
    $("s-info").innerHTML = info(a);
    $("s-secu").textContent = r.secu == null ? "comprise dans le total ci-dessous" : eur(r.secu);
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
    // barre en HTML (pas en SVG) : le texte garde sa taille sur PC comme sur téléphone
    var total = r.montant || 1, h = [];
    var parts = r.secu == null ? [["s-p-mut", l.total, "Sécurité sociale + mutuelle"], ["s-p-rac", l.reste, "Reste à payer"]]
      : [["s-p-secu", r.secu, "Sécurité sociale"], ["s-p-mut", l.mutuelle, "Mutuelle"], ["s-p-rac", l.reste, "Reste à payer"]];
    parts.forEach(function (p) {
      if (p[1] <= 0) return;
      var part = p[1] / total;
      h.push('<span class="' + p[0] + '" style="flex:' + part.toFixed(4) + ' 1 0">' + (part >= .16 ? eur(p[1]).replace(",00", "") : "") + "</span>");
    });
    if (r.br > 0 && r.br < total)
    { var pos = 100 * r.br / total, dec = pos < 15 ? "0" : pos > 85 ? "-100%" : "-50%";   // l'étiquette ne sort pas du cadre
      h.push('<i class="s-br" style="left:' + pos.toFixed(2) + '%"><b style="transform:translateX(' + dec + ')">base ' + eur(r.br).replace(",00", "") + "</b></i>"); }
    var barre = $("s-barre"); barre.innerHTML = h.join("");
    barre.classList.toggle("s-avec-base", r.br > 0 && r.br < total);
    barre.setAttribute("aria-label", "Sur " + eur(r.montant) + " réglés : " + parts.map(function (p) { return p[2] + " " + eur(p[1]); }).join(", ") + ".");
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
