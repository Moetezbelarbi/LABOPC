# 🧪 LABOPC by M.Belarbi

> **Laboratoire virtuel d'analyse physique & chimique** pour la spécialité Physique-Chimie (1ère & Terminale).

![Version](https://img.shields.io/badge/version-2.3.1-6ee7b7)
![PWA](https://img.shields.io/badge/PWA-ready-2c5364)
![Licence](https://img.shields.io/badge/©-M.Belarbi-red)
![Langues](https://img.shields.io/badge/interface-FR%20%7C%20EN-blue)

---

## 📖 Présentation

**LABOPC** est une application web éducative interactive qui permet aux élèves de **Première et Terminale spécialité Physique-Chimie** de manipuler virtuellement les méthodes d'analyse du programme officiel.

L'application est conçue pour fonctionner hors ligne après une première visite et peut être installée comme PWA sur les navigateurs compatibles. Le comportement hors ligne doit être confirmé sur le site publié et le navigateur cible.

---

## ✨ Fonctionnalités

### 🔵 Analyse physique — Dosage par étalonnage

| Technique | Loi | Solutions proposées |
|---|---|---|
| **Spectrophotométrie** | Beer-Lambert (A = k·C) | KMnO₄, CuSO₄, BBT, K₂Cr₂O₇ |
| **Conductimétrie** | Kohlrausch (σ = k·C) | NaCl, KCl, CuSO₄, CaCl₂ |

- Matériel animé réaliste : **spectrophotomètre** (cuve, faisceau, écran digital) et **conductimètre** (cellule qui plonge dans un bécher)
- Mesure **solution par solution** → la courbe d'étalonnage se construit progressivement
- **Solution inconnue** mesurable avec bruit réaliste
- Régression linéaire automatique avec R²

### 🧪 Analyse chimique — Titrage

| Type | Suivi | Systèmes |
|---|---|---|
| **pH-métrique** | Courbe pH = f(V) | HCl/NaOH, CH₃COOH/NaOH, NH₃/HCl |
| **Conductimétrique** | Courbe σ = f(V) | NaCl/AgNO₃, HCl/NaOH |
| **Colorimétrique** | Changement de couleur | HCl/NaOH (hélianthine), CH₃COOH/NaOH (phénolphtaléine), Fe²⁺/MnO₄⁻ |

- **Montage réaliste SVG** : statif, pince, burette graduée, robinet cliquable, bécher, agitateur magnétique, sonde pH / cellule
- **Couleurs réelles** des solutions titrantes (NaOH incolore, KMnO₄ violet…)
- **Virage colorimétrique** dépendant de la zone de virage de l'indicateur (pH calculé exactement)
- **Débit ralentit** à l'approche de l'équivalence
- **Tableau d'évolution des ions** pour les titrages conductimétriques (avant / à / après l'équivalence)
- **Courbe théorique et V_E masqués** jusqu'à ce que l'élève saisisse son propre V_E
- **Démarche détaillée en 6 étapes** pour déterminer C_inconnue

### 🎯 Fonctionnalités transverses

- 🌐 **Interface FR / EN** (menus bilingues ; certains textes internes aux simulations restent en français)
- 🖨️ **Impression** des tableaux, graphes et démarches (PDF via navigateur)
- 📱 **PWA installable** : icône, écran de lancement, mode hors ligne, mises à jour automatiques
- 📐 **Choix des concentrations** avant chaque titrage
- © **Mentions copyright** M.Belarbi dans l'interface, le code et le service worker

---

## 🚀 Installation

### Option 1 : Utiliser directement (aucune installation)

Ouvrir l'URL de l'application dans un navigateur moderne :


## 🧪 Vérifications et tests

Le dépôt contient un test de fumée Node.js :

```bash
node tests/smoke-test.js
```

Il vérifie l'enregistrement des 15 activités, l'unicité de leurs identifiants, les chemins des icônes et plusieurs calculs de référence (Beer-Lambert, conductimétrie, Doppler, Venturi, dissolution et rendement).

## ⚠️ Données scientifiques à confirmer

Les coefficients d'absorption molaire du Cu²⁺, du BBT et du dichromate sont des paramètres indicatifs de simulation, pas des valeurs certifiées. Le coefficient du permanganate doit également être confirmé avec le spectrophotomètre et la cuve utilisés. Voir `DONNEES.md` et `RAPPORT-CORRECTIONS.md`.
