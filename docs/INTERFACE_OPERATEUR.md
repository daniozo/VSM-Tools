# Interface Opérateur - Saisie en Temps Réel

**Version**: 1.0  
**Date**: 3 Décembre 2025  
**Branche**: `uioperateur`  
**Statut**: 📝 Phase de documentation

---

## 🎯 Objectif

Permettre aux **opérateurs de production** de saisir les données de performance directement depuis leur poste de travail, en temps réel, sans passer par les systèmes d'information traditionnels (ERP, MES).

Cette interface complète les sources de données existantes (SQL, REST, CSV) en ajoutant une source **MANUAL** (saisie manuelle).

---

## 🧑‍🏭 Cas d'Usage Principal

### Contexte
- Un opérateur travaille sur une étape de production (ex: "Façonnage", "Assemblage")
- Il dispose d'un terminal/tablette/PC à son poste
- Il doit renseigner périodiquement les indicateurs de performance

### Workflow
1. L'opérateur ouvre l'interface web sur son terminal
2. Il s'identifie (nom ou badge) - optionnel selon configuration
3. Il sélectionne son poste de travail / étape de production
4. Il visualise les indicateurs à renseigner pour cette étape
5. Il saisit les valeurs actuelles
6. Il valide la saisie
7. Les données sont immédiatement disponibles dans le VSM Engine
8. Le diagramme VSM se met à jour en temps réel

---

## 📊 Données à Saisir

### Par ProcessStep (Étape de Production)

Chaque étape peut avoir des indicateurs spécifiques, mais voici les plus courants :

#### **Indicateurs de Performance Standard**
| Indicateur | Description | Unité | Fréquence de saisie |
|------------|-------------|-------|---------------------|
| **Cycle Time (C/T)** | Temps pour produire 1 unité | minutes | Toutes les heures |
| **Setup Time (C/O)** | Temps de changement de série | minutes | À chaque changement |
| **Uptime** | Disponibilité de la machine | % | Toutes les heures |
| **Quality Rate** | Taux de conformité | % | Fin de shift |
| **Production Count** | Nombre d'unités produites | unités | Toutes les heures |
| **Reject Count** | Nombre de rebuts | unités | Toutes les heures |
| **Downtime Reason** | Cause d'arrêt | texte | À chaque arrêt |

#### **Indicateurs Spécifiques (selon le type d'étape)**
- **Pour machines CNC** : Vitesse de coupe, usure outil
- **Pour assemblage manuel** : Nombre d'opérateurs présents
- **Pour contrôle qualité** : Nombre de défauts par type

### Par Inventory (Stock)

| Indicateur | Description | Unité | Fréquence |
|------------|-------------|-------|-----------|
| **Quantity** | Quantité en stock | unités | Toutes les 2h |
| **Lead Time** | Délai d'écoulement | jours | Calculé auto |

---

## 🖥️ Architecture de l'Interface

### Principe de Conception

**Interface minimaliste, optimisée pour la saisie rapide :**
- ✅ Grande police, contrôles tactiles
- ✅ Validation immédiate (pas de formulaire complexe)
- ✅ Feedback visuel instantané
- ✅ Mode plein écran possible (kiosque)
- ✅ Hors ligne tolérant (queue de saisies)

### Pages / Écrans

#### **1. Page de Sélection du Poste**
```
╔════════════════════════════════════════╗
║        VSM - Saisie Opérateur          ║
╠════════════════════════════════════════╣
║                                        ║
║   Sélectionnez votre poste :          ║
║                                        ║
║   ┌──────────────┐  ┌──────────────┐  ║
║   │  Prémedia    │  │  Impression  │  ║
║   │  🖨️          │  │  🖨️          │  ║
║   └──────────────┘  └──────────────┘  ║
║                                        ║
║   ┌──────────────┐  ┌──────────────┐  ║
║   │  Façonnage   │  │  Emballage   │  ║
║   │  ✂️          │  │  📦          │  ║
║   └──────────────┘  └──────────────┘  ║
║                                        ║
╚════════════════════════════════════════╝
```

