// Calcul du simulateur de remboursement (Sécurité sociale + complémentaire santé) de www.santeo.net.
// Utilisé tel quel par la page (intégré par build.py) et par les tests (Node). Aucune donnée ici : les actes, bases et taux
// sont dans maquette/simulateur/actes.json, chacun avec sa source officielle.
//
// Règles appliquées (contrat responsable, garantie exprimée « Sécurité sociale incluse ») :
// - Sécurité sociale = base de remboursement (BR) × taux − retenue (participation forfaitaire ou franchise), jamais négatif.
// - Garantie en % de la BR (« pct ») : la Sécurité sociale et la mutuelle remboursent ensemble au plus X % de la BR, sans
//   dépasser le montant réglé ; la retenue reste à payer (un contrat responsable ne la rembourse pas).
//   Médecin non adhérent à l'OPTAM (optam === false) : un contrat responsable rembourse ses dépassements au plus à hauteur
//   de 100 % de la BR, et 20 points de moins que chez un médecin OPTAM (instruction DSS du 29/05/2019, annexe 1) : une
//   garantie de X % chez un OPTAM donne au plus max(100 %, min(X − 20 %, 200 %)) chez un non OPTAM.
// - Garantie en euros (« eur ») : la mutuelle rembourse le ticket modérateur (BR − part de la Sécurité sociale avant retenue)
//   plus un forfait de F euros, sans dépasser le montant réglé ; « plafond » : total maximal permis à un contrat responsable
//   (ex. lunettes hors 100 % Santé, aides auditives de classe II).
// - Base égale au prix (br_egal_prix, ex. médicaments) : la base de remboursement est le prix réglé.
// - Base de référence (base_ref) : pour un acte que la Sécurité sociale ne rembourse pas, certains contrats remboursent un
//   pourcentage d'une base « reconstituée » (ex. orthodontie adulte : 193,50 € par semestre) ; la Sécurité sociale verse 0 €.
// - Part de la Sécurité sociale non détaillée (secu_non_detaillee, ex. lunettes 100 % Santé dont la base n'est pas
//   confirmée) : seul le total Sécurité sociale + mutuelle est calculé ; « secu » vaut alors null.
// - 100 % Santé (« 100s ») : la Sécurité sociale et un contrat responsable remboursent jusqu'au prix limite (plafond) ;
//   le résultat ne dépend pas du niveau de garantie.
// - Prise en charge intégrale (« integral ») : un contrat responsable rembourse tout le montant (ex. forfait journalier).
(function (racine) {
  var NIVEAUX_PCT = [100, 130, 150, 200, 250, 300, 400];
  var NIVEAUX_EUR = [50, 100, 150, 200, 300];
  function c2(x) { return Math.round(x * 100 + 1e-9) / 100; }   // arrondi au centime
  function calculer(acte, montant) {
    var fr = Math.max(0, +montant || 0);
    var br = acte.br_egal_prix ? fr : (acte.br || 0), taux = acte.taux || 0, retenue = acte.retenue || 0;
    if (acte.secu_non_detaillee) {                                       // total seulement (Sécurité sociale + mutuelle)
      var tot = c2(Math.min(fr, acte.plafond != null ? acte.plafond : fr));
      return { montant: c2(fr), br: 0, taux: 0, retenue: 0, secu: null,
               lignes: [{ niveau: 0, libelle: "Tous niveaux", mutuelle: tot, total: tot, reste: c2(fr - tot) }] };
    }
    var brSecu = br === 0 ? 0 : Math.min(br, Math.max(fr, 0));          // la BR ne s'applique pas au-delà du montant réglé
    var partBrute = c2(brSecu * taux);                                  // part de la Sécurité sociale avant retenue
    var secu = Math.max(0, c2(partBrute - (partBrute > 0 ? retenue : 0)));
    var lignes = [], g = acte.garantie;
    function ligne(lib, cible, niveau) {
      if (acte.plafond != null && g === "eur") cible = Math.min(cible, acte.plafond);
      var mut = Math.max(0, c2(Math.min(fr, cible) - partBrute));
      mut = Math.min(mut, c2(fr - secu));                               // jamais plus que ce qui reste après la Sécurité sociale
      lignes.push({ niveau: niveau, libelle: lib, mutuelle: mut, total: c2(secu + mut), reste: c2(fr - secu - mut) });
    }
    if (g === "pct") {
      NIVEAUX_PCT.forEach(function (x) {
        var xe = acte.optam === false ? Math.max(100, Math.min(x - 20, 200)) : x;
        ligne(x + "\u00a0%", xe / 100 * (acte.base_ref || br), x);
      });
    } else if (g === "eur") {
      (acte.forfaits || NIVEAUX_EUR).forEach(function (f) { ligne("Forfait " + f + "\u00a0€", br + f, f); });   // ticket modérateur + forfait
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
