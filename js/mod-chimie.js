/* ============================================================
   LABOPC — Module Chimie (Complet)
   ============================================================ */

// --- 1. SPECTROPHOTOMÉTRIE ---
window.registerActivity({
  id: 'spectro', level: 'premiere', domain: 'matiere', icon: '🌈',
  render: function(container, lang) {
    const SPECTRO_SOLUTIONS = {
      permanganate: { name: "Solution de permanganate de potassium (KMnO₄)", ion: "MnO₄⁻", color: "#7b1fa2", lambda: 530, kTrue: 2300, unit: "mol/L", unitFactor: 1, concentrations: [0.00, 0.20e-3, 0.40e-3, 0.60e-3, 0.80e-3, 1.00e-3], unknownC: 0.55e-3 },
      sulfate_cuivre: { name: "Solution de sulfate de cuivre (II) (CuSO₄)", ion: "Cu²⁺", color: "#1565c0", lambda: 800, kTrue: 12.5, unit: "mmol/L", unitFactor: 1e-3, concentrations: [0, 20, 40, 60, 80, 100], unknownC: 55 },
      bbt: { name: "Solution de bleu de bromothymol (BBT) en milieu basique", ion: "BBT²⁻", color: "#1e88e5", lambda: 620, kTrue: 15000, unit: "µmol/L", unitFactor: 1e-6, concentrations: [0, 10, 20, 30, 40, 50], unknownC: 27 },
      dichromate: { name: "Solution de dichromate de potassium (K₂Cr₂O₇)", ion: "Cr₂O₇²⁻", color: "#e65100", lambda: 450, kTrue: 3800, unit: "µmol/L", unitFactor: 1e-6, concentrations: [0, 5, 10, 15, 20, 25], unknownC: 13 }
    };
    let currentSpectro = null, currentSpectroData = null;
    let spectroSelectedCuve = null, spectroMeasured = {}, spectroUnknownMeasured = null;

    function gaussNoise(scale) { let u=0,v=0; while(u===0)u=Math.random(); while(v===0)v=Math.random(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)*scale; }
    function linearRegression(xs, ys) { const n=xs.length, mx=xs.reduce((s,v)=>s+v,0)/n, my=ys.reduce((s,v)=>s+v,0)/n; let num=0,den=0; for(let i=0;i<n;i++){num+=(xs[i]-mx)*(ys[i]-my);den+=(xs[i]-mx)**2;} const a=num/den, b=my-a*mx; let ssTot=0,ssRes=0; for(let i=0;i<n;i++){const p=a*xs[i]+b; ssRes+=(ys[i]-p)**2; ssTot+=(ys[i]-my)**2;} return {a,b,r2:1-ssRes/ssTot}; }
    function trueAbsorbance(solKey, cValue) {
      const sol = SPECTRO_SOLUTIONS[solKey];
      const pathLengthCm = 1; // cuve standard de 1,00 cm
      return sol.kTrue * pathLengthCm * cValue * sol.unitFactor;
    }

    function drawSpectroGraph() {
      const sol = SPECTRO_SOLUTIONS[currentSpectro];
      const canvas = document.getElementById('spectro-canvas');
      if (!canvas) return;
      const measuredKeys = Object.keys(spectroMeasured).map(k => parseInt(k)).filter(k => k !== 0).sort((a,b)=>a-b);
      const xs = [0], ys = [spectroMeasured[0] !== undefined ? spectroMeasured[0] : 0];
      measuredKeys.forEach(k => { xs.push(sol.concentrations[k]); ys.push(spectroMeasured[k]); });
      let a = null, b = null;
      if (xs.length >= 3) { const fit = linearRegression(xs, ys); a = fit.a; b = fit.b; }
      const ctx = canvas.getContext('2d');
      const W = canvas.width = 800, H = canvas.height = 420;
      const padL = 75, padR = 30, padT = 30, padB = 60;
      const plotW = W-padL-padR, plotH = H-padT-padB;
      ctx.clearRect(0,0,W,H); ctx.fillStyle = '#fff'; ctx.fillRect(0,0,W,H);
      const xMax = Math.max(...sol.concentrations) * 1.15 || 1;
      const yMax = Math.max(1.2, ...ys.concat(a !== null ? [a*xMax] : [])) * 1.15;
      const yMin = 0;
      const xToPx = x => padL + (x/xMax) * plotW;
      const yToPx = y => H - padB - ((y-yMin)/(yMax-yMin)) * plotH;
      ctx.strokeStyle = '#e8eef5'; ctx.lineWidth = 1;
      for (let i=0; i<=5; i++) {
        const yv = yMin + i*(yMax-yMin)/5;
        ctx.beginPath(); ctx.moveTo(padL, yToPx(yv)); ctx.lineTo(W-padR, yToPx(yv)); ctx.stroke();
        ctx.fillStyle = '#444'; ctx.font = '11px Segoe UI'; ctx.textAlign = 'right';
        ctx.fillText(yv.toFixed(2), padL-8, yToPx(yv)+4);
      }
      for (let i=0; i<=5; i++) {
        const xv = i * xMax / 5;
        ctx.beginPath(); ctx.moveTo(xToPx(xv), padT); ctx.lineTo(xToPx(xv), H-padB); ctx.stroke();
        ctx.fillStyle = '#444'; ctx.textAlign = 'center';
        const lbl = xv < 0.01 ? xv.toFixed(4) : xv < 1 ? xv.toFixed(3) : xv.toFixed(1);
        ctx.fillText(lbl, xToPx(xv), H-padB+18);
      }
      ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, H-padB); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(padL, H-padB); ctx.lineTo(W-padR, H-padB); ctx.stroke();
      ctx.fillStyle = '#0f2027'; ctx.font = 'bold 13px Segoe UI'; ctx.textAlign = 'center';
      ctx.fillText(`Concentration C (${sol.unit})`, padL+plotW/2, H-18);
      ctx.save(); ctx.translate(18, padT+plotH/2); ctx.rotate(-Math.PI/2);
      ctx.fillText('Absorbance A', 0, 0); ctx.restore();
      if (a !== null) {
        ctx.strokeStyle = '#e63946'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(xToPx(0), yToPx(b)); ctx.lineTo(xToPx(xMax), yToPx(a*xMax+b)); ctx.stroke();
      }
      ctx.fillStyle = '#2c5364';
      xs.forEach((x, i) => {
        ctx.beginPath(); ctx.arc(xToPx(x), yToPx(ys[i]), 6, 0, 2*Math.PI); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
      });
      if (spectroUnknownMeasured !== null && a !== null && a !== 0) {
        const Cunknown = (spectroUnknownMeasured - b) / a;
        ctx.fillStyle = '#e65100';
        ctx.beginPath(); ctx.arc(xToPx(Cunknown), yToPx(spectroUnknownMeasured), 8, 0, 2*Math.PI); ctx.fill();
        ctx.strokeStyle = '#bf360c'; ctx.lineWidth = 2; ctx.stroke();
        ctx.setLineDash([5,5]); ctx.strokeStyle = '#e65100'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(xToPx(Cunknown), yToPx(spectroUnknownMeasured)); ctx.lineTo(xToPx(Cunknown), H-padB); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(xToPx(Cunknown), yToPx(spectroUnknownMeasured)); ctx.lineTo(padL, yToPx(spectroUnknownMeasured)); ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    function updateSpectroFit() {
      const sol = SPECTRO_SOLUTIONS[currentSpectro];
      const keys = Object.keys(spectroMeasured).map(k => parseInt(k)).filter(k => k !== 0).sort((a,b)=>a-b);
      const zone = document.getElementById('spectro-fit-zone');
      if (!zone) return;
      if (keys.length < 3) { zone.innerHTML = `<div class="warning-box">⚠️ Mesurez au moins 3 solutions étalons (en plus du blanc).</div>`; return; }
      const xs = [0], ys = [spectroMeasured[0] || 0];
      keys.forEach(k => { xs.push(sol.concentrations[k]); ys.push(spectroMeasured[k]); });
      const {a, b, r2} = linearRegression(xs, ys);
      currentSpectroData = {A: ys, a, b, r2};
      let html = `<div class="result-box"><p><strong>📐 Droite d'étalonnage :</strong></p><p class="big">A = ${a.toFixed(4)} × C ${b >= 0 ? '+' : '−'} ${Math.abs(b).toFixed(4)}</p><p>R² = ${r2.toFixed(5)}</p></div>`;
      if (spectroUnknownMeasured !== null) {
        const Ccalc = (spectroUnknownMeasured - b) / a;
        const erreur = Math.abs(Ccalc - sol.unknownC) / sol.unknownC * 100;
        document.getElementById('spec-c-unknown').textContent = Ccalc.toPrecision(3);
        html += `<div class="result-box" style="margin-top:12px;background:linear-gradient(90deg,#ffe0b2,#ffcc80);border-color:#e65100;"><p><strong>🎯 Solution inconnue mesurée</strong></p><p>A<sub>inconnue</sub> mesurée = ${spectroUnknownMeasured.toFixed(3)}</p><p>C<sub>inconnue</sub> = (A − b) / a = (${spectroUnknownMeasured.toFixed(3)} − ${b.toFixed(4)}) / ${a.toFixed(4)}</p><p class="big" style="color:#bf360c;">C<sub>inconnue</sub> = ${Ccalc.toPrecision(3)} ${sol.unit}</p><p class="small">Écart : ${erreur.toFixed(1)} %</p></div>`;
      }
      zone.innerHTML = html; drawSpectroGraph();
    }

    function selectCuve(idx, isUnknown) {
      const sol = SPECTRO_SOLUTIONS[currentSpectro];
      spectroSelectedCuve = isUnknown ? -1 : idx;
      const cuve = document.getElementById('cuve-el');
      cuve.classList.remove('outside');
      let c = isUnknown ? sol.unknownC : sol.concentrations[idx];
      const op = Math.min(1, (c / sol.concentrations[sol.concentrations.length-1]) * 0.95 + 0.05);
      cuve.querySelector('.liquid').style.background = sol.color;
      cuve.querySelector('.liquid').style.opacity = op;
      document.getElementById('btn-measure-spectro').disabled = false;
      document.getElementById('spectro-value').textContent = '—.———';
    }

    function animateSpectroMeasure() {
      if (spectroSelectedCuve === null) return;
      const btn = document.getElementById('btn-measure-spectro');
      btn.disabled = true;
      const beam = document.getElementById('beam-el');
      beam.classList.add('on');
      const valueEl = document.getElementById('spectro-value');
      const sol = SPECTRO_SOLUTIONS[currentSpectro];
      let trueA = (spectroSelectedCuve === -1) ? trueAbsorbance(currentSpectro, sol.unknownC) : trueAbsorbance(currentSpectro, sol.concentrations[spectroSelectedCuve]);
      const noiseScale = Math.max(0.001, trueA * (spectroSelectedCuve === -1 ? 0.015 : 0.01));
      let step = 0;
      const interval = setInterval(() => {
        step++;
        const progress = step / 25;
        const current = trueA * progress + gaussNoise(noiseScale);
        valueEl.textContent = Math.max(0, current).toFixed(3);
        if (step >= 25) {
          clearInterval(interval);
          const finalA = Math.max(0, +(trueA + gaussNoise(noiseScale)).toFixed(3));
          valueEl.textContent = finalA.toFixed(3);
          if (spectroSelectedCuve === -1) {
            spectroUnknownMeasured = finalA;
            document.getElementById('spec-a-unknown').textContent = finalA.toFixed(3);
          } else {
            spectroMeasured[spectroSelectedCuve] = finalA;
            document.getElementById(`spec-a-${spectroSelectedCuve}`).textContent = finalA.toFixed(3);
          }
          beam.classList.remove('on');
          btn.disabled = false;
          drawSpectroGraph(); updateSpectroFit();
        }
      }, 60);
    }

    function startSpectro(key) {
      currentSpectro = key;
      const sol = SPECTRO_SOLUTIONS[key];
      container.innerHTML = `
        <div class="info-box"><strong>Contexte :</strong> ${sol.name}. Mesure à λ = ${sol.lambda} nm, cuve de 1,00 cm. Loi utilisée : A = ε·l·C, avec C convertie en mol·L⁻¹.</div>
        <div class="warning-box">⚠️ Les coefficients ε de Cu²⁺, BBT et dichromate sont des paramètres pédagogiques indicatifs, non certifiés expérimentalement. Le coefficient du permanganate (2300 L·mol⁻¹·cm⁻¹) doit également être confirmé avec le matériel réel.</div>
        <h3>🔬 Matériel : spectrophotomètre</h3>
        <div class="instru-area">
          <div class="spectro-device" style="width:340px;height:200px;background:linear-gradient(180deg,#4a5a6a,#2c3e50);border-radius:14px;position:relative;padding:20px;">
            <div class="beam" id="beam-el" style="position:absolute;top:50%;left:40px;right:80px;height:4px;background:linear-gradient(90deg,transparent,#ffeb3b,#ffeb3b,transparent);transform:translateY(-50%);opacity:0;transition:opacity 0.3s;box-shadow:0 0 12px #ffeb3b;"></div>
            <div style="position:absolute;top:50%;left:20px;transform:translateY(-50%);width:20px;height:80px;background:#111;border-radius:4px;border:2px solid #555;display:flex;align-items:center;justify-content:center;">
              <div class="cuve outside" id="cuve-el" style="width:18px;height:40px;border:2px solid #ccc;border-radius:2px;position:relative;background:transparent;overflow:hidden;transition:transform 0.5s ease;transform:translateX(-120px);"><div class="liquid" style="background:${sol.color};position:absolute;bottom:0;left:0;right:0;height:70%;transition:background 0.3s;"></div></div>
            </div>
            <div style="position:absolute;top:15px;right:20px;">
              <div style="background:#0a1a12;border:2px solid #1a4a3a;border-radius:6px;padding:8px 14px;color:#6ee7b7;font-family:'Courier New',monospace;font-size:1.4rem;font-weight:700;text-align:right;box-shadow:inset 0 0 10px rgba(110,231,183,0.3);min-width:150px;">
                <span id="spectro-value">—.———</span>
                <div style="font-size:0.7rem;color:#6ee7b7;opacity:0.7;text-align:left;">Absorbance A</div>
              </div>
            </div>
            <div style="position:absolute;bottom:14px;left:20px;color:#6ee7b7;font-family:monospace;font-size:0.75rem;">λ = ${sol.lambda} nm</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:10px;align-items:center;">
            <div style="font-weight:600;color:#0f2027;font-size:0.95rem;">Solution à mesurer :</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;" id="cuve-selector"></div>
            <button class="btn success" id="btn-measure-spectro" onclick="window.LABOPC_ACTIVE.animateSpectroMeasure()" disabled>📏 Lancer la mesure</button>
          </div>
        </div>
        <h3>📊 Tableau de mesures</h3><table><tr><th>Solution</th><th>C (${sol.unit})</th><th>Absorbance A</th></tr>
        ${sol.concentrations.map((c, i) => `<tr><td>${i === 0 ? 'Blanc' : i}</td><td>${c}</td><td id="spec-a-${i}">—</td></tr>`).join('')}
        <tr style="background:#fff3e0;font-weight:600;"><td>❓ Inconnue</td><td id="spec-c-unknown">?</td><td id="spec-a-unknown">—</td></tr>
        </table>
        <h3>📈 Courbe d'étalonnage A = f(C)</h3><canvas id="spectro-canvas" width="800" height="420"></canvas>
        <div id="spectro-fit-zone"></div>
      `;
      const sel = document.getElementById('cuve-selector');
      sol.concentrations.forEach((c, i) => {
        const btn = document.createElement('button'); btn.className = 'btn secondary'; btn.style.padding = '6px 10px'; btn.style.fontSize = '0.8rem';
        btn.textContent = i === 0 ? 'Blanc' : `C${i}=${c}`; btn.onclick = () => selectCuve(i, false); sel.appendChild(btn);
      });
      const unkBtn = document.createElement('button'); unkBtn.className = 'btn'; unkBtn.style.cssText = 'border:2px dashed #e65100;background:#fff3e0;color:#e65100;font-weight:700;padding:6px 10px;font-size:0.8rem;';
      unkBtn.textContent = '❓ Inconnue'; unkBtn.onclick = () => selectCuve(-1, true); sel.appendChild(unkBtn);
      
      window.LABOPC_ACTIVE = { animateSpectroMeasure };
      spectroMeasured = {}; spectroUnknownMeasured = null; spectroSelectedCuve = null;
      drawSpectroGraph();
    }

    container.innerHTML = `<div class="info-box">Choisissez une solution pour commencer l'étalonnage.</div><div class="choices" id="spectro-sol-list"></div>`;
    const list = document.getElementById('spectro-sol-list');
    Object.keys(SPECTRO_SOLUTIONS).forEach(key => {
      const s = SPECTRO_SOLUTIONS[key];
      const card = document.createElement('div'); card.className = 'card';
      card.innerHTML = `<div class="icon" style="color:${s.color}">●</div><div class="title">${s.ion}</div><div class="desc">${s.name}</div>`;
      card.onclick = () => startSpectro(key); list.appendChild(card);
    });

    return function cleanup() { delete window.LABOPC_ACTIVE; };
  }
});

// --- 2. CONDUCTIMÉTRIE ---
window.registerActivity({
  id: 'conducto', level: 'premiere', domain: 'matiere', icon: '⚡',
  render: function(container, lang) {
    const CONDUCTO_SOLUTIONS = {
      nacl: { name: "Solution de chlorure de sodium (NaCl)", ions: "Na⁺ (aq) + Cl⁻ (aq)", kTrue: 0.1264, unit: "mmol/L", concentrations: [0, 2, 4, 6, 8, 10], unknownC: 6.5, sigmaFor: (C_mmol) => (50.1e-4 + 76.3e-4) * C_mmol * 10 },
      kcl: { name: "Solution de chlorure de potassium (KCl)", ions: "K⁺ (aq) + Cl⁻ (aq)", kTrue: 0.1498, unit: "mmol/L", concentrations: [0, 2, 4, 6, 8, 10], unknownC: 7.2, sigmaFor: (C_mmol) => (73.5e-4 + 76.3e-4) * C_mmol * 10 },
      cuso4: { name: "Solution de sulfate de cuivre (CuSO₄)", ions: "Cu²⁺ (aq) + SO₄²⁻ (aq)", kTrue: 0.2672, unit: "mmol/L", concentrations: [0, 1, 2, 3, 4, 5], unknownC: 2.4, sigmaFor: (C_mmol) => (107.2e-4 + 160.0e-4) * C_mmol * 10 },
      cacl2: { name: "Solution de chlorure de calcium (CaCl₂)", ions: "Ca²⁺ (aq) + 2 Cl⁻ (aq)", kTrue: 0.2716, unit: "mmol/L", concentrations: [0, 1, 2, 3, 4, 5], unknownC: 3.1, sigmaFor: (C_mmol) => (119.0e-4 + 2 * 76.3e-4) * C_mmol * 10 }
    };
    let currentConducto = null, conductoSelected = null, conductoMeasured = {}, conductoUnknownMeasured = null;

    function gaussNoise(scale) { let u=0,v=0; while(u===0)u=Math.random(); while(v===0)v=Math.random(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)*scale; }
    function linearRegression(xs, ys) { const n=xs.length, mx=xs.reduce((s,v)=>s+v,0)/n, my=ys.reduce((s,v)=>s+v,0)/n; let num=0,den=0; for(let i=0;i<n;i++){num+=(xs[i]-mx)*(ys[i]-my);den+=(xs[i]-mx)**2;} const a=num/den, b=my-a*mx; let ssTot=0,ssRes=0; for(let i=0;i<n;i++){const p=a*xs[i]+b; ssRes+=(ys[i]-p)**2; ssTot+=(ys[i]-my)**2;} return {a,b,r2:1-ssRes/ssTot}; }

    function drawConductoGraph() {
      const sol = CONDUCTO_SOLUTIONS[currentConducto];
      const canvas = document.getElementById('conducto-canvas');
      if (!canvas) return;
      const keys = Object.keys(conductoMeasured).map(k => parseInt(k)).filter(k => k !== 0).sort((a,b)=>a-b);
      const xs = [0], ys = [conductoMeasured[0] !== undefined ? conductoMeasured[0] : 0];
      keys.forEach(k => { xs.push(sol.concentrations[k]); ys.push(conductoMeasured[k]); });
      let a = null, b = null;
      if (xs.length >= 3) { const fit = linearRegression(xs, ys); a = fit.a; b = fit.b; }
      const ctx = canvas.getContext('2d');
      const W = canvas.width = 800, H = canvas.height = 420;
      const padL = 75, padR = 30, padT = 30, padB = 60;
      const plotW = W-padL-padR, plotH = H-padT-padB;
      ctx.clearRect(0,0,W,H); ctx.fillStyle = '#fff'; ctx.fillRect(0,0,W,H);
      const xMax = Math.max(...sol.concentrations) * 1.15 || 1;
      const yMax = Math.max(0.5, ...ys.concat(a !== null ? [a*xMax] : [])) * 1.15;
      const yMin = 0;
      const xToPx = x => padL + (x/xMax) * plotW;
      const yToPx = y => H - padB - ((y-yMin)/(yMax-yMin)) * plotH;
      ctx.strokeStyle = '#e8eef5'; ctx.lineWidth = 1;
      for (let i=0; i<=5; i++) {
        const yv = yMin + i*(yMax-yMin)/5;
        ctx.beginPath(); ctx.moveTo(padL, yToPx(yv)); ctx.lineTo(W-padR, yToPx(yv)); ctx.stroke();
        ctx.fillStyle = '#444'; ctx.font = '11px Segoe UI'; ctx.textAlign = 'right';
        ctx.fillText(yv.toFixed(2), padL-8, yToPx(yv)+4);
      }
      for (let i=0; i<=5; i++) {
        const xv = i * xMax / 5;
        ctx.beginPath(); ctx.moveTo(xToPx(xv), padT); ctx.lineTo(xToPx(xv), H-padB); ctx.stroke();
        ctx.fillStyle = '#444'; ctx.textAlign = 'center';
        ctx.fillText(xv.toFixed(1), xToPx(xv), H-padB+18);
      }
      ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, H-padB); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(padL, H-padB); ctx.lineTo(W-padR, H-padB); ctx.stroke();
      ctx.fillStyle = '#0f2027'; ctx.font = 'bold 13px Segoe UI'; ctx.textAlign = 'center';
      ctx.fillText(`Concentration C (${sol.unit})`, padL+plotW/2, H-18);
      ctx.save(); ctx.translate(18, padT+plotH/2); ctx.rotate(-Math.PI/2);
      ctx.fillText('σ (mS/cm)', 0, 0); ctx.restore();
      if (a !== null) {
        ctx.strokeStyle = '#e63946'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(xToPx(0), yToPx(b)); ctx.lineTo(xToPx(xMax), yToPx(a*xMax+b)); ctx.stroke();
      }
      ctx.fillStyle = '#2c5364';
      xs.forEach((x, i) => {
        ctx.beginPath(); ctx.arc(xToPx(x), yToPx(ys[i]), 6, 0, 2*Math.PI); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
      });
      if (conductoUnknownMeasured !== null && a !== null && a !== 0) {
        const Cunknown = (conductoUnknownMeasured - b) / a;
        ctx.fillStyle = '#e65100';
        ctx.beginPath(); ctx.arc(xToPx(Cunknown), yToPx(conductoUnknownMeasured), 8, 0, 2*Math.PI); ctx.fill();
        ctx.strokeStyle = '#bf360c'; ctx.lineWidth = 2; ctx.stroke();
        ctx.setLineDash([5,5]); ctx.strokeStyle = '#e65100'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(xToPx(Cunknown), yToPx(conductoUnknownMeasured)); ctx.lineTo(xToPx(Cunknown), H-padB); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(xToPx(Cunknown), yToPx(conductoUnknownMeasured)); ctx.lineTo(padL, yToPx(conductoUnknownMeasured)); ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    function updateConductoFit() {
      const sol = CONDUCTO_SOLUTIONS[currentConducto];
      const keys = Object.keys(conductoMeasured).map(k => parseInt(k)).filter(k => k !== 0).sort((a,b)=>a-b);
      const zone = document.getElementById('conducto-fit-zone');
      if (!zone) return;
      if (keys.length < 3) { zone.innerHTML = `<div class="warning-box">⚠️ Mesurez au moins 3 solutions étalons (en plus de la référence).</div>`; return; }
      const xs = [0], ys = [conductoMeasured[0] || 0];
      keys.forEach(k => { xs.push(sol.concentrations[k]); ys.push(conductoMeasured[k]); });
      const {a, b, r2} = linearRegression(xs, ys);
      let html = `<div class="result-box"><p><strong>📐 Droite d'étalonnage :</strong></p><p class="big">σ = ${a.toFixed(4)} × C ${b >= 0 ? '+' : '−'} ${Math.abs(b).toFixed(4)}</p><p>R² = ${r2.toFixed(5)}</p></div>`;
      if (conductoUnknownMeasured !== null) {
        const Ccalc = (conductoUnknownMeasured - b) / a;
        const erreur = Math.abs(Ccalc - sol.unknownC) / sol.unknownC * 100;
        document.getElementById('cond-c-unknown').textContent = Ccalc.toPrecision(3);
        html += `<div class="result-box" style="margin-top:12px;background:linear-gradient(90deg,#ffe0b2,#ffcc80);border-color:#e65100;"><p><strong>🎯 Solution inconnue mesurée</strong></p><p>σ<sub>inconnue</sub> mesurée = ${conductoUnknownMeasured.toFixed(3)} mS/cm</p><p>C<sub>inconnue</sub> = (σ − b) / a = (${conductoUnknownMeasured.toFixed(3)} − ${b.toFixed(4)}) / ${a.toFixed(4)}</p><p class="big" style="color:#bf360c;">C<sub>inconnue</sub> = ${Ccalc.toPrecision(3)} ${sol.unit}</p><p class="small">Écart : ${erreur.toFixed(1)} %</p></div>`;
      }
      zone.innerHTML = html; drawConductoGraph();
    }

    function selectCondSolution(idx, isUnknown) {
      const sol = CONDUCTO_SOLUTIONS[currentConducto];
      conductoSelected = isUnknown ? -1 : idx;
      const liq = document.getElementById('probe-liquid');
      let c = isUnknown ? sol.unknownC : sol.concentrations[idx];
      const op = Math.min(1, (c / sol.concentrations[sol.concentrations.length-1]) * 0.7 + 0.2);
      liq.style.background = `rgba(100, 181, 246, ${op})`;
      document.getElementById('btn-dip').disabled = false;
      document.getElementById('conducto-value').textContent = '—.———';
    }

    function dipProbe() {
      document.getElementById('probe-container').classList.add('dipped');
      document.getElementById('btn-dip').disabled = true;
      const sol = CONDUCTO_SOLUTIONS[currentConducto];
      const isUnknown = conductoSelected === -1;
      const c = isUnknown ? sol.unknownC : sol.concentrations[conductoSelected];
      const trueSigma = sol.sigmaFor(c);
      const noiseScale = Math.max(0.001, trueSigma * (isUnknown ? 0.015 : 0.01));
      const valueEl = document.getElementById('conducto-value');
      let step = 0;
      const interval = setInterval(() => {
        step++;
        const val = trueSigma * (step / 20) + gaussNoise(noiseScale);
        valueEl.textContent = Math.max(0, val).toFixed(3);
        if (step >= 20) {
          clearInterval(interval);
          const finalSigma = Math.max(0, +(trueSigma + gaussNoise(noiseScale)).toFixed(3));
          valueEl.textContent = finalSigma.toFixed(3);
          if (isUnknown) {
            conductoUnknownMeasured = finalSigma;
            document.getElementById('cond-s-unknown').textContent = finalSigma.toFixed(3);
          } else {
            conductoMeasured[conductoSelected] = finalSigma;
            document.getElementById(`cond-s-${conductoSelected}`).textContent = finalSigma.toFixed(3);
          }
          drawConductoGraph(); updateConductoFit();
        }
      }, 60);
    }
    
    function liftProbe() { document.getElementById('probe-container').classList.remove('dipped'); document.getElementById('btn-dip').disabled = false; }

    function startConducto(key) {
      currentConducto = key;
      const sol = CONDUCTO_SOLUTIONS[key];
      container.innerHTML = `
        <div class="info-box"><strong>Contexte :</strong> ${sol.name}.</div>
        <h3>🔬 Matériel : conductimètre</h3>
        <div class="instru-area">
          <div style="width:340px;height:220px;background:linear-gradient(180deg,#4a4a4a,#2a2a2a);border-radius:14px;position:relative;padding:20px;box-shadow:0 8px 20px rgba(0,0,0,0.3);">
            <div style="position:absolute;top:15px;right:20px;">
              <div style="background:#0a0a1a;border:2px solid #1a2a4a;border-radius:6px;padding:8px 14px;color:#64b5f6;font-family:'Courier New',monospace;font-size:1.4rem;font-weight:700;text-align:right;box-shadow:inset 0 0 10px rgba(100,181,246,0.3);min-width:150px;">
                <span id="conducto-value">—.———</span>
                <div style="font-size:0.7rem;color:#64b5f6;text-align:left;">σ (mS/cm)</div>
              </div>
            </div>
            <div style="position:absolute;bottom:12px;left:20px;color:#64b5f6;font-family:monospace;font-size:0.7rem;">cellule</div>
          </div>
          <div>
            <div style="font-weight:600;color:#0f2027;font-size:0.95rem;margin-bottom:8px;">Bécher + cellule :</div>
            <div style="width:120px;height:90px;border:3px solid #7a8fa3;border-top:none;border-radius:0 0 14px 14px;position:relative;overflow:hidden;background:#fafafa;margin-top:10px;">
              <div class="liquid" id="probe-liquid" style="background:#b3e5fc;position:absolute;bottom:0;left:0;right:0;height:60%;"></div>
              <div class="probe-container" id="probe-container" style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);transition:transform 0.6s ease;z-index:2;">
                <div style="position:relative;display:flex;gap:30px;align-items:flex-end;">
                  <div style="width:8px;height:70px;background:linear-gradient(180deg,#aaa,#666);border-radius:3px;position:relative;"><div style="position:absolute;bottom:4px;left:-4px;right:-4px;height:8px;background:#333;border:1px solid #666;"></div></div>
                  <div style="width:8px;height:70px;background:linear-gradient(180deg,#aaa,#666);border-radius:3px;position:relative;"><div style="position:absolute;bottom:4px;left:-4px;right:-4px;height:8px;background:#333;border:1px solid #666;"></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="center" style="margin-top:16px;">
          <div style="font-weight:600;color:#0f2027;margin-bottom:8px;">Choisissez une solution :</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;" id="cond-selector"></div>
          <div style="margin-top:12px;"><button class="btn success" id="btn-dip" onclick="window.LABOPC_ACTIVE.dipProbe()" disabled>🔽 Plonger la cellule</button><button class="btn secondary" onclick="window.LABOPC_ACTIVE.liftProbe()">🔼 Retirer</button></div>
        </div>
        <h3>📊 Tableau de mesures</h3><table><tr><th>#</th><th>C (${sol.unit})</th><th>σ (mS/cm)</th></tr>
        ${sol.concentrations.map((c, i) => `<tr><td>${i === 0 ? 'Réf.' : i}</td><td>${c}</td><td id="cond-s-${i}">—</td></tr>`).join('')}
        <tr style="background:#fff3e0;font-weight:600;"><td>❓ Inconnue</td><td id="cond-c-unknown">?</td><td id="cond-s-unknown">—</td></tr>
        </table>
        <h3>📈 Courbe σ = f(C)</h3><canvas id="conducto-canvas" width="800" height="420"></canvas>
        <div id="conducto-fit-zone"></div>
      `;
      const sel = document.getElementById('cond-selector');
      sol.concentrations.forEach((c, i) => {
        const btn = document.createElement('button'); btn.className = 'btn secondary'; btn.style.padding = '6px 10px'; btn.style.fontSize = '0.8rem';
        btn.textContent = i === 0 ? 'Réf. (0)' : `C${i}=${c}`; btn.onclick = () => selectCondSolution(i, false); sel.appendChild(btn);
      });
      const unkBtn = document.createElement('button'); unkBtn.className = 'btn'; unkBtn.style.cssText = 'border:2px dashed #e65100;background:#fff3e0;color:#e65100;font-weight:700;padding:6px 10px;font-size:0.8rem;';
      unkBtn.textContent = '❓ Inconnue'; unkBtn.onclick = () => selectCondSolution(-1, true); sel.appendChild(unkBtn);
      
      window.LABOPC_ACTIVE = { dipProbe, liftProbe };
      conductoMeasured = {}; conductoUnknownMeasured = null; conductoSelected = null;
      drawConductoGraph();
    }

    container.innerHTML = `<div class="info-box">Choisissez une solution pour commencer l'étalonnage.</div><div class="choices" id="cond-sol-list"></div>`;
    const list = document.getElementById('cond-sol-list');
    Object.keys(CONDUCTO_SOLUTIONS).forEach(key => {
      const s = CONDUCTO_SOLUTIONS[key];
      const card = document.createElement('div'); card.className = 'card';
      card.innerHTML = `<div class="icon">⚡</div><div class="title">${s.ions}</div><div class="desc">${s.name}</div>`;
      card.onclick = () => startConducto(key); list.appendChild(card);
    });

    return function cleanup() { delete window.LABOPC_ACTIVE; };
  }
});

// --- 3. TITRAGES ---
window.registerActivity({
  id: 'titrage', level: 'premiere', domain: 'matiere', icon: '💧',
  render: function(container, lang) {
    const TITRAGE_TYPES = {
      phmetrique: {
        label: "Titrage pH-métrique", systems: {
          hcl_naoh: { name: "HCl / NaOH", reaction: "H₃O⁺ + HO⁻ → 2 H₂O", titrant: "NaOH", titrantC: 0.10, speciesLabel: "H₃O⁺", vUnknown: 10.0, C_sample: 0.125, coeff: 1, type: "fort_fort", Ka: null, indicatorKey: null, titrantColor: "#eaf4f8", colorStart: "#e8eef5", colorEnd: "#e8eef5" },
          acide_acetique: { name: "CH₃COOH / NaOH", reaction: "CH₃COOH + HO⁻ → CH₃COO⁻ + H₂O", titrant: "NaOH", titrantC: 0.050, speciesLabel: "CH₃COOH", vUnknown: 10.0, C_sample: 0.070, coeff: 1, type: "faible_fort", Ka: 1.8e-5, indicatorKey: null, titrantColor: "#eaf4f8", colorStart: "#e8eef5", colorEnd: "#e8eef5" }
        }
      },
      conductometrique: {
        label: "Titrage conductimétrique", systems: {
          nacl_agno3: { name: "NaCl / AgNO₃", reaction: "Ag⁺ + Cl⁻ → AgCl(s)", titrant: "AgNO₃", titrantC: 0.050, speciesLabel: "Cl⁻", vUnknown: 10.0, C_sample: 0.050, coeff: 1, type: "precipitation", Ka: null, indicatorKey: null, titrantColor: "#eaf4f8", colorStart: "#e8eef5", colorEnd: "#e8eef5" },
          hcl_naoh_cond: { name: "HCl / NaOH", reaction: "H₃O⁺ + HO⁻ → 2 H₂O", titrant: "NaOH", titrantC: 0.10, speciesLabel: "H₃O⁺", vUnknown: 10.0, C_sample: 0.100, coeff: 1, type: "acide_base", Ka: null, indicatorKey: null, titrantColor: "#eaf4f8", colorStart: "#e8eef5", colorEnd: "#e8eef5" }
        }
      },
      colorimetrique: {
        label: "Titrage colorimétrique", systems: {
          hcl_naoh_color: { name: "HCl / NaOH avec hélianthine", reaction: "H₃O⁺ + HO⁻ → 2 H₂O", titrant: "NaOH", titrantC: 0.10, speciesLabel: "H₃O⁺", vUnknown: 10.0, C_sample: 0.125, coeff: 1, type: "fort_fort", Ka: null, indicatorKey: "helianthine", titrantColor: "#eaf4f8", colorStart: "#e53935", colorEnd: "#fbc02d" },
          fer_manganate_color: { name: "Fe²⁺ / MnO₄⁻", reaction: "MnO₄⁻ + 5 Fe²⁺ + 8 H⁺ → Mn²⁺ + 5 Fe³⁺ + 4 H₂O", titrant: "KMnO₄", titrantC: 0.020, speciesLabel: "Fe²⁺", vUnknown: 10.0, C_sample: 0.125, coeff: 5, type: "redox", Ka: null, indicatorKey: "auto_mn", titrantColor: "#7b1fa2", colorStart: "#c8e6c9", colorEnd: "#ce93d8" }
        }
      }
    };
    const INDICATORS = {
      helianthine: { name: "Hélianthine", range: [3.1, 4.4], colorAcid: "#e53935", colorBase: "#fbc02d", acidName: "rouge", baseName: "jaune" },
      auto_mn: { name: "Auto-indicateur MnO₄⁻", range: null, colorAcid: "#c8e6c9", colorBase: "#ce93d8", acidName: "vert pâle", baseName: "violet persistant" }
    };
    
    let currentTitrageType = null, currentTitrageKey = null, currentSystemParams = null;
    let simState = { volume: 0, maxVol: 0, eqVol: 0, robinetOpen: false, intervalId: null, confirmedVE: null };

    function gaussNoise(scale) { let u=0,v=0; while(u===0)u=Math.random(); while(v===0)v=Math.random(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)*scale; }
    function sci(x, digits = 3) { if (x === 0) return "0"; const exp = Math.floor(Math.log10(Math.abs(x))); const mant = x / Math.pow(10, exp); const sup = {'-':'⁻','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'}; const expStr = String(exp).split('').map(c => sup[c] || c).join(''); return `${mant.toFixed(digits).replace('.', ',')}·10${expStr}`; }

    function computePHExact(sys, V) {
      const params = currentSystemParams; const Ca = params.C_sample, Cb = params.titrantC, Va = params.vUnknown/1000, Vb = V/1000, Vtot = Va+Vb, nA = Ca*Va, nB = Cb*Vb, Kw = 1e-14;
      if (sys.type === 'fort_fort') {
        if (nB < nA - 1e-12) { const nH = nA - nB; return -Math.log10(nH / Vtot); }
        else if (nB > nA + 1e-12) { const nOH = nB - nA; return 14 + Math.log10(nOH / Vtot); }
        return 7;
      } else if (sys.type === 'faible_fort') {
        const Ka = sys.Ka;
        if (V < simState.eqVol - 0.01) { const nAH = nA - nB; const nAm = nB; if (nAH <= 1e-12) { const Cb_eq = nAm / Vtot; const Kb = Kw / Ka; return 14 + Math.log10(Math.sqrt(Kb * Cb_eq)); } return -Math.log10(Ka * (nAH / nAm)); }
        else if (V > simState.eqVol + 0.01) { const nOH = nB - nA; return 14 + Math.log10(nOH / Vtot); }
        const Cb_eq = nA / Vtot; return 14 + Math.log10(Math.sqrt((Kw/Ka) * Cb_eq));
      }
      return 7;
    }
    function computeSigmaExact(sys, V) {
      const params = currentSystemParams; const Ca = params.C_sample, Cb = params.titrantC, Va = params.vUnknown/1000, Vb = V/1000, Vtot = Va+Vb, nA = Ca*Va, nB = Cb*Vb;
      const lamH = 349.8e-4, lamOH = 198.6e-4, lamNa = 50.1e-4, lamCl = 76.3e-4, lamAg = 61.9e-4, lamNO3 = 71.4e-4;
      if (sys.type === 'acide_base') {
        let sigma = 0;
        if (nB <= nA) { const nH = nA - nB; const nNa = nB; const nCl = nA; sigma = lamH*(nH/Vtot) + lamCl*(nCl/Vtot) + lamNa*(nNa/Vtot); }
        else { const nOH = nB - nA; const nNa = nB; const nCl = nA; sigma = lamOH*(nOH/Vtot) + lamCl*(nCl/Vtot) + lamNa*(nNa/Vtot); }
        return sigma * 10;
      } else if (sys.type === 'precipitation') {
        let sigma = 0;
        if (nB <= nA) { const nCl = nA - nB; const nNa = nA; const nNO3 = nB; sigma = lamCl*(nCl/Vtot) + lamNa*(nNa/Vtot) + lamNO3*(nNO3/Vtot); }
        else { const nAg = nB - nA; const nNa = nA; const nNO3 = nB; sigma = lamAg*(nAg/Vtot) + lamNa*(nNa/Vtot) + lamNO3*(nNO3/Vtot); }
        return sigma * 10;
      }
      return 0;
    }

    function mixColors(c1, c2, t) { const p = h => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)]; const [r1,g1,b1] = p(c1); const [r2,g2,b2] = p(c2); return `rgb(${Math.round(r1+(r2-r1)*t)},${Math.round(g1+(g2-g1)*t)},${Math.round(b1+(b2-b1)*t)})`; }
    function currentBeakerColor(sys) {
      if (!sys.indicatorKey) return sys.colorStart;
      const ind = INDICATORS[sys.indicatorKey];
      if (!ind.range) return simState.volume >= simState.eqVol - 0.1 ? ind.colorBase : ind.colorAcid;
      const pH = computePHExact(sys, simState.volume); const [p1, p2] = ind.range;
      if (pH < p1) return ind.colorAcid; if (pH > p2) return ind.colorBase;
      return mixColors(ind.colorAcid, ind.colorBase, (pH - p1) / (p2 - p1));
    }
    function currentObservation(sys) {
      if (!sys.indicatorKey) return '';
      const ind = INDICATORS[sys.indicatorKey];
      if (!ind.range) { const isEq = simState.volume >= simState.eqVol - 0.1; return isEq ? `<span style="display:inline-block;width:16px;height:16px;border-radius:50%;background:${ind.colorBase};border:2px solid #11998e;vertical-align:middle;margin-right:8px;"></span><strong>Virage persistant</strong> (${ind.baseName})` : `<span style="display:inline-block;width:16px;height:16px;border-radius:50%;background:${ind.colorAcid};border:1px solid #999;vertical-align:middle;margin-right:8px;"></span>Couleur initiale : ${ind.acidName}`; }
      const pH = computePHExact(sys, simState.volume); const [p1, p2] = ind.range;
      if (pH < p1) return `<span style="display:inline-block;width:16px;height:16px;border-radius:50%;background:${ind.colorAcid};border:1px solid #999;vertical-align:middle;margin-right:8px;"></span>${ind.acidName} (pH = ${pH.toFixed(2)})`;
      if (pH > p2) return `<span style="display:inline-block;width:16px;height:16px;border-radius:50%;background:${ind.colorBase};border:1px solid #999;vertical-align:middle;margin-right:8px;"></span>${ind.baseName} (pH = ${pH.toFixed(2)}) → virage`;
      return `<span style="display:inline-block;width:16px;height:16px;border-radius:50%;background:${mixColors(ind.colorAcid, ind.colorBase, (pH-p1)/(p2-p1))};border:2px solid #11998e;vertical-align:middle;margin-right:8px;"></span>Zone de virage (pH = ${pH.toFixed(2)})`;
    }

    function drawTitrageCurve() {
      const canvas = document.getElementById('titrage-canvas'); if (!canvas) return;
      const type = TITRAGE_TYPES[currentTitrageType]; const sys = type.systems[currentTitrageKey]; const isPH = currentTitrageType === 'phmetrique';
      const ctx = canvas.getContext('2d'); const W = canvas.width = 800, H = canvas.height = 420, padL = 75, padR = 30, padT = 30, padB = 60, plotW = W-padL-padR, plotH = H-padT-padB;
      ctx.clearRect(0,0,W,H); ctx.fillStyle = '#fff'; ctx.fillRect(0,0,W,H);
      const xMax = simState.maxVol, yMin = isPH ? 0 : 0, yMax = isPH ? 14 : 10;
      const xToPx = x => padL + (x/xMax) * plotW, yToPx = y => H - padB - ((y-yMin)/(yMax-yMin)) * plotH;
      ctx.strokeStyle = '#e8eef5'; ctx.lineWidth = 1;
      for (let i=0; i<=7; i++) { const yv = yMin + i*(yMax-yMin)/7; ctx.beginPath(); ctx.moveTo(padL, yToPx(yv)); ctx.lineTo(W-padR, yToPx(yv)); ctx.stroke(); ctx.fillStyle = '#444'; ctx.font = '11px Segoe UI'; ctx.textAlign = 'right'; ctx.fillText(yv.toFixed(isPH ? 0 : 1), padL-8, yToPx(yv)+4); }
      for (let i=0; i<=6; i++) { const xv = i * xMax / 6; ctx.beginPath(); ctx.moveTo(xToPx(xv), padT); ctx.lineTo(xToPx(xv), H-padB); ctx.stroke(); ctx.fillStyle = '#444'; ctx.textAlign = 'center'; ctx.fillText(xv.toFixed(0), xToPx(xv), H-padB+18); }
      ctx.strokeStyle = '#333'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, H-padB); ctx.stroke(); ctx.beginPath(); ctx.moveTo(padL, H-padB); ctx.lineTo(W-padR, H-padB); ctx.stroke();
      ctx.fillStyle = '#0f2027'; ctx.font = 'bold 13px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText('Volume de titrant versé (mL)', padL+plotW/2, H-18);
      ctx.save(); ctx.translate(18, padT+plotH/2); ctx.rotate(-Math.PI/2); ctx.fillText(isPH ? 'pH' : 'σ (mS/cm)', 0, 0); ctx.restore();
      if (simState.confirmedVE !== null) {
        ctx.strokeStyle = '#bbb'; ctx.lineWidth = 1.5; ctx.setLineDash([4,4]); ctx.beginPath();
        for (let V = 0; V <= xMax; V += xMax/200) { const val = isPH ? computePHExact(sys, V) : computeSigmaExact(sys, V); if (V === 0) ctx.moveTo(xToPx(V), yToPx(val)); else ctx.lineTo(xToPx(V), yToPx(val)); }
        ctx.stroke(); ctx.setLineDash([]);
      }
      ctx.strokeStyle = '#e63946'; ctx.lineWidth = 2.5; ctx.beginPath(); let first = true;
      for (let V = 0; V <= simState.volume + 0.001; V += 0.1) {
        const vv = Math.min(V, simState.volume); const val = isPH ? computePHExact(sys, vv) : computeSigmaExact(sys, vv);
        if (first) { ctx.moveTo(xToPx(vv), yToPx(val)); first = false; } else ctx.lineTo(xToPx(vv), yToPx(val));
        if (vv >= simState.volume) break;
      }
      ctx.stroke();
      if (simState.confirmedVE !== null) {
        ctx.setLineDash([6,5]); ctx.strokeStyle = '#11998e'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xToPx(simState.eqVol), padT); ctx.lineTo(xToPx(simState.eqVol), H-padB); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = '#0d7a6f'; ctx.font = 'bold 12px Segoe UI'; ctx.textAlign = 'left'; ctx.fillText(`V_E = ${simState.eqVol.toFixed(1)} mL`, xToPx(simState.eqVol)+6, padT+18);
      }
      if (simState.volume > 0) { const valNow = isPH ? computePHExact(sys, simState.volume) : computeSigmaExact(sys, simState.volume); ctx.fillStyle = '#e63946'; ctx.beginPath(); ctx.arc(xToPx(simState.volume), yToPx(valNow), 6, 0, 2*Math.PI); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); }
    }

    function showTitrageResult() {
      if (simState.confirmedVE === null) return;
      const type = TITRAGE_TYPES[currentTitrageType]; const sys = type.systems[currentTitrageKey]; const VE = simState.confirmedVE; const params = currentSystemParams; const coeff = sys.coeff;
      const Cunknown = coeff * params.titrantC * (VE/1000) / (params.vUnknown/1000); const ecart = Math.abs(Cunknown - params.C_sample) / params.C_sample * 100;
      const div = document.getElementById('sim-result'); if (!div) return;
      const sp = sys.speciesLabel; const tit = sys.titrant; const ctitStr = sci(params.titrantC, 2); const veStr = VE.toFixed(1); const vsampleStr = params.vUnknown.toFixed(1); const cunkStr = sci(Cunknown, 3);
      div.innerHTML = `
        <div style="background:#f8fafc;border:2px solid #2c5364;border-radius:12px;padding:20px;margin-top:18px;">
          <h3 style="color:#0f2027;margin:0 0 16px 0;font-size:1.15rem;border-bottom:2px solid #2c5364;padding-bottom:10px;">🧮 Démarche détaillée</h3>
          <div style="display:flex;gap:14px;margin-bottom:16px;"><div style="flex-shrink:0;width:32px;height:32px;border-radius:50%;background:#2c5364;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;">1</div><div><div style="font-weight:700;color:#0f2027;margin-bottom:6px;">Équation de la réaction</div><div style="font-family:'Cambria Math',serif;font-style:italic;background:#eef4f8;border-left:3px solid #2c5364;padding:8px 14px;border-radius:4px;color:#0f2027;">${sys.reaction}</div></div></div>
          <div style="display:flex;gap:14px;margin-bottom:16px;"><div style="flex-shrink:0;width:32px;height:32px;border-radius:50%;background:#2c5364;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;">2</div><div><div style="font-weight:700;color:#0f2027;margin-bottom:6px;">Relation à l'équivalence</div><div style="font-family:'Cambria Math',serif;font-style:italic;background:#eef4f8;border-left:3px solid #2c5364;padding:8px 14px;border-radius:4px;color:#0f2027;">n(${sp}) = ${coeff === 1 ? '' : coeff + ' × '}n(${tit})</div></div></div>
          <div style="display:flex;gap:14px;margin-bottom:16px;"><div style="flex-shrink:0;width:32px;height:32px;border-radius:50%;background:#2c5364;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;">3</div><div><div style="font-weight:700;color:#0f2027;margin-bottom:6px;">Quantités de matière</div><div style="font-family:'Cambria Math',serif;font-style:italic;background:#eef4f8;border-left:3px solid #2c5364;padding:8px 14px;border-radius:4px;color:#0f2027;">C<sub>inconnue</sub> × V<sub>inconnue</sub> = ${coeff === 1 ? '' : coeff + ' × '}C<sub>titrant</sub> × V<sub>E</sub></div></div></div>
          <div style="display:flex;gap:14px;margin-bottom:16px;"><div style="flex-shrink:0;width:32px;height:32px;border-radius:50%;background:#2c5364;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;">4</div><div><div style="font-weight:700;color:#0f2027;margin-bottom:6px;">Expression littérale</div><div style="font-family:'Cambria Math',serif;font-style:italic;background:#eef4f8;border-left:3px solid #2c5364;padding:8px 14px;border-radius:4px;color:#0f2027;">C<sub>inconnue</sub> = (${coeff === 1 ? '' : coeff + ' × '}C<sub>titrant</sub> × V<sub>E</sub>) / V<sub>inconnue</sub></div></div></div>
          <div style="display:flex;gap:14px;margin-bottom:16px;"><div style="flex-shrink:0;width:32px;height:32px;border-radius:50%;background:#2c5364;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;">5</div><div><div style="font-weight:700;color:#0f2027;margin-bottom:6px;">Application numérique</div><div style="font-family:'Courier New',monospace;font-size:0.95rem;background:#fff8e1;border-left:3px solid #e67e22;padding:8px 14px;border-radius:4px;color:#333;">C = (${coeff === 1 ? '' : coeff + ' × '}${ctitStr} × ${veStr}×10⁻³) / (${vsampleStr}×10⁻³) = <strong>${cunkStr} mol/L</strong></div></div></div>
          <div style="background:linear-gradient(90deg,#d4f5e9,#b8ecdd);border:2px solid #11998e;border-radius:10px;padding:16px 20px;margin-top:16px;text-align:center;">
            <div style="font-size:0.9rem;color:#0d7a6f;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Résultat</div>
            <div style="font-size:1.6rem;font-weight:700;color:#0d7a6f;margin:6px 0;">C<sub>inconnue</sub> = ${cunkStr} mol/L</div>
            <div style="font-size:0.85rem;color:#555;margin-top:6px;">Soit ${(Cunknown*1000).toFixed(1)} mmol/L</div>
          </div>
        </div>`;
    }

    function updateSimUI() {
      if (!currentTitrageType) return;
      const type = TITRAGE_TYPES[currentTitrageType]; const sys = type.systems[currentTitrageKey]; const isPH = currentTitrageType === 'phmetrique'; const isCondMetric = currentTitrageType === 'conductometrique'; const isColor = currentTitrageType === 'colorimetrique';
      const buretteLiq = document.getElementById('burette-liquid');
      if (buretteLiq) { const newHeight = Math.max(0, 235 * (1 - simState.volume / simState.maxVol)); buretteLiq.setAttribute('height', newHeight); buretteLiq.setAttribute('y', 92 + (235 - newHeight)); }
      const beakerLiq = document.getElementById('beaker-liquid-svg');
      if (beakerLiq) { const frac = Math.min(0.85, simState.volume / simState.maxVol * 0.6 + 0.15); const topY = 440 - frac * 50; beakerLiq.setAttribute('d', `M 137 ${topY} L 137 433 Q 137 440 144 440 L 214 440 Q 221 440 221 433 L 221 ${topY} Z`); if (isColor) { beakerLiq.setAttribute('fill', currentBeakerColor(sys)); beakerLiq.setAttribute('opacity', '0.85'); } }
      const volDisp = document.getElementById('vol-display'); if (volDisp) volDisp.textContent = simState.volume.toFixed(1) + ' mL';
      const slider = document.getElementById('vol-slider'); if (slider) slider.value = simState.volume;
      if (isPH || isCondMetric) { const sensor = document.getElementById('live-sensor-value'); const probeText = document.getElementById('probe-value-text'); const val = isPH ? computePHExact(sys, simState.volume) : computeSigmaExact(sys, simState.volume); const display = isPH ? val.toFixed(2) : val.toFixed(3); if (sensor) sensor.textContent = display; if (probeText) probeText.textContent = display; }
      const div = document.getElementById('sim-measures'); if (!div) return;
      if (isPH || isCondMetric) {
        const step = 0.5; const nPoints = Math.floor(simState.volume / step); const points = [];
        for (let i = 0; i <= nPoints; i++) { const V = Math.min(i * step, simState.volume); const val = isPH ? computePHExact(sys, V) : computeSigmaExact(sys, V); points.push({ V, val }); }
        let thtml = `<h3>📋 Mesures</h3><table><tr><th>V (mL)</th><th>${isPH ? 'pH' : 'σ (mS/cm)'}</th></tr>`;
        points.slice(-15).forEach(p => { thtml += `<tr><td>${p.V.toFixed(1)}</td><td>${isPH ? p.val.toFixed(2) : p.val.toFixed(3)}</td></tr>`; });
        thtml += `</table>`; div.innerHTML = thtml;
      } else { div.innerHTML = `<h3>🎨 Observation</h3><div class="info-box" style="font-size:1.05rem;">${currentObservation(sys)}</div>`; }
      if ((isPH || isCondMetric) && document.getElementById('titrage-canvas')) drawTitrageCurve();
    }

    function toggleRobinet() {
      simState.robinetOpen = !simState.robinetOpen;
      const btn = document.getElementById('robinet-btn'); const label = document.getElementById('robinet-label'); const handle = document.getElementById('robinet-handle');
      if (simState.robinetOpen) { btn.classList.add('open'); label.textContent = 'ROBINET OUVERT'; if (handle) handle.setAttribute('transform', 'rotate(-90 179 338)'); startFlow(); }
      else { btn.classList.remove('open'); label.textContent = 'ROBINET FERMÉ'; if (handle) handle.setAttribute('transform', 'rotate(0 179 338)'); stopFlow(); }
    }
    function startFlow() {
      if (simState.intervalId) return;
      simState.intervalId = setInterval(() => {
        if (simState.volume >= simState.maxVol) { stopFlow(); closeRobinetVisual(); return; }
        const dist = Math.abs(simState.volume - simState.eqVol); const step = dist < 0.5 ? 0.02 : dist < 2 ? 0.05 : 0.15;
        simState.volume = Math.min(simState.maxVol, simState.volume + step);
        const drop = document.getElementById('drop-svg');
        if (drop) { drop.setAttribute('rx', '3'); drop.setAttribute('ry', '4'); drop.setAttribute('opacity', '1'); let y = 375; const anim = setInterval(() => { y += 5; drop.setAttribute('cy', y); if (y >= 425) { clearInterval(anim); drop.setAttribute('rx', '0'); drop.setAttribute('ry', '0'); drop.setAttribute('opacity', '0'); drop.setAttribute('cy', '375'); } }, 25); }
        updateSimUI();
      }, 120);
    }
    function stopFlow() { if (simState.intervalId) { clearInterval(simState.intervalId); simState.intervalId = null; } }
    function closeRobinetVisual() { simState.robinetOpen = false; const btn = document.getElementById('robinet-btn'); const label = document.getElementById('robinet-label'); const handle = document.getElementById('robinet-handle'); if (btn) btn.classList.remove('open'); if (label) label.textContent = 'ROBINET FERMÉ'; if (handle) handle.setAttribute('transform', 'rotate(0 179 338)'); }
    function onSliderChange(val) { simState.volume = parseFloat(val); updateSimUI(); }
    
    function confirmVE() {
      const v = parseFloat(document.getElementById('input-ve').value);
      if (isNaN(v) || v <= 0) { alert('Veuillez saisir un volume valide.'); return; }
      simState.confirmedVE = v;
      renderVEZone();
      if (document.getElementById('titrage-canvas')) drawTitrageCurve();
      showTitrageResult();
    }
    function renderVEZone() {
      const zone = document.getElementById('ve-zone'); if (!zone) return;
      if (simState.confirmedVE !== null) { zone.innerHTML = `<div style="background:#d4f5e9;border-left:4px solid #11998e;padding:12px 16px;border-radius:6px;margin:15px 0;font-size:0.9rem;">✅ V_E confirmé : <strong>${simState.confirmedVE.toFixed(1)} mL</strong></div>`; return; }
      zone.innerHTML = `<div class="info-box"><p>📝 Saisissez votre volume équivalent V<sub>E</sub> lu graphiquement :</p><div class="input-group"><label>V<sub>E</sub> =</label><input type="number" id="input-ve" step="0.1" min="0" placeholder="ex : 12.5"><span class="unit">mL</span><button class="btn success" onclick="window.LABOPC_ACTIVE.confirmVE()">Valider V<sub>E</sub></button></div><p class="small">La courbe théorique et la ligne V_E restent masquées jusqu'à votre validation.</p></div>`;
    }
    function resetSim() {
      if (simState.intervalId) { clearInterval(simState.intervalId); simState.intervalId = null; }
      simState.volume = 0; simState.robinetOpen = false; simState.confirmedVE = null;
      closeRobinetVisual(); const div = document.getElementById('sim-result'); if (div) div.innerHTML = '';
      renderVEZone(); updateSimUI();
    }

    function startTitrageSimulation(typeKey, sysKey) {
      currentTitrageType = typeKey; currentTitrageKey = sysKey;
      const type = TITRAGE_TYPES[typeKey]; const sys = type.systems[sysKey]; const params = currentSystemParams;
      if (simState.intervalId) { clearInterval(simState.intervalId); }
      const Veq = (params.C_sample * params.vUnknown) / (sys.coeff * params.titrantC);
      simState = { volume: 0, maxVol: Veq * 2.2, eqVol: Veq, robinetOpen: false, intervalId: null, confirmedVE: null };
      
      const isColor = typeKey === 'colorimetrique'; const isPH = typeKey === 'phmetrique'; const isCondMetric = typeKey === 'conductometrique';
      const titrantGradTop = hexToRgba(sys.titrantColor, 0.75); const titrantGradBot = hexToRgba(sys.titrantColor, 0.95);
      
      container.innerHTML = `
        <div class="info-box"><strong>Solution titrante :</strong> ${sys.titrant} à C = ${sci(params.titrantC, 2)} mol/L <span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${sys.titrantColor};border:1px solid #888;vertical-align:middle;margin-left:6px;"></span><br><strong>Prélèvement :</strong> V = ${params.vUnknown} mL de ${sys.speciesLabel}</div>
        <h3>🧪 Montage de titrage</h3>
        <div class="sim-layout">
          <div class="montage-frame">
            <svg class="montage-svg" viewBox="0 0 360 480" width="360" height="480" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="metalGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#8a9aa8"/><stop offset="30%" stop-color="#d4dde5"/><stop offset="60%" stop-color="#a8b8c5"/><stop offset="100%" stop-color="#6a7a88"/></linearGradient>
                <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#dce8f0" stop-opacity="0.85"/><stop offset="40%" stop-color="#ffffff" stop-opacity="0.5"/><stop offset="60%" stop-color="#eef4f8" stop-opacity="0.7"/><stop offset="100%" stop-color="#b8c8d4" stop-opacity="0.85"/></linearGradient>
                <linearGradient id="beakerGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#dce8f0" stop-opacity="0.6"/><stop offset="50%" stop-color="#ffffff" stop-opacity="0.3"/><stop offset="100%" stop-color="#b8c8d4" stop-opacity="0.6"/></linearGradient>
                <linearGradient id="titrantGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${titrantGradTop}"/><stop offset="100%" stop-color="${titrantGradBot}"/></linearGradient>
                <linearGradient id="robinetGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b0bec5"/><stop offset="100%" stop-color="#546e7a"/></linearGradient>
                <linearGradient id="stirrerGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#455a64"/><stop offset="100%" stop-color="#263238"/></linearGradient>
              </defs>
              <rect x="20" y="440" width="320" height="10" fill="#b0bec5" rx="2"/><line x1="20" y1="445" x2="340" y2="445" stroke="#90a4ae" stroke-width="0.5"/>
              <rect x="30" y="420" width="120" height="22" fill="url(#metalGrad)" rx="4" stroke="#4a5a68" stroke-width="1"/><rect x="35" y="415" width="110" height="8" fill="#6a7a88" rx="2"/><rect x="72" y="70" width="14" height="355" fill="url(#metalGrad)" stroke="#4a5a68" stroke-width="1" rx="2"/><circle cx="79" cy="68" r="5" fill="#8a9aa8" stroke="#4a5a68" stroke-width="1"/>
              <g><rect x="85" y="135" width="75" height="10" fill="url(#metalGrad)" stroke="#3a4a58" stroke-width="1" rx="2"/><path d="M 155 125 Q 175 125 175 140 Q 175 155 155 155 L 155 125 Z" fill="#7a8a98" stroke="#3a4a58" stroke-width="1.5"/><circle cx="79" cy="140" r="7" fill="#5a6a78" stroke="#2a3a48" stroke-width="1"/><circle cx="79" cy="140" r="3" fill="#9aaab8"/></g>
              <rect x="170" y="90" width="18" height="240" fill="url(#glassGrad)" stroke="#7a8fa3" stroke-width="1.2" rx="3"/><rect id="burette-liquid" x="171.5" y="92" width="15" height="235" fill="url(#titrantGrad)" opacity="0.95"/><rect x="176" y="92" width="3" height="235" fill="#ffffff" opacity="0.35"/>
              <g stroke="#5a6a78" stroke-width="0.7"><line x1="170" y1="110" x2="178" y2="110"/><line x1="170" y1="140" x2="178" y2="140"/><line x1="170" y1="170" x2="178" y2="170"/><line x1="170" y1="200" x2="178" y2="200"/><line x1="170" y1="230" x2="178" y2="230"/><line x1="170" y1="260" x2="178" y2="260"/><line x1="170" y1="290" x2="178" y2="290"/><line x1="170" y1="320" x2="178" y2="320"/></g>
              <g id="robinet-svg" style="cursor:pointer;" onclick="window.LABOPC_ACTIVE.toggleRobinet()"><rect x="163" y="328" width="32" height="20" fill="url(#robinetGrad)" stroke="#37474f" stroke-width="1.2" rx="3"/><g id="robinet-handle" transform="rotate(0 179 338)"><rect x="170" y="330" width="18" height="16" fill="#90a4ae" stroke="#37474f" stroke-width="1" rx="2"/><circle cx="179" cy="338" r="3" fill="#546e7a"/></g><path d="M 171 348 L 187 348 L 182 368 L 176 368 Z" fill="url(#glassGrad)" stroke="#7a8fa3" stroke-width="1"/></g>
              <ellipse id="drop-svg" cx="179" cy="375" rx="0" ry="0" fill="${sys.titrantColor}" opacity="0"/>
              <path d="M 135 385 L 135 435 Q 135 442 142 442 L 216 442 Q 223 442 223 435 L 223 385" fill="url(#beakerGrad)" stroke="#7a8fa3" stroke-width="1.5"/><path d="M 135 385 L 128 380 L 133 395 Z" fill="url(#beakerGrad)" stroke="#7a8fa3" stroke-width="1"/>
              <path id="beaker-liquid-svg" d="M 137 425 L 137 433 Q 137 440 144 440 L 214 440 Q 221 440 221 433 L 221 425 Z" fill="${isColor ? sys.colorStart : '#c8e6c9'}"/>
              <line x1="142" y1="390" x2="142" y2="435" stroke="#ffffff" stroke-width="1.5" opacity="0.5"/><ellipse cx="179" cy="436" rx="14" ry="3" fill="#ffffff" opacity="0.9" stroke="#ccc" stroke-width="0.5"/>
              <rect x="120" y="446" width="120" height="18" fill="url(#stirrerGrad)" rx="3" stroke="#1a2a32" stroke-width="1"/><circle cx="228" cy="455" r="3" fill="#6ee7b7"><animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/></circle><circle cx="132" cy="455" r="4" fill="#546e7a" stroke="#1a2a32" stroke-width="0.8"/>
              <g id="probe-label" style="display:${(isPH || isCondMetric) ? 'block' : 'none'};"><rect x="240" y="380" width="90" height="45" fill="#0a1a12" stroke="#1a4a3a" stroke-width="1.5" rx="4"/><text x="285" y="398" text-anchor="middle" fill="#6ee7b7" font-family="Courier New, monospace" font-size="11" id="probe-value-text">—</text><text x="285" y="415" text-anchor="middle" fill="#6ee7b7" font-family="Courier New, monospace" font-size="9" opacity="0.7" id="probe-unit-text">${isPH ? 'pH' : 'σ (mS/cm)'}</text></g>
              <g id="probe-svg" style="display:${(isPH || isCondMetric) ? 'block' : 'none'};"><path d="M 260 380 Q 260 360 250 350 L 220 350" stroke="#37474f" stroke-width="2" fill="none"/><rect x="255" y="378" width="10" height="55" fill="#546e7a" rx="2" stroke="#263238" stroke-width="1"/><circle cx="260" cy="433" r="5" fill="#90a4ae" stroke="#37474f" stroke-width="1"/></g>
            </svg>
          </div>
          <div class="controls-panel">
            <button class="robinet-btn" id="robinet-btn" onclick="window.LABOPC_ACTIVE.toggleRobinet()"><span class="led"></span><span id="robinet-label">ROBINET FERMÉ</span></button>
            <div class="vol-control"><div class="live-readout"><div class="lbl">VOLUME VERSÉ</div><div id="vol-display">0,0 mL</div></div><input type="range" id="vol-slider" min="0" max="${simState.maxVol}" step="0.1" value="0" oninput="window.LABOPC_ACTIVE.onSliderChange(this.value)" style="width:100%;margin-top:10px;"></div>
            ${(isPH || isCondMetric) ? `<div class="live-readout" style="margin-top:8px;"><div class="lbl">${isPH ? 'pH MESURÉ' : 'CONDUCTIVITÉ σ'}</div><div id="live-sensor-value">—</div></div>` : ''}
            <button class="btn danger" onclick="window.LABOPC_ACTIVE.resetSim()" style="margin-top:6px;">↺ Réinitialiser</button>
          </div>
        </div>
        <div id="sim-measures"></div>
        ${(isPH || isCondMetric) ? `<h3>📈 ${isPH ? 'Courbe pH = f(V)' : 'Courbe σ = f(V)'}</h3><canvas id="titrage-canvas" width="800" height="420"></canvas>` : `<div class="info-box" style="margin-top:16px;"><strong>🎨 Titrage colorimétrique :</strong> Cliquez sur le robinet pour verser goutte à goutte.</div>`}
        <div id="ve-zone" style="margin-top:18px;"></div>
        <div id="sim-result" style="margin-top:18px;"></div>
      `;
      
      window.LABOPC_ACTIVE = { toggleRobinet, onSliderChange, resetSim, confirmVE };
      updateSimUI(); renderVEZone();
      if (isPH || isCondMetric) setTimeout(() => drawTitrageCurve(), 50);
    }

    function hexToRgba(hex, alpha) { const r = parseInt(hex.slice(1,3), 16); const g = parseInt(hex.slice(3,5), 16); const b = parseInt(hex.slice(5,7), 16); return `rgba(${r}, ${g}, ${b}, ${alpha})`; }

    function showSetup(typeKey, sysKey) {
      currentTitrageType = typeKey; currentTitrageKey = sysKey;
      const type = TITRAGE_TYPES[typeKey]; const sys = type.systems[sysKey];
      container.innerHTML = `
        <div class="back-bar"><button class="btn secondary" onclick="window.LABOPC_ACTIVE.renderMenu()">← Retour</button></div>
        <div class="info-box"><strong>Réaction :</strong> ${sys.reaction}</div>
        <h3>⚙️ Paramètres des concentrations</h3>
        <div class="input-group"><label>Concentration du titrant (mol/L) :</label><input type="number" id="input-titrantC" step="0.001" min="0.001" value="${sys.titrantC}"></div>
        <div class="input-group"><label>Concentration de la solution à doser (mol/L) :</label><input type="number" id="input-sampleC" step="0.001" min="0.001" value="${sys.C_sample}"></div>
        <div class="input-group"><label>Volume prélevé (mL) :</label><input type="number" id="input-sampleV" step="0.1" min="1" value="${sys.vUnknown}"></div>
        <div class="center" style="margin-top:16px;"><button class="btn success" onclick="window.LABOPC_ACTIVE.launchTitrage()">▶ Démarrer le titrage</button></div>
      `;
      window.LABOPC_ACTIVE = { 
        renderMenu: () => renderMenu(),
        launchTitrage: () => {
          const titrantC = parseFloat(document.getElementById('input-titrantC').value);
          const sampleC = parseFloat(document.getElementById('input-sampleC').value);
          const sampleV = parseFloat(document.getElementById('input-sampleV').value);
          if (isNaN(titrantC) || titrantC <= 0 || isNaN(sampleC) || sampleC <= 0 || isNaN(sampleV) || sampleV <= 0) { alert('Vérifiez les concentrations (valeurs positives).'); return; }
          currentSystemParams = { titrantC, C_sample: sampleC, vUnknown: sampleV };
          startTitrageSimulation(typeKey, sysKey);
        }
      };
    }

    function renderMenu() {
      container.innerHTML = `<div class="info-box">Choisissez un type de titrage.</div><div class="choices" id="tit-type-list"></div>`;
      const list = document.getElementById('tit-type-list');
      const icons = { phmetrique: '📈', conductometrique: '⚡', colorimetrique: '🎨' };
      Object.keys(TITRAGE_TYPES).forEach(key => {
        const c = document.createElement('div'); c.className = 'card';
        c.innerHTML = `<div class="icon">${icons[key]}</div><div class="title">${TITRAGE_TYPES[key].label}</div>`;
        c.onclick = () => {
          container.innerHTML = `<div class="back-bar"><button class="btn secondary" onclick="window.LABOPC_ACTIVE.renderMenu()">← Retour</button></div><h2>${TITRAGE_TYPES[key].label}</h2><div class="choices" id="tit-sys-list"></div>`;
          const sl = document.getElementById('tit-sys-list');
          Object.keys(TITRAGE_TYPES[key].systems).forEach(sysKey => {
            const sys = TITRAGE_TYPES[key].systems[sysKey];
            const card = document.createElement('div'); card.className = 'card';
            card.innerHTML = `<div class="title">${sys.name}</div><div class="desc">${sys.reaction}</div>`;
            card.onclick = () => showSetup(key, sysKey); sl.appendChild(card);
          });
        };
        list.appendChild(c);
      });
      window.LABOPC_ACTIVE = { renderMenu };
    }

    renderMenu();
    return function cleanup() { delete window.LABOPC_ACTIVE; };
  }
});

