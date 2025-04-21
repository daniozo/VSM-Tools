# Collecte des Données pour le Calcul des Indicateurs VSM

Pour réaliser une cartographie de la chaîne de valeur (VSM) pertinente et calculer les indicateurs clés, une collecte de données précise est essentielle. Voici les méthodes de collecte pour chaque donnée nécessaire aux calculs présentés :

## 1. % Valeur Ajoutée (%VA)

*   **Formule :** `(%VA = (Temps VA / Lead time total) × 100)`
*   **Données nécessaires :**
    *   `Temps à Valeur Ajoutée (Temps VA)` : Temps durant lequel le produit subit une transformation physique ou répond à une exigence directe du client pour laquelle il est prêt à payer.
    *   `Lead Time Total` : Temps total écoulé entre le début (souvent la commande client) et la fin du processus (souvent la livraison).

*   **Méthodes de collecte :**
    *   **Temps VA :**
        *   **Chronométrage direct :** Observer et chronométrer spécifiquement les opérations qui transforment le produit (usinage, assemblage, peinture, etc.) pour une unité ou un petit lot représentatif. Ne pas inclure les attentes, transports, contrôles (sauf si explicitement requis par le client et intégré à l'opération VA), reprises.
        *   **Standards de temps :** Utiliser les temps gammes ou les standards de temps établis (par ex., via MTM - Methods-Time Measurement) s'ils sont fiables et régulièrement mis à jour, en isolant les parties purement VA.
        *   **Systèmes MES (Manufacturing Execution System) :** Si le MES est configuré pour distinguer les cycles machine actifs de transformation des autres états (attente, panne, réglage).
    *   **Lead Time Total :**
        *   **Suivi physique ("Marquage") :** Marquer physiquement (ou virtuellement) une unité ou un lot au début du processus (ex: réception commande ou lancement OF) et noter la date/heure de fin (ex: expédition). Répéter pour plusieurs unités/lots afin d'obtenir une moyenne fiable.
        *   **Analyse des données systèmes (ERP/MES) :** Extraire les timestamps (horodatages) des étapes clés enregistrées dans les systèmes d'information (création commande, lancement OF, début/fin opérations critiques, déclaration de production finale, expédition). Calculer la durée entre le point de départ et le point d'arrivée définis. Attention aux biais potentiels si les saisies ne sont pas rigoureuses.
        *   **Observation directe du flux complet :** Suivre un produit ou un dossier tout au long de son parcours et noter les temps de passage et d'attente à chaque étape.

## 2. Lead Time (Temps de Traversée)

*   **Formule :** `Lead time = Σ(temps de passage par étape) + Σ(temps d'attente entre les étapes)`
*   **Données nécessaires :**
    *   `Temps de passage par étape` : Temps nécessaire pour réaliser une tâche ou une opération spécifique sur un poste. Inclut souvent le Temps VA mais aussi des temps annexes (réglages courts, chargement/déchargement si non séparés).
    *   `Temps d'attente entre les étapes` : Temps pendant lequel le produit ou l'information stagne (stocks intermédiaires, files d'attente, temps de transport, délais de validation).

*   **Méthodes de collecte :**
    *   **Temps de passage par étape :**
        *   **Chronométrage direct :** Mesurer le temps total pour qu'une unité ou un lot traverse une étape spécifique.
        *   **Données MES/SCADA :** Temps de cycle machine ou temps de traitement enregistré automatiquement.
        *   **Déclarations de production :** Si les opérateurs déclarent les temps passés par opération (précision parfois limitée).
    *   **Temps d'attente entre les étapes :**
        *   **Observation directe ("Gemba Walk") :** Aller sur le terrain, identifier les zones de stockage/attente et estimer/mesurer la durée de séjour des produits/dossiers.
        *   **Calcul basé sur les stocks :** Utiliser la Loi de Little (Encours = Débit x Lead Time). Si on connaît l'encours moyen (en unités) entre deux étapes et le débit moyen (unités/temps), on peut estimer le temps d'attente (`Temps d'attente = Encours / Débit`). L'encours peut être compté physiquement ou extrait des systèmes (ERP/WMS). Le débit correspond souvent au Takt Time ou au temps de cycle du goulot.
        *   **Analyse des timestamps (ERP/MES) :** Calculer la différence entre l'heure de fin d'une étape et l'heure de début de l'étape suivante pour le même produit/lot.

## 3. Takt Time

*   **Formule :** `Takt time = Temps disponible / Demande client`
*   **Données nécessaires :**
    *   `Temps disponible` : Temps net de production planifié pour une période donnée (jour, semaine), après déduction des pauses planifiées, réunions, maintenance préventive programmée.
    *   `Demande client` : Nombre d'unités que le client attend sur cette même période.

