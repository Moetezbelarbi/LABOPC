/* ============================================================
   LABOPC — Core (Navigation, Registre, i18n, Progression)
   ============================================================ */
(function() {
  'use strict';
  window.LABOPC_REGISTRY = window.LABOPC_REGISTRY || [];
  window.registerActivity = function(activity) { window.LABOPC_REGISTRY.push(activity); };

  const TRANSLATIONS = {
    fr: {
      chooseLevel: "Choisissez votre niveau", premiere: "Première", terminale: "Terminale",
      chooseDomain: "Choisissez un domaine", chooseActivity: "Choisissez une activité",
      backHome: "← Accueil", backDomain: "← Domaines", backTheme: "← Thèmes",
      domains: {
        matiere: "Constitution et transformations de la matière",
        mouvement: "Mouvement et interactions",
        energie: "L'énergie : conversions et transferts",
        ondes: "Ondes et signaux"
      },
      activities: {
        "spectro": { title: "Dosage spectrophotométrique", desc: "Loi de Beer-Lambert" },
        "conducto": { title: "Dosage conductimétrique", desc: "Loi de Kohlrausch" },
        "titrage": { title: "Titrages", desc: "pH, conductimétrie, colorimétrie" },
        "dissolution": { title: "Dissolution & Dilution", desc: "Préparation de solutions" },
        "nomenclature": { title: "Nomenclature", desc: "Chimie organique" },
        "synthese": { title: "Synthèse organique", desc: "Rendement d'une réaction" },
        "boyle": { title: "Loi de Boyle-Mariotte", desc: "Propriétés des gaz" },
        "chute": { title: "Chute libre", desc: "Mouvement et frottements" },
        "diffraction": { title: "Diffraction", desc: "Ondes lumineuses" },
        "interferences": { title: "Interférences", desc: "Fentes de Young" },
        "doppler": { title: "Effet Doppler", desc: "Décalage de fréquence" },
        "lentille": { title: "Lentille mince", desc: "Optique géométrique" },
        "lunette": { title: "Lunette astronomique", desc: "Grossissement" },
        "venturi": { title: "Effet Venturi", desc: "Mécanique des fluides" },
        "archimede": { title: "Poussée d'Archimède", desc: "Flottabilité" }
      }
    },
    en: {
      chooseLevel: "Choose your level", premiere: "11th Grade", terminale: "12th Grade",
      chooseDomain: "Choose a domain", chooseActivity: "Choose an activity",
      backHome: "← Home", backDomain: "← Domains", backTheme: "← Themes",
      domains: {
        matiere: "Constitution and transformations of matter",
        mouvement: "Motion and interactions",
        energie: "Energy: conversions and transfers",
        ondes: "Waves and signals"
      },
      activities: {
        "spectro": { title: "Spectrophotometric assay", desc: "Beer-Lambert law" },
        "conducto": { title: "Conductometric assay", desc: "Kohlrausch law" },
        "titrage": { title: "Titrations", desc: "pH, conductometry, colorimetry" },
        "dissolution": { title: "Dissolution & Dilution", desc: "Solution preparation" },
        "nomenclature": { title: "Nomenclature", desc: "Organic chemistry" },
        "synthese": { title: "Organic synthesis", desc: "Reaction yield" },
        "boyle": { title: "Boyle-Mariotte law", desc: "Gas properties" },
        "chute": { title: "Free fall", desc: "Motion and friction" },
        "diffraction": { title: "Diffraction", desc: "Light waves" },
        "interferences": { title: "Interferences", desc: "Young's double slit" },
        "doppler": { title: "Doppler effect", desc: "Frequency shift" },
        "lentille": { title: "Thin lens", desc: "Geometric optics" },
        "lunette": { title: "Astronomical telescope", desc: "Magnification" },
        "venturi": { title: "Venturi effect", desc: "Fluid mechanics" },
        "archimede": { title: "Archimedes' principle", desc: "Buoyancy" }
      }
    }
  };

  let currentLang = 'fr', currentLevel = null, currentDomain = null;
  const appMain = document.getElementById('app-main');

  function t(key) {
    if (key.includes('.')) {
      const [section, prop] = key.split('.');
      return TRANSLATIONS[currentLang][section]?.[prop] || key;
    }
    return TRANSLATIONS[currentLang][key] || key;
  }

  function getProgress() { try { return JSON.parse(localStorage.getItem('labopc_progress')) || {}; } catch { return {}; } }
  function saveProgress(id) { const p = getProgress(); p[id] = true; localStorage.setItem('labopc_progress', JSON.stringify(p)); }

  function clearMain() {
    if (window.LABOPC_CORE.activeCleanup) { try { window.LABOPC_CORE.activeCleanup(); } catch(e) {} window.LABOPC_CORE.activeCleanup = null; }
    appMain.innerHTML = '';
  }

  function renderLevels() {
    clearMain(); window.LABOPC_CORE.currentView = 'home';
    appMain.innerHTML = `<div class="screen active"><h2>${t('chooseLevel')}</h2><div class="choices" style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));">
      <div class="card" onclick="LABOPC_CORE.selectLevel('premiere')"><div class="icon">1️⃣</div><div class="title">${t('premiere')}</div></div>
      <div class="card" onclick="LABOPC_CORE.selectLevel('terminale')"><div class="icon">2️⃣</div><div class="title">${t('terminale')}</div></div>
    </div></div>`;
  }

  function renderDomains() {
    clearMain(); window.LABOPC_CORE.currentView = 'domains';
    const domains = ['matiere', 'mouvement', 'energie', 'ondes'];
    let html = `<div class="screen active"><div class="back-bar"><button class="btn secondary" onclick="LABOPC_CORE.renderLevels()">${t('backHome')}</button></div><h2>${t('chooseDomain')} — ${t(currentLevel)}</h2><div class="choices">`;
    domains.forEach(d => {
      if (window.LABOPC_REGISTRY.some(a => a.level === currentLevel && a.domain === d)) {
        html += `<div class="card" onclick="LABOPC_CORE.selectDomain('${d}')"><div class="icon">📚</div><div class="title">${t('domains.' + d)}</div></div>`;
      }
    });
    html += `</div></div>`; appMain.innerHTML = html;
  }

  function renderActivities() {
    clearMain(); window.LABOPC_CORE.currentView = 'activities';
    const acts = window.LABOPC_REGISTRY.filter(a => a.level === currentLevel && a.domain === currentDomain);
    const progress = getProgress();
    let html = `<div class="screen active"><div class="back-bar"><button class="btn secondary" onclick="LABOPC_CORE.renderDomains()">${t('backDomain')}</button></div><h2>${t('domains.' + currentDomain)} — ${t('chooseActivity')}</h2><div class="choices">`;
    if (acts.length === 0) html += `<div class="info-box">Aucune activité disponible pour ce thème.</div>`;
    else acts.forEach(act => {
      const actT = t('activities.' + act.id);
      const done = progress[act.id] ? ' ✅' : '';
      html += `<div class="card" onclick="LABOPC_CORE.startActivity('${act.id}')"><div class="icon">${act.icon || '🔬'}</div><div class="title">${actT.title}${done}</div><div class="desc">${actT.desc}</div></div>`;
    });
    html += `</div></div>`; appMain.innerHTML = html;
  }

  const CORE = {
    currentView: 'home', activeCleanup: null,
    init: function() { renderLevels(); },
    setLang: function(lang) {
      if (!TRANSLATIONS[lang]) return;
      currentLang = lang;
      document.documentElement.lang = lang;
      document.getElementById('lang-fr').classList.toggle('active', lang === 'fr');
      document.getElementById('lang-en').classList.toggle('active', lang === 'en');
      if (CORE.currentView === 'home') renderLevels();
      else if (CORE.currentView === 'domains') renderDomains();
      else if (CORE.currentView === 'activities') renderActivities();
      else {
        // Keep the current simulation and its entered values intact.
        const notice = document.getElementById('language-activity-notice');
        if (notice) notice.textContent = lang === 'fr'
          ? 'La langue des commandes de cette simulation peut rester en français.'
          : 'Some controls in this simulation may remain in French.';
      }
    },
    selectLevel: function(level) { currentLevel = level; renderDomains(); },
    selectDomain: function(domain) { currentDomain = domain; renderActivities(); },
    startActivity: function(id) {
      const act = window.LABOPC_REGISTRY.find(a => a.id === id);
      if (!act) return;
      clearMain(); CORE.currentView = 'activity';
      const container = document.createElement('div'); container.className = 'screen active';
      const backBtn = document.createElement('div'); backBtn.className = 'back-bar';
      backBtn.innerHTML = `<button class="btn secondary" onclick="LABOPC_CORE.renderActivities()">${t('backTheme')}</button>`;
      container.appendChild(backBtn);
      const title = document.createElement('h2');
      const actT = t('activities.' + act.id);
      title.innerHTML = `<span class="method-badge">${t(currentLevel)}</span> ${actT.title}`;
      container.appendChild(title);
      const moduleDiv = document.createElement('div'); moduleDiv.id = 'module-content';
      container.appendChild(moduleDiv); appMain.appendChild(container);
      const langNotice = document.createElement('p');
      langNotice.id = 'language-activity-notice';
      langNotice.className = 'small';
      langNotice.setAttribute('aria-live', 'polite');
      langNotice.style.cssText = 'color:#667; font-size:.78rem; margin-top:8px;';
      container.appendChild(langNotice);
      if (typeof act.render === 'function') {
        CORE.activeCleanup = act.render(moduleDiv, currentLang);
        saveProgress(id);
      }
    },
    renderLevels, renderDomains, renderActivities
  };
  window.LABOPC_CORE = CORE;
  window.setLang = CORE.setLang;
  // Keyboard activation for the card-based navigation.
  appMain.addEventListener('keydown', function(event) {
    if ((event.key === 'Enter' || event.key === ' ') && event.target.classList.contains('card')) {
      event.preventDefault();
      event.target.click();
    }
  });
  const observer = new MutationObserver(function() {
    appMain.querySelectorAll('.card:not([tabindex])').forEach(function(card) {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
    });
  });
  observer.observe(appMain, { childList: true, subtree: true });
})();