// --- 4. DISSOLUTION ---
window.registerActivity({
  id: 'dissolution', level: 'premiere', domain: 'matiere', icon: '⚖️',
  render: function(container, lang) {
    container.innerHTML = `
      <div class="info-box">Objectif : préparer 100 mL d'une solution de sulfate de cuivre à 0,100 mol·L⁻¹. Choisissez la forme chimique réellement pesée.</div>
      <div class="input-group"><label for="diss-form">Solide utilisé :</label>
        <select id="diss-form" onchange="window.LABOPC_ACTIVE.updateDissForm()">
          <option value="159.6">Sulfate de cuivre anhydre CuSO₄ (M = 159,6 g·mol⁻¹)</option>
          <option value="249.7">Sulfate de cuivre pentahydraté CuSO₄·5H₂O (M = 249,7 g·mol⁻¹)</option>
        </select></div>
      <div class="input-group"><label for="diss-mass">Masse à peser (g) :</label> <input type="number" id="diss-mass" value="1.60" min="0" step="0.01"></div>
      <button class="btn success" onclick="window.LABOPC_ACTIVE.calcDiss()">Calculer la concentration</button>
      <div id="diss-result" style="margin-top:15px;"></div>
    `;
    window.LABOPC_ACTIVE = {
      updateDissForm: () => {
        const M = parseFloat(document.getElementById('diss-form').value);
        document.getElementById('diss-mass').value = (M * 0.100 * 0.100).toFixed(2);
        document.getElementById('diss-result').innerHTML = '';
      },
      calcDiss: () => {
        const m = parseFloat(document.getElementById('diss-mass').value);
        const M = parseFloat(document.getElementById('diss-form').value);
        const V = 0.100, Ctarget = 0.100;
        if (!Number.isFinite(m) || m <= 0) {
          document.getElementById('diss-result').innerHTML = '<div class="warning-box">Saisissez une masse positive et valide.</div>';
          return;
        }
        const n = m / M, C = n / V, mTarget = M * Ctarget * V;
        document.getElementById('diss-result').innerHTML = `
          <div class="result-box">
            <p><strong>Calcul de la concentration :</strong></p>
            <p>n = m / M = ${m.toFixed(2)} / ${M.toFixed(1)} = ${n.toFixed(4)} mol</p>
            <p>C = n / V = ${n.toFixed(4)} / 0,100 = <strong>${C.toFixed(4)} mol·L⁻¹</strong></p>
            <p>Masse nécessaire pour C = 0,100 mol·L⁻¹ : <strong>${mTarget.toFixed(3)} g</strong></p>
            <p>${Math.abs(C - Ctarget) < 0.001 ? '✅ Concentration correcte !' : '⚠️ La masse ne permet pas d’obtenir la concentration cible.'}</p>
          </div>`;
      }
    };
    return function cleanup() { delete window.LABOPC_ACTIVE; };
  }
});