#### **2. Page de Saisie des Indicateurs**
```
╔════════════════════════════════════════╗
║    Poste : Façonnage                   ║
║    Opérateur : Jean Dupont             ║
║    📅 03/12/2025  🕐 14:35            ║
╠════════════════════════════════════════╣
║                                        ║
║  Cycle Time (C/T)                      ║
║  ┌────────────────────────────┐        ║
║  │         15         │ min    │        ║
║  └────────────────────────────┘        ║
║  Dernière valeur : 14 min              ║
║                                        ║
║  Production (unités)                   ║
║  ┌────────────────────────────┐        ║
║  │        127         │ unités │        ║
║  └────────────────────────────┘        ║
║  Objectif : 150/jour                   ║
║                                        ║
║  Rebuts                                ║
║  ┌────────────────────────────┐        ║
║  │         3          │ unités │        ║
║  └────────────────────────────┘        ║
║                                        ║
║  Uptime (%)                            ║
║  ┌────────────────────────────┐        ║
║  │         92         │   %    │        ║
║  └────────────────────────────┘        ║
║                                        ║
║     ┌──────────────────────────┐       ║
║     │    ✓  VALIDER            │       ║
║     └──────────────────────────┘       ║
║                                        ║
║  [Retour]  [Historique]  [Aide]       ║
╚════════════════════════════════════════╝
```

#### **3. Page de Confirmation**
```
╔════════════════════════════════════════╗
║           ✓  Données envoyées          ║
╠════════════════════════════════════════╣
║                                        ║
║   Vos données ont été enregistrées     ║
║   avec succès.                         ║
║                                        ║
║   📊 Le diagramme VSM est à jour      ║
║                                        ║
║   Prochaine saisie : dans 1h00        ║
║                                        ║
║     ┌──────────────────────────┐       ║
║     │    Nouvelle Saisie       │       ║
║     └──────────────────────────┘       ║
║                                        ║
║     ┌──────────────────────────┐       ║
║     │    Voir Historique       │       ║
║     └──────────────────────────┘       ║
║                                        ║
╚════════════════════════════════════════╝
```

#### **4. Page Historique**
```
╔════════════════════════════════════════╗
║    Historique - Façonnage              ║
╠════════════════════════════════════════╣
║                                        ║
║  📅 Aujourd'hui                        ║
║                                        ║
║  🕐 14:35  C/T: 15min  Prod: 127      ║
║  🕐 13:30  C/T: 14min  Prod: 115      ║
║  🕐 12:30  C/T: 16min  Prod: 98       ║
║  🕐 11:30  C/T: 15min  Prod: 85       ║
║                                        ║
║  📅 Hier                               ║
║                                        ║
║  🕐 16:30  C/T: 14min  Prod: 145      ║
║  🕐 15:30  C/T: 15min  Prod: 132      ║
║  ...                                   ║
║                                        ║
║     ┌──────────────────────────┐       ║
║     │        Retour            │       ║
║     └──────────────────────────┘       ║
║                                        ║
╚════════════════════════════════════════╝
```

---

## 🔧 Fonctionnalités Détaillées

### F1 - Sélection du Poste
**Description** : L'opérateur choisit son poste de travail parmi les ProcessSteps disponibles

**Règles** :
- Afficher uniquement les postes actifs du diagramme courant
- Grandes cartes tactiles (min 120x120px)
- Icône + nom du poste
- Possibilité de filtrer/rechercher si > 10 postes

**Données** :
- Liste des ProcessSteps depuis le VSM Engine (`GET /api/vsm/process-steps`)

---

### F2 - Identification Opérateur (Optionnelle)
**Description** : L'opérateur peut s'identifier pour tracer qui a saisi quoi

**Options** :
1. **Mode anonyme** : pas d'identification
2. **Mode simple** : saisie du nom
3. **Mode badge** : scan de badge NFC/QR code

**Données stockées** :
```json
{
  "operatorId": "jean.dupont",
  "operatorName": "Jean Dupont",
  "timestamp": "2025-12-03T14:35:00Z"
}
```

---

### F3 - Saisie des Indicateurs
**Description** : Formulaire de saisie avec les indicateurs configurés pour l'étape

**Règles** :
- Afficher uniquement les indicateurs de type MANUAL pour cette étape
- Champs numériques avec clavier numérique (tactile)
- Afficher l'unité à côté du champ
- Afficher la dernière valeur saisie (référence)
- Afficher l'objectif si défini
- Validation en temps réel (min/max, format)

**Types de champs** :
- `number` : pour valeurs numériques (C/T, production, etc.)
- `slider` : pour pourcentages (Uptime, Quality Rate)
- `select` : pour choix multiples (Downtime Reason)
- `textarea` : pour commentaires libres

**Validation** :
```javascript
{
  "cycleTime": { "min": 0, "max": 1000, "unit": "min" },
  "uptime": { "min": 0, "max": 100, "unit": "%" },
  "production": { "min": 0, "unit": "unités" }
}
```

---

