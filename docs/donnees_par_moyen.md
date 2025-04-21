# Collecte des Données VSM par Moyen de Collecte

Voici un regroupement des données nécessaires aux calculs VSM, classées selon les principales méthodes de collecte :

## 1. Collecte par Observation Directe et Mesure Manuelle (Terrain / Gemba)

Ces méthodes impliquent une présence physique sur le lieu de travail pour observer, chronométrer ou compter.

*   **Temps à Valeur Ajoutée (VA) :**
    *   *Comment :* Chronométrage direct des opérations transformant réellement le produit (usinage, assemblage, etc.).
    *   *Pour indicateur :* %VA.
*   **Temps de passage par étape :**
    *   *Comment :* Chronométrage du temps total pour réaliser une tâche spécifique sur un poste (y compris micro-arrêts, chargement/déchargement si non séparés).
    *   *Pour indicateur :* Lead Time.
*   **Temps d'attente entre étapes :**
    *   *Comment :* Observation directe des zones de stockage/files d'attente, comptage des encours et estimation/mesure de leur durée de séjour. Utilisation de la Loi de Little (Encours / Débit) si le débit est connu.
    *   *Pour indicateur :* Lead Time, %VA (indirectement, car l'attente est NVA).
*   **Lead Time Total (par suivi physique) :**
    *   *Comment :* Marquer une pièce/un lot/un dossier au début du processus et noter l'heure de fin. Répéter pour obtenir une moyenne.
    *   *Pour indicateur :* %VA, Lead Time.
*   **Temps de Cycle (TC) observé :**
    *   *Comment :* Chronométrage de l'intervalle de temps entre la sortie de plusieurs unités consécutives d'un poste.
    *   *Pour indicateur :* % Taux d'utilisation, TRS (pour le calcul de la Performance si TC réel vs TC nominal).
*   **Nombre d'unités produites / Quantité totale produite :**
    *   *Comment :* Comptage physique des pièces en sortie de poste ou en fin de ligne sur une période donnée.
    *   *Pour indicateur :* TC (moyen), TRS (Qualité, Performance), Taux de rejet.
*   **Quantité défectueuse / Rebutée :**
    *   *Comment :* Comptage physique des pièces mises au rebut ou identifiées comme non conformes dans les zones dédiées.
    *   *Pour indicateur :* TRS (Qualité), Taux de rejet.
*   **Causes et durées des arrêts (simples) :**
    *   *Comment :* Observation directe et chronométrage des arrêts visibles (pannes courtes, attentes matière, changements d'outils rapides).
    *   *Pour indicateur :* TRS (Disponibilité).

## 2. Collecte par Saisie Manuelle / Déclaratif (Opérateurs, Superviseurs, Qualité)

Données enregistrées manuellement par le personnel sur des supports papier ou via des terminaux simples. La fiabilité dépend de la rigueur des saisies.

*   **Temps passé par opération / étape :**
    *   *Comment :* Les opérateurs remplissent des fiches suiveuses, des rapports de production indiquant le temps consacré à chaque tâche.
    *   *Pour indicateur :* Temps de passage (Lead Time), Temps de Cycle (moyen).
*   **Quantités produites (bonnes et/ou totales) :**
    *   *Comment :* Déclarations de production en fin de poste ou de lot sur fiches ou terminal.
    *   *Pour indicateur :* TC (moyen), TRS (Qualité, Performance), Taux de rejet.
*   **Quantités rebutées et causes de rebut :**
    *   *Comment :* Saisie sur fiches de non-conformité, rapports qualité, ou déclaration dans le système par les opérateurs ou le contrôle qualité.
    *   *Pour indicateur :* TRS (Qualité), Taux de rejet.
*   **Causes et durées des arrêts machine :**
    *   *Comment :* Remplissage de journaux de bord machine, fiches d'arrêt, ou saisie sur terminal MES par les opérateurs ou la maintenance.
    *   *Pour indicateur :* TRS (Disponibilité).
*   **Suivi de commandes (basique) :**
    *   *Comment :* Tenue d'un registre manuel ou d'un tableur simple indiquant les dates de commande et d'expédition.
    *   *Pour indicateur :* Taux de service (si pas d'ERP/WMS).

## 3. Collecte via Systèmes d'Information (Automatique/Semi-automatique - ERP, MES, SCADA, WMS)

Données extraites ou enregistrées automatiquement ou semi-automatiquement par les systèmes informatiques de l'entreprise.

*   **Timestamps (Horodatages) des étapes clés :**
    *   *Comment :* Extraction des heures de création de commande, lancement OF, début/fin d'opérations (si scanné/déclaré), déclaration finale, expédition (ERP, MES, WMS).
    *   *Pour indicateur :* Lead Time Total, Temps d'attente entre étapes (par différence).
*   **Temps de cycle machine / Temps de fonctionnement machine :**
    *   *Comment :* Données issues des automates et capteurs remontées au MES/SCADA (temps de marche, temps d'arrêt).
    *   *Pour indicateur :* TC, TRS (Disponibilité, Performance).
*   **Compteurs de pièces (automatiques) :**
    *   *Comment :* Capteurs ou compteurs intégrés aux machines remontant les quantités au MES/SCADA.
    *   *Pour indicateur :* TC, TRS (Performance, Qualité si couplé à un contrôle), Taux de rejet (si distinction bon/rebut).
*   **Données d'arrêts machine (automatiques/qualifiées) :**
    *   *Comment :* Détection automatique des arrêts par le MES/SCADA, souvent complétée par une qualification manuelle de la cause par l'opérateur via un terminal.
    *   *Pour indicateur :* TRS (Disponibilité).
*   **Gestion des stocks / Encours :**
    *   *Comment :* Niveaux de stocks enregistrés dans l'ERP ou le WMS (Warehouse Management System) par emplacement ou état.
    *   *Pour indicateur :* Temps d'attente (via Loi de Little), Lead Time (impact des stocks).
*   **Données Commandes Clients (volume, dates) :**
    *   *Comment :* Extraction du carnet de commandes de l'ERP/CRM (Customer Relationship Management).
    *   *Pour indicateur :* Demande client (Takt Time).
*   **Données d'Expédition :**
    *   *Comment :* Comparaison des dates d'expédition réelles (WMS/ERP) avec les dates de livraison promises/requises (ERP/CRM).
    *   *Pour indicateur :* Taux de service.
*   **Données Qualité (enregistrées) :**
    *   *Comment :* Extraction des bases de données qualité (systèmes LIMS, modules Qualité ERP/MES) sur les quantités contrôlées, conformes, non-conformes et les défauts.
    *   *Pour indicateur :* TRS (Qualité), Taux de rejet.

## 4. Collecte via Documentation Interne / Standards / Planification

Informations issues des référentiels, plannings et standards de l'entreprise.

*   **Temps Gamme / Temps Standard VA :**
    *   *Comment :* Consultation des gammes de fabrication, standards de temps (MTM, etc.) définis par le bureau des méthodes.
    *   *Pour indicateur :* %VA (si utilisé comme référence pour le Temps VA).
*   **Temps de Cycle Théorique / Vitesse Nominale :**
    *   *Comment :* Données constructeur machine, gammes de fabrication, standards de performance établis.
    *   *Pour indicateur :* TRS (Performance).
*   **Temps disponible :**
    *   *Comment :* Consultation des calendriers d'équipe, plannings de production, listes des pauses et arrêts planifiés (maintenance préventive, réunions).
    *   *Pour indicateur :* Takt Time.
*   **Demande client (planifiée/prévisionnelle) :**
    *   *Comment :* Consultation des plans de production, prévisions des ventes fournies par le service commercial ou la planification.
    *   *Pour indicateur :* Takt Time.

---

**Remarque :** En pratique, la collecte de données pour une VSM combine souvent plusieurs de ces méthodes. Par exemple, on peut utiliser les données MES pour les temps de cycle machine mais aller sur le terrain pour chronométrer les temps d'attente et observer les flux physiques. La clé est de choisir la méthode la plus fiable et la plus pertinente pour chaque donnée spécifique, tout en comprenant les limites potentielles de chaque approche (ex: fiabilité des saisies manuelles, nécessité de valider les données systèmes sur le terrain).