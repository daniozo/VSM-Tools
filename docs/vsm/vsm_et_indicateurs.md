# VSM : Value Stream Mapping

Le Value Stream Mapping (VSM) permet de visualiser les processus de production en distinguant les activités à **valeur ajoutée (VA)** et celles **sans valeur ajoutée (NVA).** L'indicateur %VA mesure la proportion de temps réellement utile pour le client. On calcule aussi le %NVA comme complément pour estimer les gaspillages.  
%VA = (Temps VA / Lead time total) × 100  
%NVA = 100% - %VA

# Qu'est-ce qu'un goulot d'étranglement ?

Un goulot d'étranglement est l'étape la plus lente ou la plus saturée du processus, qui limite le débit global de la chaîne. C'est comme le maillon faible -- tant que lui ne s'accélère pas, tout le reste est freiné.

# Flux d'informations électroniques :

Cela fait référence à la manière dont l'information circule dans le processus -- ici, par voie (email, ERP, MES, etc.).

# Flux poussé :

Cela signifie que la production est lancée en avance, selon un planning prédéfini ou des prévision (et non selon une demande réelle immédiate).

# Indicateurs pour repérer des Goulots d'étranglement : 

- **% de temps à valeur Ajoutée**

  $$\% VA = \left( \frac{temps\ VA}{Lead\ time\ total\ } \right) \times 100$$

  Taux d'activité réellement utile pour le client,
  - <10 : trop de gaspillages, réduire les attentes, les stocks, les déplacements inutiles.

