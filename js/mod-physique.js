/* ============================================================
   LABOPC — Module Physique (Complet)
   ============================================================ */

// --- 1. CHUTE LIBRE ---
window.registerActivity({
  id: 'chute', level: 'terminale', domain: 'mouvement', icon: '🪂',
  render: function(container, lang) {
    container.innerHTML = `
      <div class="info-box">Chute libre avec frottements (vitesse limite).</div>
      <div class="sim-layout">
        <div class="montage-frame"><canvas id="chute-canvas" width="300" height="400"></canvas></div>
        <div class="controls-panel">
          <div class="live-readout"><div class="lbl">VITESSE (m/s)</div><div id="chute-speed">0.00</div></div>
          <button class="btn success" onclick="window.LABOPC_ACTIVE.toggleChute()" id="btn-chute">▶ Lancer la chute</button>
          <div class="result-box" style="margin-top:20px;"><p><strong>Observation :</strong></p><p class="small">La vitesse augmente puis se stabilise à une valeur limite (régime permanent).</p></div>
        </div>
      </div>
    `;
    let running = false, y = 20, v = 0, animId = null;
    function draw() {
      const canvas = document.getElementById('chute-canvas'); if (!canvas) return;
      const ctx = canvas.getContext('2d'); ctx.clearRect(0,0,300,400);
      ctx.fillStyle = '#eaf4fa'; ctx.fillRect(0,0,300,400);
      ctx.fillStyle = '#546e7a'; ctx.beginPath(); ctx.arc(150, y, 15, 0, 2*Math.PI); ctx.fill();
    }
    function loop() {
      if (!running) return;
      v += 9.81 * 0.016; // dt ~16ms
      v *= 0.99; // frottement simplifié
      y += v * 5;
      if (y > 380) { y = 20; v = 0; } // reset si sort de l'écran
      document.getElementById('chute-speed').textContent = v.toFixed(2);
      draw(); animId = requestAnimationFrame(loop);
    }
    window.LABOPC_ACTIVE = {
      toggleChute: () => {
        running = !running;
        document.getElementById('btn-chute').textContent = running ? '⏸ Arrêter' : '▶ Lancer la chute';
        if (running) loop();
        else if (animId) cancelAnimationFrame(animId);
      }
    };
    draw();
    return function cleanup() { running = false; if (animId) cancelAnimationFrame(animId); delete window.LABOPC_ACTIVE; };
  }
});

// --- 2. DIFFRACTION ---
window.registerActivity({
  id: 'diffraction', level: 'terminale', domain: 'ondes', icon: '💡',
  render: function(container, lang) {
    container.innerHTML = `
      <div class="info-box">La largeur de la tache centrale dépend de la largeur de la fente et de la longueur d'onde.</div>
      <canvas id="diff-canvas" width="600" height="200"></canvas>
      <div class="input-group"><label>Largeur de fente (µm) :</label> <input type="range" id="diff-slit" min="10" max="100" value="50" step="1" oninput="window.LABOPC_ACTIVE.updateDiff()"></div>
      <div class="input-group"><label>Longueur d'onde λ (nm) :</label> <input type="range" id="diff-lambda" min="400" max="700" value="600" step="10" oninput="window.LABOPC_ACTIVE.updateDiff()"></div>
      <div class="result-box" id="diff-result">Tache centrale</div>
    `;
    window.LABOPC_ACTIVE = {
      updateDiff: () => {
        const a = parseFloat(document.getElementById('diff-slit').value) * 1e-6;
        const lambda = parseFloat(document.getElementById('diff-lambda').value) * 1e-9;
        const L = (2 * lambda * 2) / a * 1e3;
        document.getElementById('diff-result').innerHTML = `Largeur de la tache centrale (D=2m) ≈ <strong>${L.toFixed(1)} mm</strong>`;
        const canvas = document.getElementById('diff-canvas'); if (!canvas) return;
        const ctx = canvas.getContext('2d'); const w = canvas.width, h = canvas.height;
        ctx.fillStyle = '#000'; ctx.fillRect(0,0,w,h);
        ctx.fillStyle = '#fff'; const centerX = w/2; const width = Math.max(10, 30000 * lambda / a);
        const grad = ctx.createLinearGradient(centerX - width, 0, centerX + width, 0);
        grad.addColorStop(0, 'rgba(255,255,255,0)'); grad.addColorStop(0.5, 'rgba(255,255,255,1)'); grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad; ctx.fillRect(centerX - width, 50, width*2, 100);
      }
    };
    window.LABOPC_ACTIVE.updateDiff();
    return function cleanup() { delete window.LABOPC_ACTIVE; };
  }
});

