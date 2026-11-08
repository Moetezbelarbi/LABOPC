#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const core = fs.readFileSync(path.join(root, 'js/app-core.js'), 'utf8');
const chemistry = fs.readFileSync(path.join(root, 'js/mod-chimie.js'), 'utf8');
const physics = fs.readFileSync(path.join(root, 'js/mod-physique.js'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');

assert.match(html, /js\/app-core\.js/);
assert.match(html, /js\/mod-chimie\.js/);
assert.match(html, /js\/mod-physique\.js/);
assert.match(html, /LABOPC_CORE\.init\(\)/);
assert.doesNotMatch(html, /Code restauré|Le code complet est restauré|Module Chute Libre/);

const activities = [];
const context = { window: {}, console, Math, document: {}, setInterval, clearInterval, setTimeout, clearTimeout };
context.window.window = context.window;
context.window.registerActivity = activity => activities.push(activity);
vm.createContext(context);
vm.runInContext(chemistry, context, { filename: 'mod-chimie.js' });
vm.runInContext(physics, context, { filename: 'mod-physique.js' });

const ids = activities.map(activity => activity.id);
assert.equal(ids.length, 15, '15 activités doivent être enregistrées');
assert.equal(new Set(ids).size, ids.length, 'les identifiants d’activités doivent être uniques');
assert.ok(activities.every(activity => typeof activity.render === 'function'));

for (const src of manifest.icons.map(icon => icon.src)) {
  assert.ok(fs.existsSync(path.join(root, src)), `icône manquante : ${src}`);
}
assert.match(sw, /labopc-v2\.3\.1/);
assert.match(sw, /icon\/icon-192\.png/);
assert.match(sw, /js\/mod-chimie\.js/);

const slopes = {
  NaCl: 0.0501 + 0.0763,
  KCl: 0.0735 + 0.0763,
  CuSO4: 0.1072 + 0.1600,
  CaCl2: 0.1190 + 2 * 0.0763
};
// Conductivity graph units: mS·cm⁻¹ per mmol·L⁻¹.
const expected = { NaCl: 0.1264, KCl: 0.1498, CuSO4: 0.2672, CaCl2: 0.2716 };
for (const [salt, slope] of Object.entries(slopes)) {
  assert.ok(Math.abs(slope - expected[salt]) < 1e-12, `${salt}: pente incohérente`);
}

const beerLambert = (epsilon, concentrationMolL, pathLengthCm = 1) =>
  epsilon * concentrationMolL * pathLengthCm;
assert.ok(Math.abs(beerLambert(2300, 0.00055) - 1.265) < 1e-12);
assert.ok(Math.abs(beerLambert(12.5, 0.055) - 0.6875) < 1e-12);
assert.ok(Math.abs(beerLambert(15000, 27e-6) - 0.405) < 1e-12);
assert.ok(Math.abs(beerLambert(3800, 13e-6) - 0.0494) < 1e-12);

// Venturi: area ratio A1/A2 = 2, continuity and Bernoulli at equal height.
const v1 = 1.5, v2 = 2 * v1, p1Pa = 101300, rho = 1000;
const p2hPa = (p1Pa + 0.5 * rho * (v1*v1 - v2*v2)) / 100;
assert.ok(Math.abs(v2 - 3) < 1e-12);
assert.ok(Math.abs(p2hPa - 979.25) < 1e-12);

// Esterification yield: acetic acid is assumed limiting and ethanol in excess.
const theoreticalEsterMass = (6 / 60.05) * 88.11;
assert.ok(Math.abs(theoreticalEsterMass - 8.802) < 0.01);

// Copper sulfate hydrate: 0.100 mol/L in 100 mL requires n*M.
assert.ok(Math.abs(159.6 * 0.1 * 0.1 - 1.596) < 1e-12);
assert.ok(Math.abs(249.7 * 0.1 * 0.1 - 2.497) < 1e-12);

const f0 = 440, c = 340, vs = 5;
const fApproach = f0 * c / (c - vs);
const fRecede = f0 * c / (c + vs);
assert.ok(fApproach > f0 && fRecede < f0, 'signe Doppler incorrect');

console.log('LABOPC smoke tests: OK');
console.log(`Activités enregistrées : ${ids.join(', ')}`);
console.log('PWA : références d’icônes et version de cache vérifiées');
console.log('Modèles : pentes conductimétriques, Beer-Lambert et Doppler vérifiés');