### F4 - Envoi des Données
**Description** : Transmission des données au VSM Engine

**Endpoint API** : `POST /api/operator/submit`

**Payload** :
```json
{
  "processStepId": "façonnage",
  "operatorId": "jean.dupont",
  "timestamp": "2025-12-03T14:35:00Z",
  "indicators": [
    {
      "indicatorId": "cycle_time",
      "value": 15,
      "unit": "min"
    },
    {
      "indicatorId": "production_count",
      "value": 127,
      "unit": "unités"
    },
    {
      "indicatorId": "reject_count",
      "value": 3,
      "unit": "unités"
    },
    {
      "indicatorId": "uptime",
      "value": 92,
      "unit": "%"
    }
  ],
  "comments": "Changement d'outil à 13h30"
}
```

**Réponse** :
```json
{
  "success": true,
  "message": "Données enregistrées avec succès",
  "submissionId": "sub_20251203_143500_001",
  "nextSubmissionTime": "2025-12-03T15:35:00Z"
}
```

---

### F5 - Feedback Visuel
**Description** : Confirmation immédiate de la saisie

**Éléments** :
- ✅ Icône de succès (grande, verte)
- Message clair "Données envoyées"
- Indication du prochain moment de saisie
- Bouton pour nouvelle saisie immédiate

**En cas d'erreur** :
- ❌ Icône d'erreur (rouge)
- Message d'erreur explicite
- Bouton "Réessayer"
- Option "Sauvegarder hors ligne"

---

### F6 - Historique des Saisies
**Description** : Consultation des saisies précédentes

**Affichage** :
- Liste chronologique inversée (plus récent en haut)
- Groupement par jour
- Affichage des principales valeurs
- Possibilité d'exporter en CSV

**Endpoint API** : `GET /api/operator/history/{processStepId}`

---

### F7 - Mode Hors Ligne
**Description** : Continuer à saisir même sans connexion réseau

**Fonctionnement** :
1. Les saisies sont stockées localement (LocalStorage/IndexedDB)
2. Un indicateur visuel montre l'état "Hors ligne"
3. Dès que la connexion revient, les saisies en attente sont envoyées
4. L'opérateur reçoit une notification de synchronisation

**Queue** :
```json
{
  "pendingSubmissions": [
    { "timestamp": "...", "data": {...}, "status": "pending" },
    { "timestamp": "...", "data": {...}, "status": "pending" }
  ]
}
```

---

### F8 - Rappels et Notifications
**Description** : Rappeler à l'opérateur de saisir les données

**Options** :
1. **Notification navigateur** : "Il est temps de saisir vos données"
2. **Compteur visuel** : "Prochaine saisie dans 45 min"
3. **Alerte sonore** : bip discret (optionnel)

**Configuration** :
- Fréquence de saisie par indicateur (ex: toutes les heures)
- Fenêtre de tolérance (ex: ±15 min)
- Activation/désactivation des rappels

---

## 🔐 Sécurité et Permissions

### Niveaux d'Accès

| Rôle | Permissions |
|------|-------------|
| **Opérateur** | Saisir données pour son poste uniquement |
| **Chef d'équipe** | Saisir + consulter historique complet |
| **Superviseur** | Tout + configuration des indicateurs |
| **Admin** | Configuration complète |

### Authentification

**Options** :
1. **IP Lock** : Terminal fixe, pas d'authentification
2. **PIN Code** : Code à 4 chiffres
3. **Badge NFC** : Scan de badge
4. **SSO** : Intégration avec annuaire entreprise (LDAP/AD)

---

## 📱 Technologies Envisagées

### Frontend (Interface Web)

**Option 1 : Application Web Progressive (PWA)**
- **Technologie** : React ou Vue.js
- **Avantages** : 
  - Fonctionne sur tous les appareils (PC, tablette, smartphone)
  - Installable comme une app native
  - Mode hors ligne natif (Service Workers)
  - Pas de store, déploiement direct
- **Framework UI** : Material-UI ou Vuetify (composants tactiles)

**Option 2 : Page HTML/JavaScript Simple**
- **Technologie** : HTML5 + Vanilla JS + Bootstrap
- **Avantages** :
  - Ultra léger, chargement instantané
  - Pas de dépendances lourdes
  - Facile à maintenir
- **Inconvénient** : Moins riche en fonctionnalités

**Recommandation** : Démarrer avec Option 2 (simple), évoluer vers Option 1 si besoin

---

### Backend (API)

**Extension du VSM Engine existant (Spring Boot)**

