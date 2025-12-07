Il existe un ensemble d'indicateurs **standards** issus de la méthodologie Lean et du VSM, qui forment un langage commun dans le monde de l'amélioration continue. Notre outil doit absolument proposer ces indicateurs en premier lieu.

Cependant, chaque entreprise et chaque processus a ses spécificités. Un bon outil doit donc permettre aux utilisateurs de définir leurs propres indicateurs **personnalisés** pour répondre à leurs besoins uniques.

Notre VSM Studio gérera cela de la manière suivante : lors de l'ajout d'un indicateur, l'utilisateur aura le choix entre une liste d'indicateurs standards pré-configurés ou une option "Créer un indicateur personnalisé".

---

Voici une liste aussi complète que possible des indicateurs que l'on trouve typiquement dans les boîtes de données d'une VSM, regroupés par catégorie.

### **Catégorie 1 : Indicateurs de Temps (Le Cœur du VSM)**

Ce sont les métriques les plus fondamentales, car le VSM vise avant tout à réduire le temps de traversée.

| Nom Commun (Français) | Nom Technique (Anglais) | Description | Source de Données Potentielle |
| :--- | :--- | :--- | :--- |
| **Temps de Cycle** | Cycle Time (C/T) ou Processing Time (P/T) | Temps réel nécessaire pour réaliser toutes les opérations d'une étape sur une seule unité. C'est le temps de travail effectif. | MES, SCADA, Chronométrage manuel |
| **Temps de Changement de Série** | Changeover Time (C/O) | Temps total écoulé entre la production de la dernière bonne pièce d'une série A et la première bonne pièce d'une série B. | MES, Logiciel de planification |
| **Taux de Production** | Production Rate | Le nombre d'unités produites par une étape sur une période donnée (heure, jour). | MES, Compteurs d'automates |
| **Temps Takt** | Takt Time | **Ce n'est pas un indicateur de processus, mais une cible.** C'est le rythme auquel le client demande les produits (`Temps de production disponible / Demande client`). On peut l'afficher pour le comparer au Temps de Cycle. | ERP (pour la demande), Données de production (pour le temps disponible) |

### **Catégorie 2 : Indicateurs de Qualité**

Produire vite ne sert à rien si les produits sont défectueux.

| Nom Commun (Français) | Nom Technique (Anglais) | Description | Source de Données Potentielle |
| :--- | :--- | :--- | :--- |
| **Rendement de Première Passe** | First Pass Yield (FPY) | Pourcentage d'unités qui traversent une étape et sont conformes du premier coup, sans aucune retouche. | Système de contrôle qualité (QMS), MES |
| **Taux de Rebut** | Scrap Rate | Pourcentage d'unités qui sont déclarées non conformes et jetées à une étape donnée. | QMS, MES, ERP (déclarations de rebut) |
| **Taux de Retouche** | Rework Rate | Pourcentage d'unités qui nécessitent une ou plusieurs opérations supplémentaires pour devenir conformes. | QMS, MES |

### **Catégorie 3 : Indicateurs de Ressources et d'Efficacité**

Ces indicateurs mesurent l'efficience avec laquelle les ressources (machines, opérateurs) sont utilisées.

| Nom Commun (Français) | Nom Technique (Anglais) | Description | Source de Données Potentielle |
| :--- | :--- | :--- | :--- |
| **Taux de Disponibilité** | Uptime / Availability | Pourcentage du temps planifié où l'équipement est effectivement capable de produire (non en panne, non en changement de série...). | MES, Système de suivi de l'OEE |
| **Nombre d'Opérateurs** | Number of Operators | Le nombre de personnes requises pour faire fonctionner l'étape de processus. | Donnée statique, ou issue d'un logiciel de gestion du personnel |
| **TRS / OEE** | Overall Equipment Effectiveness | Le "roi des indicateurs". C'est un indicateur composite qui mesure l'efficacité globale d'un équipement. **OEE = Disponibilité x Performance x Qualité**. | MES (qui le calcule souvent automatiquement), ou calculé dans notre Engine à partir des 3 métriques sources |
| **Taille de Lot** | Batch Size | Le nombre d'unités produites en une seule fois avant de passer à un autre type de produit. | Donnée statique issue de la gamme de production (ERP) ou dynamique (MES) |

### **Catégorie 4 : Indicateurs Personnalisés (Exemples)**

C'est ici que la flexibilité de l'outil prend tout son sens. L'utilisateur peut définir n'importe quel indicateur pertinent pour son activité.

| Nom de l'Indicateur | Description | Source de Données Potentielle |
| :--- | :--- | :--- |
| **Consommation Énergétique** | L'énergie (kWh) consommée par l'équipement pour produire une unité ou par heure. | SCADA, Capteurs IoT |
| **Coût par Unité** | Le coût de production pour une seule unité à cette étape (incluant main d'œuvre, matière, énergie...). | ERP (calcul de coût de revient) |
| **Incidents de Sécurité** | Le nombre d'incidents de sécurité survenus à ce poste de travail sur une période donnée. | Logiciel de gestion HSE (Hygiène, Sécurité, Environnement) |
| **Niveau de Compétence** | Le niveau de formation moyen des opérateurs affectés à cette étape. | Logiciel de gestion des RH / compétences |

### **Conclusion pour Notre Projet**

1.  **Standardisation :** Le VSM Studio doit proposer, via son interface, une liste prédéfinie contenant les indicateurs des catégories 1, 2 et 3. Lorsque l'utilisateur choisit "Uptime", l'outil pré-remplit le nom et l'unité (%), simplifiant la configuration.
2.  **Flexibilité :** L'interface doit comporter une option "Indicateur Personnalisé" qui présente des champs vides (`Nom`, `Unité`, `Configuration du Connecteur`), offrant une liberté totale à l'utilisateur pour connecter l'outil à n'importe quelle donnée mesurable de son entreprise.