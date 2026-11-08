# Rapport de correction LABOPC — v2.3.1

## Corrections effectuées

- Remplacement du script monolithique provisoire de `index.html` par le chargement ordonné du cœur et des deux modules réels.
- Initialisation du cœur après l'enregistrement des activités.
- Réactivation des 15 activités réellement présentes dans `mod-chimie.js` et `mod-physique.js`.
- Correction des chemins d'icônes (`icon/` au lieu de `icons/`) dans le manifeste, la page et le service worker.
- Enregistrement du service worker et mise à jour du cache versionné.
- Ajout de règles responsive pour les petits écrans et d'une activation clavier des cartes de navigation.
- Correction des pentes conductimétriques NaCl, KCl, CuSO4 et CaCl2 pour qu'elles concordent avec les conductivités ioniques utilisées.
- Correction de l'application de Beer-Lambert : conversion systématique des concentrations affichées vers mol·L⁻¹ et prise en compte d'une cuve de 1,00 cm.
- Harmonisation du coefficient du permanganate avec la valeur indicative du fichier de données (2300 L·mol⁻¹·cm⁻¹).
- Mise à l'échelle des paramètres ε BBT et dichromate pour obtenir des absorbances de simulation plausibles ; ces valeurs restent explicitement indicatives et doivent être mesurées/validées.
- Bruit de mesure spectrophotométrique et conductimétrique rendu proportionnel au signal, avec un plancher de bruit instrumental.
- Dissolution : choix entre CuSO4 anhydre et CuSO4·5H2O, masses molaires distinctes et validation des entrées.
- Synthèse : calcul du rendement expérimental à partir de la masse réellement saisie, avec hypothèse explicite d'éthanol en excès et acide éthanoïque limitant.
- Chute : intégration dépendante du temps réel avec modèle explicite de frottement quadratique et vitesse limite paramétrée.
- Doppler : choix approche/éloignement et formules distinctes.
- Lentille : traitement du cas objet au foyer et distinction image réelle/virtuelle et droite/renversée.
- Venturi : continuité du débit avec rapport de sections 2 et Bernoulli à altitude constante.
- Archimède : validation des entrées et distinction de l'équilibre neutre.

## Tests exécutés

- Vérification syntaxique Node.js de `app-core.js`, `mod-chimie.js`, `mod-physique.js`, `sw.js` et du script de tests.
- Test Node.js de l'enregistrement des activités : 15 activités, identifiants uniques, fonctions `render()` présentes.
- Vérification des chemins locaux référencés par `index.html` et du manifeste.
- Vérification des fichiers d'icônes.
- Tests numériques de pentes conductimétriques, Beer-Lambert, Doppler, Venturi, dissolution et rendement de synthèse.
- Vérification HTTP locale de la page d'accueil.

Commande de test : `node tests/smoke-test.js`

## Limites et validations encore nécessaires

- Les coefficients d'absorption de Cu²⁺, BBT et dichromate ne sont pas confirmés par une fiche constructeur ou une mesure d'étalonnage : ils restent signalés comme indicatifs.
- Le coefficient du permanganate doit être vérifié avec le spectrophotomètre et la cuve réellement utilisés.
- Les valeurs de conductivité molaire ionique de Ca²⁺ et Cu²⁺ utilisées par le module doivent être confirmées avec une référence documentaire adaptée ; les pentes sont cohérentes avec les valeurs internes choisies.
- Les textes internes aux simulations restent majoritairement en français : le bilinguisme de l'application est donc partiel (menus bilingues, modules non intégralement traduits).
- Un test d'interaction complet dans un vrai navigateur et sur appareil mobile n'a pas pu être mené dans cet environnement. La syntaxe, le chargement des modules et les tests numériques automatisés ont été vérifiés, mais cela ne remplace pas un test manuel de toutes les commandes et animations.
- Le mode hors ligne doit être confirmé après publication HTTPS sur GitHub Pages, car le comportement du service worker dépend du chemin de déploiement et du navigateur.

## Publication

Publier l'intégralité du contenu de ce dossier sur la branche/répertoire GitHub Pages existant. Après publication, ouvrir l'application une fois en ligne, attendre le préchargement, puis tester le mode avion et vérifier que le service worker est actif. Le cache a été incrémenté en `labopc-v2.3.1`.