// --- 5. NOMENCLATURE ---
window.registerActivity({
  id: 'nomenclature', level: 'premiere', domain: 'matiere', icon: '📝',
  render: function(container, lang) {
    container.innerHTML = `
      <div class="info-box">Quel est le nom de la molécule CH₃-CH₂-CH₂-OH ?</div>
      <div class="choices" style="grid-template-columns:1fr 1fr;">
        <div class="card" onclick="window.LABOPC_ACTIVE.checkNom('propan-1-ol')"><div class="title">Propan-1-ol</div></div>
        <div class="card" onclick="window.LABOPC_ACTIVE.checkNom('butan-1-ol')"><div class="title">Butan-1-ol</div></div>
        <div class="card" onclick="window.LABOPC_ACTIVE.checkNom('propan-2-ol')"><div class="title">Propan-2-ol</div></div>
        <div class="card" onclick="window.LABOPC_ACTIVE.checkNom('ethanol')"><div class="title">Éthanol</div></div>
      </div>
      <div id="nom-result" style="margin-top:15px;"></div>
    `;
    window.LABOPC_ACTIVE = {
      checkNom: (ans) => {
        const res = document.getElementById('nom-result');
        if(ans === 'propan-1-ol') res.innerHTML = '<div class="result-box" style="background:#d4f5e9;">✅ Bonne réponse ! La chaîne a 3 carbones (propane) et le groupe -OH est sur le carbone 1.</div>';
        else res.innerHTML = '<div class="warning-box">❌ Incorrect. Comptez les carbones et repérez la position du groupe -OH.</div>';
      }
    };
    return function cleanup() { delete window.LABOPC_ACTIVE; };
  }
});

