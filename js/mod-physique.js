/* ============================================================
   LABOPC — Module Physique
   ============================================================ */
window.registerActivity({
  id: 'chute', level: 'terminale', domain: 'mouvement', icon: '🪂',
  render: function(container, lang) {
    container.innerHTML = `<div class="info-box">Chute libre avec frottements (vitesse limite).</div>`;
    return function cleanup() {};
  }
});
window.registerActivity({
  id: 'diffraction', level: 'terminale', domain: 'ondes', icon: '💡',
  render: function(container, lang) {
    container.innerHTML = `<div class="info-box">Diffraction (tache centrale).</div>`;
    return function cleanup() {};
  }
});
window.registerActivity({
  id: 'interferences', level: 'terminale', domain: 'ondes', icon: '🎛️',
  render: function(container, lang) {
    container.innerHTML = `<div class="info-box">Interférences (fentes de Young).</div>`;
    return function cleanup() {};
  }
});
window.registerActivity({
  id: 'doppler', level: 'terminale', domain: 'ondes', icon: '🚑',
  render: function(container, lang) {
    container.innerHTML = `<div class="info-box">Effet Doppler.</div>`;
    return function cleanup() {};
  }
});
window.registerActivity({
  id: 'lentille', level: 'premiere', domain: 'ondes', icon: '🔎',
  render: function(container, lang) {
    container.innerHTML = `<div class="info-box">Lentille mince convergente.</div>`;
    return function cleanup() {};
  }
});
window.registerActivity({
  id: 'lunette', level: 'terminale', domain: 'ondes', icon: '🔭',
  render: function(container, lang) {
    container.innerHTML = `<div class="info-box">Lunette astronomique.</div>`;
    return function cleanup() {};
  }
});
window.registerActivity({
  id: 'venturi', level: 'terminale', domain: 'mouvement', icon: '🌪️',
  render: function(container, lang) {
    container.innerHTML = `<div class="info-box">Effet Venturi.</div>`;
    return function cleanup() {};
  }
});
window.registerActivity({
  id: 'archimede', level: 'premiere', domain: 'mouvement', icon: '🛟',
  render: function(container, lang) {
    container.innerHTML = `<div class="info-box">Poussée d'Archimède.</div>`;
    return function cleanup() {};
  }
});