- **Lead time (temps de traversée)**

  $$Lead\ time = \sum_{}^{}{temps\ de\ passage\ par\ tape + \ \sum_{}^{}{temps\ d^{'}attente\ entre\ les\ tapes}}$$

- **Takt time**

  $$Takt\ time = \ \frac{temps\ disponible\ }{Demande\ client}$$

- **Temps de cycle**

  $$TC = \frac{temps\ total\ pass\ produire}{Nombre\ d^{'}unité\ produites}$$

- **% Taux d'utilisation des postes**

  $$= \frac{Tc}{takt\ time} \times 100$$

  Permet d'identifier les poste sous/sur-utilisés,
  - >100% Goulots potentiel, rééquilibrer les charges ou automatiser

- **% Taux de rendement synthétique**

  $$TRS = Disponibilité \times Performance \times Qualité \times 100$$

  - $$Disponibilité = \frac{temps\ de\ fonctionnemen}{Temps\ prevu} \times 100$$

  - Disponibilité effective des équipements : <90%, Réduire les pannes, améliorer la maintenance.

  - $$Performance = \frac{vitesse\ réelle}{vitesse\ nominale} \times 100$$

  - Respect de la cadence prévue : <90%, réduire les pannes, améliorer la maintenance.

  - $$Qualité = \frac{Quantité\ bonne}{Quantité\ totale\ produite} \times 100$$

  - Mesure la proportion de produits conformes : <98%, revoir les contrôles qualité, améliorer les procédés.

  Mesure globale de l'efficacité d'un poste,
  - <85% : identifier si pertes viennent des pannes, lenteur ou défauts

- **% Taux de rebut / rejet**

  $$Taux\ de\ rejet = \left( \frac{Quantité\ défectueuse}{Quantité\ totale\ produite\ } \right) \times 100$$

  Défauts générés dans la production,
  - >2% : Identifier les causes racines, AMDEC, 5M, Ishikawa.

- **% Taux de service**

  $$Taux\ de\ service = \left( \frac{commandes\ livres\ temps}{commandes\ totales} \right) \times 100$$

  Fiabilité de la livraison au client,
  - <95% : Optimiser la planification, réduire les ruptures de stock.

# Tableau récapitulatif visuel : 

| Indicateur | Formule (%) | Seuil critique | Goulot potentiel si... | Recommandation |
|------------|-------------|----------------|------------------------|----------------|
| % Valeur Ajoutée (%VA) | (Temps VA / Lead time) × 100 | < 10% | Trop de gaspillage | Réduire attentes, stocks, déplacements |
| Taux d'utilisation des postes | (Temps de cycle / Takt time) × 100 | > 100% | Poste surchargé | Rééquilibrer ou automatiser |
| Taux de rendement synthétique (TRS) | Dispo × Perf × Qualité × 100 | < 85% | Pertes globales | Analyser les pertes : pannes, lenteurs, défauts |
| Taux de rejet | (Quantité défectueuse / Quantité totale) × 100 | > 2% | Non-qualité élevée | Analyse 5M, Ishikawa, AMDEC |
| Taux de service | (Commandes livrées à temps / Commandes totales) × 100 | < 95% | Retards fréquents | Optimiser planification, éviter ruptures |

## Indicateurs clés pour l'analyse VSM

Le tableau ci-dessous présente les principaux indicateurs utilisés dans l'analyse de flux de valeur (VSM), leur formule de calcul, les seuils d'alerte typiques, les problèmes potentiels qu'ils peuvent révéler, et les actions d'amélioration possibles.

| Indicateur | Formule de calcul | Seuil d'alerte | Problèmes potentiels | Actions d'amélioration |
|------------|-------------------|----------------|----------------------|------------------------|
| % Valeur Ajoutée | (Temps VA / Lead time total) × 100 | < 5% | Processus inefficace, trop de gaspillages | Éliminer les gaspillages, réduire les attentes |
| Lead Time | Σ(temps de passage par étape) + Σ(temps d'attente entre les étapes) | > délai client | Délais trop longs, manque de réactivité | Réduire les stocks, optimiser les flux |
| Takt Time | Temps disponible / Demande client | TC > Takt | Production trop lente | Équilibrer les postes, réduire les TC |
| Temps de Cycle (TC) | Temps total passé à produire / Nombre d'unités produites | Variation > 20% | Instabilité du processus | Standardiser les méthodes, former les opérateurs |
| % Taux d'utilisation des postes | (Temps de cycle / Takt time) × 100 | > 85% | Surcharge des postes, manque de flexibilité | Redistribuer la charge, automatiser |
| % TRS (Taux de Rendement Synthétique) | Disponibilité × Performance × Qualité × 100 | < 70% | Pertes multiples sur les équipements | Maintenance préventive, réduction des arrêts |
| % Taux de Rejet / Rebut | (Quantité défectueuse / Quantité totale produite) × 100 | > 2% | Problèmes qualité | Poka-yoke, contrôles amont, amélioration process |
| Taux de service | (Commandes livrées à temps / Commandes totales) × 100 | < 95% | Retards fréquents | Optimiser planification, éviter ruptures |
| Taille des lots | Nombre d'unités produites consécutivement du même type | > besoins journaliers | Stocks élevés, flexibilité réduite | Réduire les lots, SMED pour changements rapides |
| Niveaux de stocks | Quantité physique en stock / Consommation journalière (jours) | > 3 jours | Capital immobilisé, obsolescence | Kanban, FIFO, flux tiré |
| Nombre de changements | Nombre de changements de série par jour/semaine | < 1 par jour | Rigidité de production | SMED, réduction des temps de changement |
| Distance parcourue | Somme des distances entre les postes | > 50m | Implantation inefficace | Reconfigurer les postes, cellule en U |
| Nombre d'opérateurs | Somme des opérateurs par poste | > idéal théorique | Sureffectif ou répartition inégale | Polyvalence, équilibrage des postes |
| Temps de changement de série | Temps entre la dernière pièce bonne et la première pièce bonne | > 10 min | Flexibilité limitée | SMED, préparation externe, standardisation |

## Comment utiliser ces indicateurs

1. **Mesurer l'état actuel** : Collecter les données et calculer chaque indicateur
2. **Comparer aux seuils d'alerte** : Identifier les écarts significatifs 
3. **Analyser les causes racines** : Utiliser des outils comme les 5 Pourquoi ou le diagramme d'Ishikawa
4. **Définir l'état futur** : Fixer des objectifs d'amélioration réalistes pour chaque indicateur
5. **Mettre en œuvre le plan d'action** : Transformer l'état actuel en état futur via des chantiers d'amélioration

## Visualisation dans l'application

L'application VSM-Tools permet de:
- Saisir les données brutes pour chaque processus et stock
- Calculer automatiquement tous ces indicateurs
- Visualiser les écarts par rapport aux seuils via un code couleur
- Comparer état actuel et état futur pour évaluer les progrès
- Exporter les tableaux de bord pour présentation et suivi