*   **Méthodes de collecte :**
    *   **Temps disponible :**
        *   **Planning de production / Calendrier d'équipe :** Consulter les horaires de travail officiels, déduire les pauses conventionnelles (déjeuner, etc.), les temps de réunion standards, les arrêts planifiés. Convertir en unité de temps cohérente (secondes, minutes).
        *   **Données RH / Gestion du temps :** Utiliser les données de pointage pour affiner le temps de présence théorique.
    *   **Demande client :**
        *   **Carnet de commandes (ERP/CRM) :** Analyser les commandes fermes ou les prévisions fiables pour la période considérée.
        *   **Service commercial / Planification :** Interroger les responsables pour connaître la demande moyenne ou cible sur la période.

## 4. Temps de Cycle (TC)

*   **Formule :** `TC = Temps total passé à produire / Nombre d'unités produites` (Note: ceci donne un TC moyen sur une période. Le TC est souvent aussi défini comme le temps *entre deux unités consécutives* sortant d'un poste).
*   **Données nécessaires :**
    *   `Temps total passé à produire` : Temps effectif pendant lequel le poste/processus a fonctionné pour réaliser la production (exclut les pannes longues, les attentes matière, etc.).
    *   `Nombre d'unités produites` : Quantité totale sortie du poste/processus pendant ce temps.
    *   *(Alternative pour TC instantané/observé)* : Temps entre la sortie de l'unité N et la sortie de l'unité N+1.

*   **Méthodes de collecte :**
    *   **Temps total passé à produire :**
        *   **Chronométrage / Observation :** Mesurer la durée pendant laquelle la machine/opérateur travaille activement sur une série.
        *   **Données MES/SCADA :** Temps de marche machine enregistré automatiquement.
        *   **Fiches suiveuses / Rapports de production :** Temps déclarés par les opérateurs (avec les limites de précision associées).
    *   **Nombre d'unités produites :**
        *   **Comptage manuel :** Compter physiquement les pièces produites à la fin d'une période ou d'un lot.
        *   **Compteurs machine :** Utiliser les compteurs intégrés aux équipements.
        *   **Déclarations de production (MES/ERP) :** Quantités saisies par les opérateurs ou scannées.
    *   **TC instantané/observé :**
        *   **Chronométrage direct :** Se poster à la sortie du poste et chronométrer l'intervalle de temps entre la sortie de plusieurs unités consécutives. Calculer la moyenne sur un échantillon représentatif.

## 5. % Taux d'utilisation des postes

*   **Formule :** `% Utilisation = (Temps de cycle / Takt time) × 100`
*   **Données nécessaires :**
    *   `Temps de Cycle (TC)` : Voir point 4.
    *   `Takt Time` : Voir point 3.

*   **Méthodes de collecte :** Utiliser les données collectées pour le TC et le Takt Time.

## 6. % Taux de Rendement Synthétique (TRS)

*   **Formule :** `TRS = Disponibilité × Performance × Qualité × 100`
*   **Données nécessaires (détaillées) :**
    *   Pour la **Disponibilité** (`Temps de fonctionnement / Temps prévu` ou `Temps requis`):
        *   `Temps de fonctionnement` : Temps pendant lequel l'équipement a réellement produit (Temps prévu - Tous les arrêts).
        *   `Temps prévu` ou `Temps Requis` : Temps pendant lequel l'équipement était censé produire (souvent le temps d'ouverture de l'atelier moins les arrêts planifiés longs comme la maintenance préventive majeure).
        *   *Données intermédiaires :* Durée et causes des arrêts (pannes, changements de série, micro-arrêts, attentes...).
    *   Pour la **Performance** (`Vitesse réelle / Vitesse nominale` ou `(Quantité produite * TC théorique) / Temps de fonctionnement`):
        *   `Vitesse réelle` (ou TC réel) : Cadence moyenne observée pendant le temps de fonctionnement. Souvent calculée via `Quantité totale produite / Temps de fonctionnement`.
        *   `Vitesse nominale` (ou TC théorique/standard) : Cadence optimale ou standard définie pour le produit sur cet équipement.
        *   `Quantité totale produite` : Nombre total de pièces (bonnes + mauvaises) fabriquées pendant le temps de fonctionnement.
    *   Pour la **Qualité** (`Quantité bonne / Quantité totale produite`):
        *   `Quantité bonne` : Nombre de pièces conformes aux spécifications du premier coup.
        *   `Quantité totale produite` : Nombre total de pièces fabriquées.

*   **Méthodes de collecte :**
    *   **Arrêts (pour Disponibilité) :**
        *   **Manuelle :** Journaux de bord machine remplis par les opérateurs, fiches d'arrêt manuelles.
        *   **Semi-automatique :** Saisie des arrêts et de leurs causes par les opérateurs sur terminal (MES).
        *   **Automatique :** Détection des arrêts machine par capteurs/automates (MES/SCADA), nécessitant souvent une qualification manuelle de la cause.
    *   **Temps prévu/requis :** Planning de production, horaires d'équipe.
    *   **Quantités (totale, bonne, pour Performance et Qualité) :**
        *   **Manuelle :** Comptage physique, rapports de contrôle qualité.
        *   **Semi-automatique/Automatique :** Compteurs machine, systèmes de vision, déclarations de production (MES/ERP), données du service qualité.
    *   **Vitesse/TC nominal/théorique (pour Performance) :**
        *   **Documentation :** Données constructeur de la machine, gammes de fabrication, standards internes établis par le bureau des méthodes.

*   **Systèmes intégrés :** Les systèmes MES sont souvent conçus spécifiquement pour collecter automatiquement une grande partie des données nécessaires au calcul du TRS.

## 7. % Taux de Rejet / Rebut

*   **Formule :** `Taux de rejet = (Quantité défectueuse / Quantité totale produite) × 100`
*   **Données nécessaires :**
    *   `Quantité défectueuse` : Nombre de pièces non conformes identifiées (peuvent être mises au rebut ou nécessiter une retouche).
    *   `Quantité totale produite` : Nombre total de pièces fabriquées sur la période ou le lot considéré.

*   **Méthodes de collecte :**
    *   **Manuelle :** Comptage physique des rebuts dans les zones dédiées, fiches de non-conformité, rapports de contrôle qualité.
    *   **Déclarations de production (MES/ERP) :** Saisie des quantités rebutées par les opérateurs ou le contrôle qualité.
    *   **Systèmes de contrôle automatisé :** Systèmes de vision, bancs de test qui comptabilisent automatiquement les NOK (Not OK).
    *   **Analyse des données Qualité :** Utiliser les bases de données du service qualité qui tracent les non-conformités.

## 8. % Taux de Service

*   **Formule :** `Taux de service = (Commandes livrées à temps / Commandes totales) × 100`
*   **Données nécessaires :**
    *   `Commandes livrées à temps` : Nombre de commandes (ou lignes de commandes) expédiées à la date promise ou requise par le client.
    *   `Commandes totales` : Nombre total de commandes (ou lignes) qui devaient être expédiées sur la période considérée.

*   **Méthodes de collecte :**
    *   **Systèmes ERP/WMS :** La méthode la plus fiable. Extraire les données des modules de gestion des commandes et d'expédition. Comparer la date d'expédition réelle avec la date de livraison promise/confirmée au client pour chaque commande sur une période donnée (jour, semaine, mois).
    *   **Suivi manuel :** Tenir un registre ou un tableau de bord où l'on note pour chaque commande si elle est partie à temps ou en retard (moins fiable et plus fastidieux pour de gros volumes).
    *   **Analyse des retours clients :** Peut donner une indication qualitative, mais moins précise pour un calcul systématique.

---

**Conseils généraux pour la collecte :**

*   **Aller sur le terrain (Gemba) :** La VSM commence par l'observation directe. Même si des systèmes existent, aller voir le processus réel permet de comprendre le contexte, de valider les données et d'identifier des gaspillages non visibles dans les chiffres.
*   **Définir clairement les périmètres :** Qu'est-ce qui marque le début et la fin du processus étudié ? Quelle est la période d'analyse ? Quelles sont les définitions exactes des termes (ex: qu'est-ce qu'une "commande livrée à temps" ? À l'heure près ? Au jour près ? Date demandée ou date confirmée ?).
*   **Impliquer les équipes :** Les opérateurs et les superviseurs connaissent le processus. Leur implication facilite la collecte et assure la pertinence des données.
*   **Utiliser des outils simples au début :** Papier, crayon, chronomètre, formulaires de collecte standardisés peuvent suffire pour une première VSM.
*   **Fiabiliser les données systèmes :** Si vous utilisez des données ERP/MES, assurez-vous que les saisies sont faites rigoureusement et que les timestamps sont corrects.
*   **Échantillonner :** Pour les mesures manuelles (chronométrage, comptage), utiliser un échantillon représentatif (plusieurs cycles, plusieurs produits, plusieurs moments de la journée/semaine) pour lisser les variations.
*   **Documenter les méthodes :** Notez comment chaque donnée a été collectée pour pouvoir répliquer la mesure et suivre les progrès.