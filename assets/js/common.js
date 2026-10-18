/* ============================================================
   Simulateur NON OFFICIEL des aides de La Poste
   Moteur partagé : profil, tranches QF, barèmes, utilitaires.
   Outil bénévole non officiel — estimations indicatives.
   ============================================================ */

const ASC = (() => {

  const PROFILE_KEY = 'asc2026_profile';
  const BILAN_KEY = 'asc_bilan_v1';
  const DERNIERE_MAJ = '18/10/2026'; // à mettre à jour à chaque modification visible

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

  /* ── Liens : portail CSE Central (demandes = Prestation, commandes = Ventes) ── */
  const PORTAIL = 'https://central-cse-laposte.portailce.com';
  const LINKS = {
    garde04: PORTAIL + '/Prestation/Famille/35',
    garde411: PORTAIL + '/Prestation/Famille/35',
    perisco: PORTAIL + '/Prestation/Famille/28',
    soutienApprentissages: PORTAIL + '/Prestation/Famille/34',
    classedec: PORTAIL + '/Prestation/Famille/30',
    sejourling: PORTAIL + '/Prestation/Famille/31',
    centreLoisirs: PORTAIL + '/Prestation/Famille/33',
    scolarite: PORTAIL + '/Prestation/Famille/38',
    sejours: PORTAIL + '/Prestation/Famille/19',
    colo: PORTAIL + '/Prestation/Famille/39',
    coloAvea: PORTAIL + '/Prestation/Famille/18',
    sejourHandicap: PORTAIL + '/Prestation/Famille/16',
    aideVacancesEnfants: PORTAIL + '/Prestation/Famille/17',
    timbrees: PORTAIL + '/Prestation/Famille/27',
    timbreesDom: PORTAIL + '/Prestation/Famille/20',
    get cheques() { return linkCheques(); },   // CDI/fonctionnaire ou CDD selon le profil
    chequesCdi: PORTAIL + '/Epargnes/Epargnes/119',
    chequesCdd: PORTAIL + '/Ventes/Famille/2',
    cesuvq: PORTAIL + '/Ventes/Famille/3',
    socle: PORTAIL + '/Ventes/Famille/3',
    cesuMajeur: PORTAIL + '/Ventes/Famille/3',
    cesuaid: PORTAIL + '/Ventes/Famille/10',
    cesuBoe: PORTAIL + '/Ventes/Famille/11',
    cesuOpt2: PORTAIL + '/Ventes/Famille/12',
    sport: PORTAIL + '/Article/Article/96',
    infoGardePerisco: PORTAIL + '/Article/Article/94',
    infoJeunesEtudiants: PORTAIL + '/Article/Article/96',
    infoVacancesEnfants: PORTAIL + '/Article/Liste/136',
    domicile: 'https://cse-laposte.fr/prestations/aide-domicile',
    repit: 'https://cse-laposte.fr/prestations/repit-aidants',
    lbpBanque: 'https://www.labanquepostale.fr/particulier/offres-collaborateur.html',
    lbpAssurance: 'https://www.labanquepostale.fr/particulier/assurances.html',
    lbpPret: 'https://www.labanquepostale.fr/particulier/credits.html',
    mobile: 'https://www.lapostemobile.fr/',
    viaPoste: 'https://viaposte.fr',
    vehiposte: 'https://www.lesoccasionsvehiposte.fr/Secure/Login.aspx?ReturnUrl=%2fDefault.aspx',
    cse: 'https://cse-laposte.fr',
    pegPerco: 'https://cse-laposte.fr/epargne-salariale',
  };

  /* ── Démarches complémentaires par aide : [libellé, clé de LINKS] ──
     Affichées en petits boutons sous « Faire la démarche » (cf. renderAidCards). */
  const LIENS_COMPLEMENTAIRES = {
    perisco: [['Infos garde & périscolaire', 'infoGardePerisco']],
    cesuOpt2: [['Demande d\'aide garde d\'enfants', 'garde04']],
    sejours: [['Infos vacances enfants', 'infoVacancesEnfants']],
    colo: [
      ['Colonies AVEA (non subventionnées)', 'coloAvea'],
      ['Centres spécialisés handicap', 'sejourHandicap'],
      ['ASSOVAC · SEA Voyage · UCPA', 'aideVacancesEnfants'],
      ['Infos vacances enfants', 'infoVacancesEnfants'],
    ],
    timbrees: [['Vacances timbrées DOM (CSEE DOM)', 'timbreesDom']],
    cesuaid: [['Commande CESU BOE', 'cesuBoe']],
  };

  /* ── Constantes métier (plafonds, forfaits, taux) ──────────── */
  const CONSTANTES = {
    sport: 60,                                 // aide sport/culture par enfant (€)
    allocEtudiant: [955, 870],                 // T1, T2 (€ par étudiant)
    allocRentree: { primaire: 70, college: 145, lycee: 175 },
    cesuDotation: 50,                          // titres CESU offerts à tous
    cesuValeurTitre: 15,                       // valeur faciale d'un titre (€)
    cesuOpt2: { n04: 84, n411: 55 },           // titres/enfant (option 2 parentalité)
    cesuAidantPlafond: 1830,
    domicileHeuresMax: 15,                     // h/mois prises en compte
    prixHeureRef: 25,                          // prix de l'heure pour les exemples (€)
    creditImpot: 0.5,
    cvPlafondEpargne: 1200,
    coloPlafondEnfant: 1300,
    classeDecMinJours: 3,
    sejourLingMinJours: 7,
    peg: { maxAn: 9200, paliers: [{ jusqua: 400, taux: 0.35 }, { jusqua: 800, taux: 0.25 }, { jusqua: Infinity, taux: 0.15 }] },
    perco: { maxAn: 10533, taux: 0.35 },
    mobile: {
      remisePct: 15,
      forfaits: [
        { label: 'Forfait Standard', prix: 4.99 },
        { label: 'Forfait Intermédiaire', prix: 10.99 },
        { label: 'Forfait Data Max', prix: 19.99 },
      ],
    },
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
    renderDisclaimer();
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
  <img src="assets/images/cadeau.jpg" alt="Logo" title="Image générée par IA (Gemini)">
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
      <br>
      <small>Toutes les images de ce site sont générées par l'IA Gemini (Google).</small>
      <br>
      <small>Dernière mise à jour : ${DERNIERE_MAJ} · <a href="mentions-legales.html">Mentions légales</a> · <a href="politique-confidentialite.html">Confidentialité</a></small>
      <br>
      <a href="https://ko-fi.com/portailmalin?lang=fr" target="_blank" rel="noopener" class="kofi-btn">☕ Soutenir ce site</a>
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

  /* ── Liens "Faire la démarche" ─────────────────────────────── */
  function bindLinks(root) {
    root.querySelectorAll('[data-link]').forEach(b => b.onclick = () => window.open(b.getAttribute('data-link'), '_blank'));
  }
  function linkCheques() {
    const p = loadProfile();
    return p && p.contrat === 'cdd' ? LINKS.chequesCdd : LINKS.chequesCdi;
  }

  /* ── Liste d'aides : `add` ignore les montants nuls ── */
  function newAids() {
    const list = [];
    return { list, add(kind, label, amount, note) { if (amount > 0) list.push({ kind, label, amount, note }); } };
  }
  function sumAids(aids) { return aids.reduce((s, a) => s + a.amount, 0); }

  /* ── Bilan : chaque page d'aides y enregistre ses montants, bilan.html les relit ── */
  function loadBilan() {
    try { const raw = localStorage.getItem(BILAN_KEY); return raw ? JSON.parse(raw) : {}; } catch (e) { return {}; }
  }
  function saveBilan(section, aids, total) {
    const bilan = loadBilan();
    bilan[section] = { total, aids: aids.map(({ label, amount, note }) => ({ label, amount, note })) };
    try { localStorage.setItem(BILAN_KEY, JSON.stringify(bilan)); } catch (e) { /* stockage indisponible */ }
  }

  /* ── Bloc résultats + sidebar + bilan, commun aux pages d'aides ──
     section : clé du bilan ; emptyMsg : texte si aucune aide saisie. */
  function showResults({ section, comp, aids, explain, emptyMsg }) {
    const el = document.getElementById('resultsCard');
    const total = comp.hasQF ? sumAids(aids) : 0;
    if (!comp.hasQF) renderNoProfile(el);
    else if (!aids.length && emptyMsg) el.innerHTML = `<div class="eyebrow">Estimation — Tranche T${comp.t + 1}</div><p class="page-lead page-lead-flush">${emptyMsg}</p>`;
    else renderAidCards(el, comp, aids, total, explain);
    renderSidebar('sidebar', total, aids.length);
    saveBilan(section, comp.hasQF ? aids : [], total);
  }

  /* ── Carte "Vos aides estimées" commune à toutes les pages ──
     aids : [{ kind, label, amount, note, explain?, link? }]
     explainFn(kind, t) : texte d'exemple si l'aide n'a pas son propre `explain`. */
  function renderAidCards(el, comp, aids, total, explainFn) {
    el.innerHTML = `
      <div class="eyebrow">Vos aides estimées — Tranche T${comp.t + 1}</div>
      <h2 class="page-title page-title-sm">${fmt(total)}</h2>
      <div class="aid-cards">
        ${aids.map(a => `
          <div class="aid-card">
            <span class="aid-label">${a.label}</span>
            <span class="aid-amount">${fmt(a.amount)}</span>
            <span class="aid-note">${a.note}</span>
            <div class="aid-explain">${a.explain || (explainFn ? explainFn(a.kind, comp.t) : '')}</div>
            <button class="aid-link" data-link="${a.link || LINKS[a.kind] || LINKS.cse}">🔗 Faire la démarche →</button>
            ${(LIENS_COMPLEMENTAIRES[a.kind] || []).map(([libelle, cle]) =>
              `<button class="aid-link aid-link-more" data-link="${LINKS[cle]}">${libelle} →</button>`).join('')}
          </div>`).join('')}
      </div>`;
    bindLinks(el);
  }
  function renderNoProfile(el) {
    el.innerHTML = `<div class="eyebrow">Estimation</div><p class="page-lead page-lead-flush">Complétez votre <a href="index.html">profil</a> pour voir vos aides estimées ici.</p>`;
  }

  /* ── Calculateur "La Poste Mobile" commun ──────────────────── */
  function renderMobileCalc(containerId, withLink) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const M = CONSTANTES.mobile;
    el.innerHTML = `
      <div class="mobile-select-box">
        <label for="forfaitBase">Sélectionnez un tarif de forfait mensuel :</label>
        <select id="forfaitBase">
          ${M.forfaits.map(f => `<option value="${f.prix}">${f.label} — ${fmt2(f.prix)} / mois</option>`).join('')}
        </select>
      </div>
      <div class="mobile-result-box">
        <div class="mobile-result-title">📉 Votre tarif réduit estimé :</div>
        <div class="mobile-result" id="mobileResult"></div>
        <div class="mobile-remise" id="mobileRemise"></div>
        ${withLink ? `<p class="mobile-link"><button class="link-out" data-link="${LINKS.mobile}">🔗 Accéder à l'offre →</button></p>` : ''}
      </div>`;
    const select = el.querySelector('#forfaitBase');
    const update = () => {
      const remise = parseFloat(select.value) * M.remisePct / 100;
      el.querySelector('#mobileResult').textContent = (parseFloat(select.value) - remise).toFixed(2).replace('.', ',') + ' € / mois';
      el.querySelector('#mobileRemise').textContent = 'Économie : ' + remise.toFixed(2).replace('.', ',') + ' € / mois';
    };
    select.addEventListener('change', update);
    update();
    bindLinks(el);
  }

  /* ── Pages publiques (indexables, sans connexion) ──────────── */
  const PUBLIC_PAGES = [
    { id: 'accueil', file: 'index.html', label: 'Accueil', desc: '' },
    { id: 'qf', file: 'quotient-familial.html', label: 'Quotient familial', desc: 'Comment est calculé votre quotient familial et quelle est votre tranche (T1 à T10).' },
    { id: 'parentalite', file: 'aides-parentalite.html', label: 'Enfants de moins de 18 ans', desc: 'Garde, périscolaire, allocation de rentrée, sport, colonies, classes découverte, séjours linguistiques.' },
    { id: 'etudiants', file: 'aides-etudiants-18-25.html', label: 'Enfants de 18 à 25 ans', desc: 'Allocation scolarité étudiante, aide au sport et titres CESU pour le soutien scolaire.' },
    { id: 'vacances', file: 'aides-vacances.html', label: 'Vacances', desc: 'Chèques-Vacances et vacances timbrées : taux et plafonds par tranche.' },
    { id: 'aidants', file: 'aides-aidants-handicap.html', label: 'Aidants et handicap', desc: 'CESU aidants, aide à domicile (ADA/APF) et aide au répit.' },
  ];

  function renderPublicHeader(activeId) {
    const el = document.getElementById('asc-header');
    if (!el) return;
    el.innerHTML = `
      <header class="site-header" data-noprint>
        <div class="site-header-inner">
          <div class="logo-badge"><img src="assets/images/cadeau.jpg" alt="Logo" title="Image générée par IA (Gemini)" width="44" height="44"></div>
          <div>
            <div class="brand-title">Simulateur d'aides NON OFFICIEL <span>2026</span></div>
            <div class="brand-sub">Outil bénévole · estimation personnalisée NON OFFICIELLE</div>
          </div>
          <a href="index.html#connexion" class="profile-pill"><span class="dot"></span>Accéder au simulateur</a>
        </div>
        <nav class="site-nav">${PUBLIC_PAGES.map(p => `<a class="nav-link${p.id === activeId ? ' active' : ''}" href="${p.file}">${p.label}</a>`).join('')}</nav>
      </header>`;
    renderDisclaimer();
  }

  /* Cartes de présentation des pages publiques (hors accueil) */
  function renderPublicCards(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = PUBLIC_PAGES.filter(p => p.desc).map(p =>
      `<a class="public-card" href="${p.file}"><h3>${p.label}</h3><p>${p.desc}</p><span>Lire →</span></a>`).join('');
  }

  /* ── Bandeau + pop-up « non officiel, bénévole, images IA » ──
     Le pop-up s'affiche tant que le visiteur ne l'a pas validé (mémorisé sur son appareil). */
  const DISCLAIMER_KEY = 'asc_sim_disclaimer_ack_v1';
  function renderDisclaimer() {
    if (document.getElementById('asc-disclaimer-banner')) return;
    document.body.insertAdjacentHTML('afterbegin', `
      <div id="asc-disclaimer-banner" class="asc-disclaimer-banner" data-noprint>
        ⚠️ Simulateur <strong>non officiel</strong>, créé et géré bénévolement par un postier — non affilié à La Poste ni au CSE Central.
        Images générées par l'IA Gemini. <a href="mentions-legales.html">En savoir plus</a>
      </div>`);
    let acquitte = false;
    try { acquitte = !!localStorage.getItem(DISCLAIMER_KEY); } catch (e) { /* stockage indisponible */ }
    if (acquitte) return;
    document.body.insertAdjacentHTML('beforeend', `
      <div id="asc-disclaimer-modal" class="asc-disclaimer-modal" role="dialog" aria-modal="true" aria-labelledby="asc-disclaimer-title" data-noprint>
        <div class="box">
          <span class="tag">⚠️ À lire avant de commencer</span>
          <h2 id="asc-disclaimer-title">Site non officiel et bénévole</h2>
          <p>Ce simulateur est un outil <strong>indépendant</strong>, créé sur son temps libre par un postier. Il n'est ni édité, ni validé, ni relu par La Poste, le CSE Central ou tout autre organisme officiel.</p>
          <p>Les montants affichés sont des <strong>estimations indicatives</strong>, sans valeur contractuelle. Seuls votre relevé de droits et les services officiels du CSE font foi.</p>
          <p><strong>Toutes les images</strong> de ce site ont été <strong>générées par l'IA Gemini</strong> (Google) ; elles ne représentent pas de vraies personnes ni de vrais lieux.</p>
          <button type="button" id="asc-disclaimer-ack-btn">J'ai compris, accéder au site</button>
        </div>
      </div>`);
    document.getElementById('asc-disclaimer-ack-btn').onclick = () => {
      try { localStorage.setItem(DISCLAIMER_KEY, '1'); } catch (e) { /* stockage indisponible */ }
      document.getElementById('asc-disclaimer-modal').remove();
    };
  }

  /* ── Google Analytics : chargé après l'affichage de la page (perf) ── */
  const ANALYTICS_ID = 'G-2449CKTRX4';
  function loadAnalytics() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', ANALYTICS_ID);
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ANALYTICS_ID;
    document.head.appendChild(s);
  }
  window.addEventListener('load', () => (window.requestIdleCallback || setTimeout)(loadAnalytics));

  /* ── Tableaux de barèmes par tranche : <div data-bareme="periscoPct" data-unit="pct" data-cols="Taux">
     Plusieurs colonnes : data-bareme="cvPct,cvMax" data-unit="pct,eur" data-cols="Taux,Plafond". ── */
  const UNITES = {
    pct: v => v + ' %', eur: fmt2, jour: v => fmt2(v) + ' / jour', heure: v => fmt2(v) + ' / h', titre: v => fmt2(v) + ' / titre',
  };
  function fillBaremeTables() {
    document.querySelectorAll('[data-bareme]').forEach(el => {
      const cles = el.getAttribute('data-bareme').split(',');
      const unites = el.getAttribute('data-unit').split(',');
      const cols = el.getAttribute('data-cols').split(',');
      const series = cles.map(c => c.split('.').reduce((o, k) => (o == null ? o : o[k]), BAREMES));
      el.innerHTML = `<table class="bareme-table"><thead><tr><th>Tranche</th><th>Quotient familial</th>${cols.map(c => `<th>${escapeHtml(c)}</th>`).join('')}</tr></thead><tbody>
        ${RANGES.map((r, i) => `<tr><td>T${i + 1}</td><td>${r}</td>${series.map((s, j) => `<td>${UNITES[unites[j]](s[i])}</td>`).join('')}</tr>`).join('')}
      </tbody></table>`;
    });
  }

  /* ── Constantes dans les textes : <span data-c="CONSTANTES.sport"> ──
     data-c = chemin dans ASC ; data-raw => nombre brut, sinon montant en €. */
  function fillConstants() {
    document.querySelectorAll('[data-c]').forEach(el => {
      const v = el.getAttribute('data-c').split('.').reduce((o, k) => (o == null ? o : o[k]), api);
      if (typeof v !== 'number') return;
      el.textContent = el.hasAttribute('data-raw') ? v.toLocaleString('fr-FR') : fmt2(v);
    });
  }
  document.addEventListener('DOMContentLoaded', () => { fillConstants(); fillBaremeTables(); });

  const api = {
    PROFILE_KEY, DERNIERE_MAJ, TMAX, RANGES, BAREMES, CONSTANTES, LINKS, LIENS_COMPLEMENTAIRES, PAGES,
    num, fmt, fmt2, escapeHtml,
    trancheIndex, defaultProfile, loadProfile, saveProfile, clearProfile, computeQF,
    newAids, sumAids, loadBilan, saveBilan, showResults,
    PUBLIC_PAGES, renderPublicHeader, renderPublicCards, renderDisclaimer,
    renderHeader, renderFooter, profileBanner, renderSidebar,
    bindLinks, linkCheques, renderAidCards, renderNoProfile, renderMobileCalc, fillConstants,
  };
  return api;
})();
