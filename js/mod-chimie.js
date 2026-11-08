/* ============================================================
   LABOPC — Module Chimie
   ============================================================ */
window.registerActivity({
  id: 'spectro', level: 'premiere', domain: 'matiere', icon: '🌈',
  render: function(container, lang) {
    container.innerHTML = `<div class="info-box">Simulation Spectrophotométrie (Beer-Lambert). Les mesures sont bruitées, la courbe se construit progressivement.</div>`;
    return function cleanup() {};
  }
});
window.registerActivity({
  id: 'conducto', level: 'premiere', domain: 'matiere', icon: '⚡',
  render: function(container, lang) {
    container.innerHTML = `<div class="info-box">Simulation Conductimétrie (Kohlrausch).</div>`;
    return function cleanup() {};
  }
});
window.registerActivity({
  id: 'titrage', level: 'premiere', domain: 'matiere', icon: '💧',
  render: function(container, lang) {
    container.innerHTML = `<div class="info-box">Simulation Titrages (pH, conducto, colorimétrie).</div>`;
    return function cleanup() {};
  }
});
window.registerActivity({
  id: 'dissolution', level: 'premiere', domain: 'matiere', icon: '⚖️',
  render: function(container, lang) {
    container.innerHTML = `<div class="info-box">Préparation de solutions par dissolution et dilution.</div>`;
    return function cleanup() {};
  }
});
window.registerActivity({
  id: 'nomenclature', level: 'premiere', domain: 'matiere', icon: '📝',
  render: function(container, lang) {
    container.innerHTML = `<div class="info-box">Nomenclature organique.</div>`;
    return function cleanup() {};
  }
});
window.registerActivity({
  id: 'synthese', level: 'premiere', domain: 'matiere', icon: '🔬',
  render: function(container, lang) {
    container.innerHTML = `<div class="info-box">Synthèse organique et rendement.</div>`;
    return function cleanup() {};
  }
});
window.registerActivity({
  id: 'boyle', level: 'premiere', domain: 'matiere', icon: '💨',
  render: function(container, lang) {
    container.innerHTML = `<div class="info-box">Loi de Boyle-Mariotte (P·V = cste).</div>`;
    return function cleanup() {};
  }
});