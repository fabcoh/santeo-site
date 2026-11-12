// Calcul du simulateur de remboursement (Sécurité sociale + complémentaire santé) de www.santeo.net.
// Utilisé tel quel par la page (intégré par build.py) et par les tests (Node). Aucune donnée ici : les actes, bases et taux
// sont dans maquette/simulateur/actes.json, chacun avec sa source officielle.
//
// Règles appliquées (contrat responsable, garantie exprimée « Sécurité sociale incluse ») :
// - Sécurité sociale = base de remboursement (BR) × taux − retenue (participation forfaitaire ou franchise), jamais négatif.
// - Garantie en % de la BR (« pct ») : la Sécurité sociale et la mutuelle remboursent ensemble au plus X % de la BR, sans
//   dépasser le montant réglé ; la retenue reste à payer (un contrat responsable ne la rembourse pas).
//   Médecin non adhérent à l'OPTAM (optam === false) : un contrat responsable rembourse ses dépassements au plus à hauteur
//   de 100 % de la BR, donc le total est limité à 200 % de la BR.
// - Garantie en euros (« eur ») : la mutuelle rembourse le ticket modérateur (BR − part de la Sécurité sociale avant retenue)
//   plus un forfait de F euros, sans dépasser le montant réglé.
// - 100 % Santé (« 100s ») : la Sécurité sociale et un contrat responsable remboursent jusqu'au prix limite (plafond) ;
//   le résultat ne dépend pas du niveau de garantie.
// - Prise en charge intégrale (« integral ») : un contrat responsable rembourse tout le montant (ex. forfait journalier).
(function (racine) {
  var NIVEAUX_PCT = [100, 130, 150, 200, 250, 300, 400];
  var NIVEAUX_EUR = [50, 100, 150, 200, 300];
  function c2(x) { return Math.round(x * 100 + 1e-9) / 100; }   // arrondi au centime
  function calculer(acte, montant) {
    var fr = Math.max(0, +montant || 0);
    var br = acte.br || 0, taux = acte.taux || 0, retenue = acte.retenue || 0;
    var brSecu = br === 0 ? 0 : Math.min(br, Math.max(fr, 0));          // la BR ne s'applique pas au-delà du montant réglé
    var partBrute = c2(brSecu * taux);                                  // part de la Sécurité sociale avant retenue
    var secu = Math.max(0, c2(partBrute - (partBrute > 0 ? retenue : 0)));
    var lignes = [];
    function ligne(lib, cible, niveau) {
      var mut = Math.max(0, c2(Math.min(fr, cible) - partBrute));
      mut = Math.min(mut, c2(fr - secu));                               // jamais plus que ce qui reste après la Sécurité sociale
      lignes.push({ niveau: niveau, libelle: lib, mutuelle: mut, total: c2(secu + mut), reste: c2(fr - secu - mut) });
    }
    var g = acte.garantie;
    if (g === "pct") {
      NIVEAUX_PCT.forEach(function (x) {
        var xe = acte.optam === false ? Math.min(x, 200) : x;
        ligne(x + " %", xe / 100 * br, x);
      });
    } else if (g === "eur") {
      (acte.forfaits || NIVEAUX_EUR).forEach(function (f) { ligne("Forfait " + f + " €", br + f, f); });
    } else if (g === "100s") {
      ligne("Tous niveaux", acte.plafond != null ? Math.min(fr, acte.plafond) : fr, 0);
    } else if (g === "integral") {
      ligne("Tous niveaux", fr, 0);
    } else throw new Error("garantie inconnue : " + g);
    return { montant: c2(fr), br: br, taux: taux, retenue: partBrute > 0 ? retenue : 0, secu: secu, lignes: lignes };
  }
  var api = { calculer: calculer, NIVEAUX_PCT: NIVEAUX_PCT, NIVEAUX_EUR: NIVEAUX_EUR };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else racine.SimuCalcul = api;
})(this);