**Nouveaux endpoints** :
```
GET  /api/operator/workstations          - Liste des postes disponibles
GET  /api/operator/indicators/{stepId}   - Indicateurs à saisir pour un poste
POST /api/operator/submit                - Soumettre une saisie
GET  /api/operator/history/{stepId}      - Historique des saisies
GET  /api/operator/status                - Statut (en ligne, dernière sync)
```

**Nouveau service** : `OperatorInputService.java`
**Nouveau repository** : `OperatorSubmissionRepository.java`
**Nouveau modèle** : `OperatorSubmission.java`

---

### Base de Données

**Nouvelle table : `operator_submissions`**

```sql
CREATE TABLE operator_submissions (
    id SERIAL PRIMARY KEY,
    submission_id VARCHAR(50) UNIQUE NOT NULL,
    process_step_id VARCHAR(50) NOT NULL,
    operator_id VARCHAR(50),
    operator_name VARCHAR(100),
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (process_step_id) REFERENCES process_steps(id)
);

CREATE TABLE operator_submission_values (
    id SERIAL PRIMARY KEY,
    submission_id VARCHAR(50) NOT NULL,
    indicator_id VARCHAR(50) NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20),
    comments TEXT,
    
    FOREIGN KEY (submission_id) REFERENCES operator_submissions(submission_id),
    FOREIGN KEY (indicator_id) REFERENCES indicators(id)
);
```

---

## 🔄 Intégration avec le Système Existant

### 1. Extension du Modèle EMF

Ajouter un nouveau type de DataSource dans `vsm.ecore` :

```xml
<eClassifiers xsi:type="ecore:EEnum" name="DataSourceType">
  <eLiterals name="STATIC" value="0"/>
  <eLiterals name="SQL" value="1"/>
  <eLiterals name="REST" value="2"/>
  <eLiterals name="MANUAL" value="3"/>  <!-- NOUVEAU -->
</eClassifiers>
```

### 2. Configuration dans VSM Studio

Dans le **Dialogue de Configuration > Onglet "Indicateurs"** :

Ajouter une option de type de source :
```
Source de données : [Dropdown]
  - Static (Valeur fixe)
  - SQL (Base de données)
  - REST (API externe)
  - Manual (Saisie opérateur)  ← NOUVEAU
```

Si "Manual" est sélectionné :
- Afficher fréquence de saisie recommandée
- Afficher dernier opérateur ayant saisi
- Afficher dernière valeur saisie

### 3. Nouveau Connecteur

Créer `ManualConnector.java` dans `engine/connector/` :

```java
public class ManualConnector implements DataConnector {
    
    @Override
    public String fetchValue(DataConnection connection) {
        // Récupérer la dernière valeur saisie par un opérateur
        OperatorSubmission lastSubmission = 
            submissionRepository.findLatestByIndicator(
                connection.getIndicatorId()
            );
        
        return lastSubmission != null 
            ? lastSubmission.getValue() 
            : null;
    }
}
```

### 4. Synchronisation Temps Réel

**Option A : Polling**
- VSM Studio interroge le backend toutes les 30s
- Simple, mais charge réseau

**Option B : WebSocket**
- Connexion persistante
- Push instantané dès qu'une saisie arrive
- Plus efficace

**Option C : Server-Sent Events (SSE)**
- Compromis entre les deux
- Push unidirectionnel (backend → frontend)

**Recommandation** : Option C (SSE) pour MVP, Option B (WebSocket) pour version avancée

---

## 📊 Indicateurs de Performance de l'Interface

### Métriques à suivre

| Métrique | Objectif | Mesure |
|----------|----------|--------|
| **Temps de saisie moyen** | < 30 secondes | Temps entre ouverture et validation |
| **Taux d'erreur de saisie** | < 2% | Saisies invalidées / total |
| **Taux de complétion** | > 95% | Saisies effectuées / attendues |
| **Délai de synchronisation** | < 5 secondes | Temps entre validation et MAJ VSM |
| **Disponibilité** | > 99% | Uptime de l'interface |

---

## 🎨 Principes UX/UI

### Design System

**Palette de couleurs** :
- 🟢 Vert : Succès, validation, en cours
- 🔴 Rouge : Erreur, alerte, rejet
- 🟡 Jaune : Attention, en attente
- 🔵 Bleu : Information, neutre
- ⚪ Gris : Désactivé, secondaire

**Typographie** :
- Titres : **24px bold**
- Labels : **18px regular**
- Valeurs : **32px bold** (grande visibilité)
- Aide : **14px italic**