// --- 6. SYNTHÈSE ---
window.registerActivity({
  id: 'synthese', level: 'premiere', domain: 'matiere', icon: '🔬',
  render: function(container, lang) {
    container.innerHTML = `
      <div class="info-box">Estérification : acide éthanoïque + éthanol (en excès) ⇌ éthanoate d'éthyle + eau. On suppose l'acide éthanoïque limitant (6,0 g) et un rapport stœchiométrique 1:1.</div>
      <div class="input-group"><label for="synth-mass">Masse d'ester obtenue (g) :</label> <input type="number" id="synth-mass" value="4.0" min="0" step="0.1"></div>
      <button class="btn success" onclick="window.LABOPC_ACTIVE.calcSynth()">Calculer le rendement</button>
      <div id="synth-result" style="margin-top:15px;"></div>
    `;
    window.LABOPC_ACTIVE = {
      calcSynth: () => {
        const m = parseFloat(document.getElementById('synth-mass').value);
        if (!Number.isFinite(m) || m < 0) {
          document.getElementById('synth-result').innerHTML = '<div class="warning-box">Saisissez une masse positive et valide.</div>';
          return;
        }
        const nAcide = 6.0 / 60.05;
        const mTheorique = nAcide * 88.11;
        const rendement = m / mTheorique * 100;
        document.getElementById('synth-result').innerHTML = `
          <div class="result-box">
            <p>n(acide éthanoïque) = 6,0 / 60,05 = ${nAcide.toFixed(4)} mol</p>
            <p>Avec un rapport stœchiométrique 1:1, n(ester) théorique = ${nAcide.toFixed(4)} mol.</p>
            <p>m(ester) théorique = ${mTheorique.toFixed(2)} g</p>
            <p class="big">Rendement expérimental = ${rendement.toFixed(1)} %</p>
            <p>${rendement <= 100 ? 'Rendement calculé à partir de la masse expérimentale.' : '⚠️ Rendement supérieur à 100 % : vérifier le séchage, la pureté et les mesures.'}</p>
          </div>`;
      }
    };
    return function cleanup() { delete window.LABOPC_ACTIVE; };
  }
});