// --- 3. INTERFÉRENCES ---
window.registerActivity({
  id: 'interferences', level: 'terminale', domain: 'ondes', icon: '🎛️',
  render: function(container, lang) {
    container.innerHTML = `
      <div class="info-box">L'interfrange dépend de la distance entre les fentes, de λ et de la distance à l'écran.</div>
      <canvas id="interf-canvas" width="600" height="200"></canvas>
      <div class="input-group"><label>Distance entre fentes (mm) :</label> <input type="range" id="interf-dist" min="0.1" max="1.0" value="0.5" step="0.05" oninput="window.LABOPC_ACTIVE.updateInterf()"></div>
      <div class="result-box" id="interf-result">Interfrange</div>
    `;
    window.LABOPC_ACTIVE = {
      updateInterf: () => {
        const d = parseFloat(document.getElementById('interf-dist').value) * 1e-3;
        const lambda = 600e-9; const D = 1.0; const i = (lambda * D) / d * 1e3;
        document.getElementById('interf-result').innerHTML = `Interfrange i = <strong>${i.toFixed(2)} mm</strong>`;
        const canvas = document.getElementById('interf-canvas'); if (!canvas) return;
        const ctx = canvas.getContext('2d'); const w = canvas.width, h = canvas.height;
        ctx.fillStyle = '#111'; ctx.fillRect(0,0,w,h); ctx.fillStyle = '#6ee7b7';
        const step = Math.max(10, i * 50);
        for(let x = 0; x < w; x += step) { ctx.fillRect(x, 50, step/2, 100); }
      }
    };
    window.LABOPC_ACTIVE.updateInterf();
    return function cleanup() { delete window.LABOPC_ACTIVE; };
  }
});

// --- 4. DOPPLER ---
window.registerActivity({
  id: 'doppler', level: 'terminale', domain: 'ondes', icon: '🚑',
  render: function(container, lang) {
    container.innerHTML = `
      <div class="info-box">Une source (ambulance) se déplace. La fréquence perçue change.</div>
      <canvas id="doppler-canvas" width="600" height="200"></canvas>
      <div class="input-group"><label>Vitesse source (m/s) :</label> <input type="range" id="doppler-speed" min="0" max="20" value="5" step="1" oninput="window.LABOPC_ACTIVE.updateDoppler()"></div>
      <div class="result-box" id="doppler-result">Fréquence perçue</div>
    `;
    let dopplerX = 0, dopplerV = 5, dopplerAnim = null;
    function loop() {
      const canvas = document.getElementById('doppler-canvas'); if (!canvas) return;
      const ctx = canvas.getContext('2d'); const w = canvas.width, h = canvas.height;
      ctx.fillStyle = '#f0f4f8'; ctx.fillRect(0,0,w,h);
      dopplerX += dopplerV * 0.1; if(dopplerX > w) dopplerX = 0;
      ctx.beginPath(); ctx.arc(dopplerX, h/2, 15, 0, 2*Math.PI); ctx.fillStyle = '#e74c3c'; ctx.fill();
      ctx.strokeStyle = '#2c5364'; ctx.lineWidth = 2;
      for(let r = 20; r < 150; r += 30) { ctx.beginPath(); ctx.arc(dopplerX - r, h/2, r, 0, 2*Math.PI); ctx.stroke(); }
      const f0 = 440, c = 340, f_obs = f0 * (c / (c + dopplerV));
      document.getElementById('doppler-result').innerHTML = `Fréquence perçue ≈ <strong>${f_obs.toFixed(0)} Hz</strong> (source à ${dopplerV} m/s)`;
      dopplerAnim = requestAnimationFrame(loop);
    }
    window.LABOPC_ACTIVE = {
      updateDoppler: () => { dopplerV = parseFloat(document.getElementById('doppler-speed').value); }
    };
    loop();
    return function cleanup() { if (dopplerAnim) cancelAnimationFrame(dopplerAnim); delete window.LABOPC_ACTIVE; };
  }
});

