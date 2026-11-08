# DONNEES.md — Valeurs et Sources

## Constantes fondamentales (CODATA 2022, valeurs exactes SI) 
- Vitesse de la lumière : c = 299 792 458 m·s⁻¹ (exacte)
- Constante de Planck : h = 6,626 070 15 × 10⁻³⁴ J·s (exacte)
- Charge élémentaire : e = 1,602 176 634 × 10⁻¹⁹ C (exacte)
- Constante d'Avogadro : N_A = 6,022 140 76 × 10²³ mol⁻¹ (exacte)
- Constante de Boltzmann : k_B = 1,380 649 × 10⁻²³ J·K⁻¹ (exacte)

## Conductivités molaires ioniques limites (S·m²·mol⁻¹) à 298 K 
- H₃O⁺ : 349,8 × 10⁻⁴
- OH⁻ : 199,2 × 10⁻⁴
- Na⁺ : 50,1 × 10⁻⁴
- Cl⁻ : 76,3 × 10⁻⁴
- K⁺ : 73,5 × 10⁻⁴
- NO₃⁻ : 71,0 × 10⁻⁴
- Ag⁺ : 61,9 × 10⁻⁴
- CH₃COO⁻ : 40,9 × 10⁻⁴
- ½ SO₄²⁻ : 80,0 × 10⁻⁴

## pKa à 298 K 
- CH₃COOH / CH₃COO⁻ : 4,75
- NH₄⁺ / NH₃ : 9,25
- H₂O / HO⁻ : 14,00 (produit ionique Ke = 1,0 × 10⁻¹⁴)

## Coefficients d'absorption molaire (à vérifier selon le spectrophotomètre réel)
- MnO₄⁻ à 530 nm : ε ≈ 2300 L·mol⁻¹·cm⁻¹ (valeur indicative du projet, à confirmer avec la notice du spectrophotomètre et une mesure d'étalonnage).
- Cu²⁺ à 800 nm : ε = 12,5 L·mol⁻¹·cm⁻¹ dans la simulation (**indicatif, à mesurer/valider**)
- BBT²⁻ à 620 nm : ε = 15 000 L·mol⁻¹·cm⁻¹ dans la simulation (**indicatif, dépendant du pH et à mesurer/valider**)
- Cr₂O₇²⁻ à 450 nm : ε = 3 800 L·mol⁻¹·cm⁻¹ dans la simulation (**indicatif, à mesurer/valider**)

## Précision des mesures simulées
- Bruit relatif sur A : ±1 % (étalons), ±1,5 % (inconnue)
- Bruit relatif sur σ : ±1 % (étalons), ±1,5 % (inconnue)
## Cohérence des pentes conductimétriques simulées

Les coefficients de pente affichés par le module sont exprimés dans l'unité graphique mS·cm⁻¹ par mmol·L⁻¹. Ils sont calculés à partir des conductivités molaires ioniques limites à 298 K, avec les facteurs stœchiométriques :

- NaCl : 0,1264
- KCl : 0,1498
- CuSO₄ : 0,2672 (valeur de λ°(Cu²⁺) utilisée dans le modèle : 107,2 × 10⁻⁴ S·m²·mol⁻¹)
- CaCl₂ : 0,2716 (valeur de λ°(Ca²⁺) utilisée dans le modèle : 119,0 × 10⁻⁴ S·m²·mol⁻¹)

Ces valeurs sont des modèles idéaux à dilution suffisante ; les mesures réelles peuvent s'en écarter.

La simulation applique explicitement le facteur de conversion de l'unité affichée vers mol·L⁻¹ avant d'utiliser la loi de Beer-Lambert. La cuve est modélisée avec une longueur optique de 1,00 cm. Les coefficients marqués indicatifs ne doivent pas être présentés comme des constantes expérimentales garanties.
