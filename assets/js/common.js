/* ============================================================
   Simulateur NON OFFICIEL des aides de La Poste
   Moteur partagé : profil, tranches QF, barèmes, utilitaires.
   Outil bénévole non officiel — estimations indicatives.
   ============================================================ */

const ASC = (() => {

  const PROFILE_KEY = 'asc2026_profile';

  /* ── Barème des tranches de quotient familial ─────────────── */
  const TMAX = [7900, 10100, 12000, 13900, 15500, 17600, 19700, 22500, 27400, Infinity];
  const RANGES = [
    '≤ 7 900 €', '7 901 – 10 100 €', '10 101 – 12 000 €', '12 001 – 13 900 €', '13 901 – 15 500 €',
    '15 501 – 17 600 €', '17 601 – 19 700 €', '19 701 – 22 500 €', '22 501 – 27 400 €', '> 27 400 €'
  ];

  /* ── Barèmes par domaine (repris du simulateur ASC 2026) ──── */
  const BAREMES = {
    garde04: [1092, 1008, 924, 840, 756, 672, 588, 546, 504, 420],
    garde411: [715, 660, 605, 550, 495, 440, 385, 357, 330, 275],
    periscoPct: [45, 43, 41, 39, 37, 35, 33, 31, 29, 27],
    cvPct: [50, 45, 41, 38, 35, 32, 29, 26, 23, 20],
    cvMax: [600, 540, 492, 456, 420, 384, 348, 312, 276, 240],
    vtPct: [55, 50, 50, 45, 45, 40, 40, 35, 35, 30],
    vtMax: [650, 600, 600, 500, 500, 400, 400, 300, 300, 200],
    coloPct: [85, 78, 75, 71, 69, 67, 65, 63, 61, 59],
    sejourDay: [9, 8.8, 8.6, 8.4, 7.8, 7.5, 7, 5, 3.5, 3.3],
    cesuVQ: [650, 600, 550, 500, 450, 400, 350, 325, 300, 250],
    cesuTitre: [13, 12, 11, 10, 9, 8, 7, 6.5, 6, 5],
    ada: [20, 14.5, 13, 11, 9.5, 9, 8, 6.5, 5.5, 5],
    apf: [23, 16.5, 15, 12.5, 11, 10.5, 9, 7.5, 6.5, 6],
    repit: {
      avecHeberg: [38.5, 35.5, 32.5, 29.5, 26, 23, 20.5, 17.5, 15, 13.5],
      accueilJour: [23.5, 22, 20, 18, 16, 14, 12.5, 10.5, 9.5, 8],
      horsStructure: [15, 14, 12.5, 11.5, 10.5, 10, 9, 7.5, 6.5, 5],
    },
    classeDecJour: [15, 14, 12.5, 11, 10, 9, 8, 7, 6, 5],
    sejourLingJour: [20, 18, 16, 14, 12, 10, 9, 8, 7, 6],
  };

  const LINKS = {
    garde04: 'https://cse-laposte.fr/prestations/garde-enfants',
    garde411: 'https://cse-laposte.fr/prestations/garde-enfants',
    scolarite: 'https://cse-laposte.fr/prestations/allocations-scolaires',
    perisco: 'https://cse-laposte.fr/prestations/periscolaire',
    cheques: 'https://cse-laposte.fr/prestations/cheques-vacances',
    timbrees: 'https://cse-laposte.fr/prestations/vacances-timbrees',
    colo: 'https://cse-laposte.fr/prestations/colonies-vacances',
    sejours: 'https://cse-laposte.fr/prestations/sejours-enfants',
    classedec: 'https://cse-laposte.fr/prestations/classe-decouverte',
    sejourling: 'https://cse-laposte.fr/prestations/sejour-linguistique',
    cesuvq: 'https://cse-laposte.fr/prestations/cesu',
    cesuaid: 'https://cse-laposte.fr/prestations/cesu-aidants',
    domicile: 'https://cse-laposte.fr/prestations/aide-domicile',
    repit: 'https://cse-laposte.fr/prestations/repit-aidants',
    lbpBanque: 'https://www.labanquepostale.fr/particulier/offres-collaborateur.html',
    lbpAssurance: 'https://www.labanquepostale.fr/particulier/assurances.html',
    lbpPret: 'https://www.labanquepostale.fr/particulier/credits.html',
    mobile: 'https://www.lapostemobile.fr/',
    viaPoste: 'https://viaposte.fr',
    cse: 'https://cse-laposte.fr',
    pegPerco: 'https://cse-laposte.fr/epargne-salariale',
  };

  const PAGES = [
    { id: 'index', file: 'index.html', icon: '👤', label: 'Mon profil' },
    { id: 'parentalite', file: 'parentalite.html', icon: '👨‍👩‍👧', label: 'Enfant(s) - de 18 ans' },
    { id: 'enfant1825', file: 'enfant-18-25.html', icon: '🧑‍🎓', label: 'Enfant(s) 18-25 ans' },
    { id: 'vacances', file: 'vacances-loisirs.html', icon: '', label: '🌴 & 🎉' },
    { id: 'banque', file: 'banque-assurance.html', icon: '🏦', label: 'Banque & assurances' },
    { id: 'pegperco', file: 'avantages-groupe.html', icon: '🎁', label: 'Avantages groupe' },
    { id: 'aidant', file: 'aidant-familial.html', icon: '🫶', label: 'Aidant familial et handicap' },
  ];

  /* ── Formatage ─────────────────────────────────────────────── */
  function num(x) { const n = parseFloat(String(x).replace(',', '.')); return isNaN(n) ? 0 : n; }
  function fmt(n) { return Math.round(n).toLocaleString('fr-FR') + ' €'; }
  function fmt2(n) { return n.toLocaleString('fr-FR', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }) + ' €'; }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  /* ── Tranche QF ────────────────────────────────────────────── */
  function trancheIndex(qf) {
    for (let i = 0; i < TMAX.length; i++) { if (qf <= TMAX[i]) return i; }
    return TMAX.length - 1;
  }

  /* ── Profil (localStorage) ────────────────────────────────── */
  function defaultProfile() {
    return { rfr: '', parts: '1', boe: false, isole: false, aidantPart: false, contrat: 'cdi', anciennete: 'plus3' };
  }
  function loadProfile() {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (!raw) return null;
      return Object.assign(defaultProfile(), JSON.parse(raw));
    } catch (e) { return null; }
  }
  function saveProfile(p) {
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch (e) { /* stockage indisponible */ }
  }
  function clearProfile() {
    try { localStorage.removeItem(PROFILE_KEY); } catch (e) {}
  }

  function computeQF(profileOverride) {
    const p = profileOverride || loadProfile();
    if (!p) return { hasQF: false, qf: null, t: null, parts: 0, rfr: 0 };
    const baseParts = num(p.parts);
    const parts = baseParts + 0.5 * ((p.boe ? 1 : 0) + (p.isole ? 1 : 0) + (p.aidantPart ? 1 : 0));
    const rfr = num(p.rfr);
    const hasQF = rfr > 0 && parts > 0;
    const qf = hasQF ? rfr / parts : null;
    const t = hasQF ? trancheIndex(qf) : null;
    return { hasQF, qf, t, parts, rfr };
  }

  /* ── Navigation commune ────────────────────────────────────── */
  function renderHeader(activeId) {
    const headerEl = document.getElementById('asc-header');
    if (!headerEl) return;
    const comp = computeQF();
    const pillClass = comp.hasQF ? 'profile-pill' : 'profile-pill empty';
    const pillText = comp.hasQF
      ? 'Tranche T' + (comp.t + 1) + ' · QF ' + Math.round(comp.qf).toLocaleString('fr-FR') + ' €'
      : 'Profil non renseigné';

    const navLinks = PAGES.map(pg => {
      const cls = pg.id === activeId ? 'nav-link active' : 'nav-link';
      return `<a class="${cls}" href="${pg.file}"><span class="ic">${pg.icon}</span>${pg.label}</a>`;
    }).join('');

    headerEl.innerHTML = `
      <header class="site-header" data-noprint>
        <div class="site-header-inner">
		
<div class="logo-badge">
  <img src="assets/images/cadeau.jpg" alt="Logo">
</div>

          <div>
            <div class="brand-title">Simulateur d'aides NON OFFICIEL <span>2026</span></div>
            <div class="brand-sub">Aides du Groupe · estimation personnalisée NON OFFICIELLE</div>
          </div>
          <a href="index.html" class="${pillClass}"><span class="dot"></span>${pillText}</a>
        </div>
        <nav class="site-nav">${navLinks}</nav>
      </header>`;
  }

  function renderFooter() {
    const el = document.getElementById('asc-footer');
    if (!el) return;
    el.innerHTML = `<footer class="site-footer" data-noprint>
      <strong>OUTIL BENEVOLE NON OFFICIEL</strong> réalisé par jeu par un postier lambda — estimations indicatives basées sur la brochure officielle mais sans valeur contractuelle.
      Vos données restent sur votre appareil (aucun envoi à un serveur).
    </footer>`;
  }

  /* ── Bandeau "profil incomplet" ────────────────────────────── */
  function profileBanner(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const comp = computeQF();
    if (comp.hasQF) { el.innerHTML = ''; return; }
    el.innerHTML = `<div class="banner" data-noprint>
      ⚠️ Renseignez votre revenu fiscal et vos parts sur la page <a href="index.html">👤 Mon profil</a> pour calculer vos montants d'aide(s) théoriques.
    </div>`;
  }

  /* ── Sidebar récapitulatif (QF + total des aides de la page) ─ */
  function renderSidebar(containerId, total, aidCount) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const comp = computeQF();
    const qfText = comp.hasQF ? Math.round(comp.qf).toLocaleString('fr-FR') + ' €' : '—';
    const trancheBlock = comp.hasQF
      ? `<div class="tranche-pill"><b>Tranche T${comp.t + 1}</b><span>${RANGES[comp.t]}</span></div>`
      : `<div class="summary-empty">Renseignez votre revenu fiscal et vos parts pour révéler votre tranche.</div>`;
    const aidCountText = aidCount > 1 ? aidCount + ' aides mobilisables' : (aidCount === 1 ? '1 aide mobilisable' : 'Aucune aide saisie pour le moment');

    el.innerHTML = `
      <aside class="aside-sticky" data-noprint>
        <div class="summary-card">
          <div class="summary-label">Votre quotient familial</div>
          <div class="summary-qf">${qfText}</div>
          ${trancheBlock}
          <div class="summary-divider"></div>
          <div class="summary-label">Estimation de cette page</div>
          <div class="summary-total">${fmt(total)}</div>
          <div class="summary-sub">${aidCountText}</div>
        </div>
        <div class="live-note"><span class="dot"></span>Mise à jour en temps réel</div>
      </aside>`;
  }

  return {
    PROFILE_KEY, TMAX, RANGES, BAREMES, LINKS, PAGES,
    num, fmt, fmt2, escapeHtml,
    trancheIndex, defaultProfile, loadProfile, saveProfile, clearProfile, computeQF,
    renderHeader, renderFooter, profileBanner, renderSidebar,
  };
})();