// --- 5. LENTILLE ---
window.registerActivity({
  id: 'lentille', level: 'premiere', domain: 'ondes', icon: '🔎',
  render: function(container, lang) {
    container.innerHTML = `
      <div class="info-box">Distance focale f' = 10 cm. Déplacez l'objet.</div>
      <canvas id="lentille-canvas" width="600" height="250"></canvas>
      <div class="input-group"><label>Distance objet (cm) :</label> <input type="range" id="lentille-dist" min="5" max="40" value="15" step="1" oninput="window.LABOPC_ACTIVE.updateLentille(this.value)"></div>
      <div class="result-box" id="lentille-result"></div>
    `;
    window.LABOPC_ACTIVE = {
      updateLentille: (val) => {
        const f = 10, OA = -val, OA_prime = (f * OA) / (OA + f);
        document.getElementById('lentille-result').innerHTML = `Position de l'image : <strong>${OA_prime.toFixed(1)} cm</strong> (à droite de la lentille)`;
        const canvas = document.getElementById('lentille-canvas'); if (!canvas) return;
        const ctx = canvas.getContext('2d'); const w = canvas.width, h = canvas.height, cx = w/2, cy = h/2, scale = 5;
        ctx.clearRect(0,0,w,h);
        ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.strokeStyle = '#ccc'; ctx.stroke();
        ctx.beginPath(); ctx.ellipse(cx, cy, 10, 60, 0, 0, 2*Math.PI); ctx.strokeStyle = '#2c5364'; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = '#e74c3c'; ctx.beginPath(); ctx.arc(cx - f*scale, cy, 4, 0, 2*Math.PI); ctx.fill(); ctx.beginPath(); ctx.arc(cx + f*scale, cy, 4, 0, 2*Math.PI); ctx.fill();
        const objX = cx + OA*scale; ctx.beginPath(); ctx.moveTo(objX, cy); ctx.lineTo(objX, cy - 40); ctx.strokeStyle = '#3498db'; ctx.lineWidth = 3; ctx.stroke();
        const imgX = cx + OA_prime*scale; ctx.beginPath(); ctx.moveTo(imgX, cy); ctx.lineTo(imgX, cy + 40); ctx.strokeStyle = '#6ee7b7'; ctx.lineWidth = 3; ctx.stroke();
      }
    };
    window.LABOPC_ACTIVE.updateLentille(15);
    return function cleanup() { delete window.LABOPC_ACTIVE; };
  }
});

// --- 6. LUNETTE ---
window.registerActivity({
  id: 'lunette', level: 'terminale', domain: 'ondes', icon: '🔭',
  render: function(container, lang) {
    container.innerHTML = `
      <div class="info-box">Modèle avec objectif (f'=50cm) et oculaire (f'=10cm).</div>
      <div class="result-box"><p>Grossissement théorique : <strong>G = 50 / 10 = 5</strong></p><p>Distance entre les lentilles (afocale) : <strong>d = f'1 + f'2 = 60 cm</strong></p></div>
    `;
    return function cleanup() {};
  }
});