// --- 7. BOYLE ---
window.registerActivity({
  id: 'boyle', level: 'premiere', domain: 'matiere', icon: '💨',
  render: function(container, lang) {
    container.innerHTML = `
      <div class="info-box">Loi de Boyle-Mariotte. P × V = constante. P_ATM = 1013 hPa, V_INITIAL = 20 mL.</div>
      <div class="live-readout"><div class="lbl">PRESSION P (hPa)</div><div id="boyle-pressure">1013</div></div>
      <div class="live-readout" style="margin-top:8px;"><div class="lbl">VOLUME V (mL)</div><div id="boyle-volume">20.0</div></div>
      <div class="input-group"><label>Volume (mL) :</label> <input type="range" id="boyle-slider" min="10" max="40" value="20" step="1" oninput="window.LABOPC_ACTIVE.calcBoyle(this.value)" style="width:100%;"></div>
      <div id="boyle-result" class="result-box" style="display:none;"><p><strong>Produit P × V :</strong></p><p class="big" id="boyle-pv">—</p></div>
    `;
    window.LABOPC_ACTIVE = {
      calcBoyle: (val) => {
        const V = parseFloat(val); const P = (1013 * 20) / V;
        document.getElementById('boyle-volume').textContent = V.toFixed(1);
        document.getElementById('boyle-pressure').textContent = P.toFixed(0);
        document.getElementById('boyle-result').style.display = 'block';
        document.getElementById('boyle-pv').textContent = (P * V).toFixed(0) + ' hPa·mL';
      }
    };
    return function cleanup() { delete window.LABOPC_ACTIVE; };
  }
});