**Espacements** :
- Marges : 16px minimum
- Padding boutons : 16px vertical, 24px horizontal
- Zone tactile minimale : 48x48px

**Accessibilité** :
- ✅ Contraste WCAG AA (4.5:1)
- ✅ Navigation clavier complète
- ✅ Textes alternatifs sur icônes
- ✅ Support lecteurs d'écran

---

## 🧪 Tests et Validation

### Scénarios de Test

#### **T1 : Saisie Nominale**
1. Sélectionner un poste
2. Saisir des valeurs valides
3. Valider
4. Vérifier confirmation
5. Vérifier MAJ dans VSM Engine

**Résultat attendu** : Données enregistrées et diagramme mis à jour

---

#### **T2 : Saisie Invalide**
1. Saisir une valeur hors limites (ex: Uptime = 150%)
2. Tenter de valider

**Résultat attendu** : Message d'erreur, impossible de valider

---

#### **T3 : Mode Hors Ligne**
1. Couper la connexion réseau
2. Effectuer une saisie
3. Vérifier stockage local
4. Rétablir la connexion
5. Vérifier envoi automatique

**Résultat attendu** : Saisie conservée et envoyée dès reconnexion

---

#### **T4 : Saisies Multiples Rapides**
1. Saisir 5 fois de suite avec des valeurs différentes
2. Vérifier ordre dans historique
3. Vérifier cohérence dans backend

**Résultat attendu** : Toutes les saisies enregistrées dans l'ordre

---

#### **T5 : Performance sur Tablette**
1. Ouvrir sur iPad/Android
2. Mesurer temps de chargement
3. Tester saisie tactile
4. Tester en plein soleil (lisibilité)

**Résultat attendu** : < 2s chargement, saisie fluide, lisible

---

## 📅 Roadmap de Développement

### Phase 1 : MVP (2 semaines)
- [x] Documentation (ce document)
- [ ] Backend API (endpoints de base)
- [ ] Interface web simple (HTML/JS/Bootstrap)
- [ ] Saisie de 3 indicateurs standards (C/T, Production, Uptime)
- [ ] Test sur 1 poste pilote

### Phase 2 : Fonctionnalités Avancées (2 semaines)
- [ ] Historique des saisies
- [ ] Mode hors ligne
- [ ] Validation avancée
- [ ] Multi-postes
- [ ] Déploiement sur plusieurs postes

### Phase 3 : Optimisations (1 semaine)
- [ ] PWA (installable)
- [ ] Notifications
- [ ] Rappels automatiques
- [ ] Export CSV
- [ ] Dashboard opérateur

### Phase 4 : Intégration VSM Studio (1 semaine)
- [ ] Configuration MANUAL dans Dialog
- [ ] Visualisation temps réel dans Canvas
- [ ] Indicateur "Dernière saisie opérateur"
- [ ] Alertes si saisie manquante

---

## 🤝 Parties Prenantes

| Rôle | Responsabilité |
|------|----------------|
| **Opérateurs** | Utilisateurs finaux, saisie quotidienne |
| **Chefs d'équipe** | Supervision, validation des données |
| **IT/Développeurs** | Développement, maintenance technique |
| **Lean Manager** | Définition des indicateurs, analyse |
| **Direction** | Validation budgétaire, ROI |

---

## 💡 Points d'Attention

### Risques Identifiés

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| **Oubli de saisie** | Moyen | Haute | Rappels automatiques |
| **Erreurs de saisie** | Moyen | Moyenne | Validation stricte + historique |
| **Résistance au changement** | Élevé | Moyenne | Formation, simplicité |
| **Panne réseau** | Faible | Faible | Mode hors ligne |
| **Surcharge cognitive** | Moyen | Moyenne | Interface minimaliste |

### Facteurs de Succès

✅ **Simplicité** : Moins de 30s pour saisir  
✅ **Fiabilité** : Toujours disponible, même hors ligne  
✅ **Feedback** : Retour immédiat sur la saisie  
✅ **Formation** : 5 minutes suffisent pour apprendre  
✅ **Adhésion** : Les opérateurs voient la valeur ajoutée  

---

## 📚 Références

- [VSM Studio - Conception](./conception_vsm_studio.md)
- [VSM Engine - API Documentation](./openapi.yaml)
- [VSM Data Model](./VSM_Data_Model_Specification_Detailed.md)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)
- [Material Design - Touch Targets](https://material.io/design/usability/accessibility.html)

---

**Document maintenu par** : VSM Studio Team  
**Prochaine révision** : Après validation phase 1  
**Questions/Feedback** : À remonter via GitHub Issues