// --- 7. VENTURI ---
window.registerActivity({
  id: 'venturi', level: 'terminale', domain: 'mouvement', icon: '🌪️',
  render: function(container, lang) {
    container.innerHTML = `
      <div class="info-box">Là où le tube se rétrécit, la vitesse augmente et la pression diminue.</div>
      <canvas id="venturi-canvas" width="600" height="150"></canvas>
      <div class="input-group"><label>Vitesse d'écoulement (m/s) :</label> <input type="range" id="venturi-speed" min="1" max="10" value="3" step="1" oninput="window.LABOPC_ACTIVE.updateVenturi()"></div>
      <div class="result-box" id="venturi-result">Pression</div>
    `;
    window.LABOPC_ACTIVE = {
      updateVenturi: () => {
        const v = parseFloat(document.getElementById('venturi-speed').value);
        const P = 1013 - (0.5 * 1000 * v * v) / 100;
        document.getElementById('venturi-result').innerHTML = `Pression dans le rétrécissement ≈ <strong>${P.toFixed(0)} hPa</strong>`;
        const canvas = document.getElementById('venturi-canvas'); if (!canvas) return;
        const ctx = canvas.getContext('2d'); const w = canvas.width, h = canvas.height;
        ctx.clearRect(0,0,w,h); ctx.fillStyle = '#b3e5fc';
        ctx.beginPath(); ctx.moveTo(0, 20); ctx.lineTo(w/2 - 50, 20); ctx.lineTo(w/2, 60); ctx.lineTo(w/2 + 50, 20); ctx.lineTo(w, 20);
        ctx.lineTo(w, h-20); ctx.lineTo(w/2 + 50, h-20); ctx.lineTo(w/2, h-60); ctx.lineTo(w/2 - 50, h-20); ctx.lineTo(0, h-20);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#2c5364'; ctx.font = '14px sans-serif'; ctx.fillText('Vitesse : ' + v + ' m/s', w/2 - 30, h/2);
      }
    };
    window.LABOPC_ACTIVE.updateVenturi();
    return function cleanup() { delete window.LABOPC_ACTIVE; };
  }
});

// --- 8. ARCHIMÈDE ---
window.registerActivity({
  id: 'archimede', level: 'premiere', domain: 'mouvement', icon: '🛟',
  render: function(container, lang) {
    container.innerHTML = `
      <div class="info-box">Un objet immergé subit une force verticale vers le haut égale au poids du fluide déplacé.</div>
      <div class="input-group"><label>Masse de l'objet (kg) :</label> <input type="number" id="arch-mass" value="5" step="0.5"></div>
      <div class="input-group"><label>Volume de l'objet (L) :</label> <input type="number" id="arch-vol" value="10" step="1"></div>
      <div class="input-group"><label>Masse volumique du fluide (kg/m³) :</label> <input type="number" id="arch-rho" value="1000" step="100"></div>
      <button class="btn success" onclick="window.LABOPC_ACTIVE.calcArch()">Calculer</button>
      <div id="arch-result" style="margin-top:15px;"></div>
    `;
    window.LABOPC_ACTIVE = {
      calcArch: () => {
        const m = parseFloat(document.getElementById('arch-mass').value);
        const V = parseFloat(document.getElementById('arch-vol').value) / 1000;
        const rho = parseFloat(document.getElementById('arch-rho').value);
        const g = 9.81; const Poids = m * g; const Poussee = rho * V * g;
        const resultat = Poids > Poussee ? "L'objet coule." : "L'objet flotte.";
        document.getElementById('arch-result').innerHTML = `
          <div class="result-box"><p>Poids = ${Poids.toFixed(1)} N</p><p>Poussée d'Archimède = ${Poussee.toFixed(1)} N</p><p class="big">${resultat}</p></div>`;
      }
    };
    return function cleanup() { delete window.LABOPC_ACTIVE; };
  }
});