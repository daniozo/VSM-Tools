# Architecture Base de Données - VSM Studio

## Vue d'ensemble

VSM Studio adopte une architecture **PostgreSQL + VSMX Export** pour supporter les fonctionnalités avancées :
- Multi-utilisateur
- Temps réel avec l'Engine
- Agent conversationnel avec recherche sémantique
- Historique complet des indicateurs

## Architecture Globale

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           VSM Studio (Electron)                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Config UI   │  │ Canvas      │  │ Analysis    │  │ Agent Chat          │ │
│  │ (Dialog)    │  │ (maxGraph)  │  │ (Alertes)   │  │ (Conversationnel)   │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
│         └────────────────┴────────────────┴─────────────────────┘            │
│                                    │                                         │
│                           ┌────────▼────────┐                               │
│                           │   API Client    │                               │
│                           │   (REST/WS)     │                               │
│                           └────────┬────────┘                               │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │ HTTPS/WSS
┌────────────────────────────────────┼────────────────────────────────────────┐
│                              VSM Engine (Node.js)                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ REST API    │  │ WebSocket   │  │ Analysis    │  │ AI/LLM Service      │ │
│  │ (CRUD)      │  │ (Real-time) │  │ Engine      │  │ (Agent Logic)       │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
│         └────────────────┴────────────────┴─────────────────────┘            │
│                                    │                                         │
│                           ┌────────▼────────┐                               │
│                           │   Prisma ORM    │                               │
│                           └────────┬────────┘                               │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │
                           ┌─────────▼─────────┐
                           │   PostgreSQL      │
                           │   + pgvector      │
                           └───────────────────┘
```

## Schéma de Base de Données

### Organisations et Utilisateurs

```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'viewer', -- admin, editor, viewer
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Projets et Diagrammes

```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE diagrams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) DEFAULT 'Main Diagram',
    version INT DEFAULT 1,
    layout_data JSONB, -- Positions calculées par l'algorithme
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Éléments du Diagramme VSM

```sql
-- Acteurs (Supplier, Customer, ControlCenter)
CREATE TABLE actors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diagram_id UUID REFERENCES diagrams(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'supplier', 'customer', 'control_center'
    name VARCHAR(255) NOT NULL,
    properties JSONB DEFAULT '{}',
    position_x FLOAT,
    position_y FLOAT
);

-- Étapes de processus
CREATE TABLE process_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diagram_id UUID REFERENCES diagrams(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sequence_order INT NOT NULL,
    operators JSONB DEFAULT '[]',
    properties JSONB DEFAULT '{}',
    position_x FLOAT,
    position_y FLOAT
);

-- Inventaires
CREATE TABLE inventories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diagram_id UUID REFERENCES diagrams(id) ON DELETE CASCADE,
    name VARCHAR(255),
    before_step_id UUID REFERENCES process_steps(id),
    after_step_id UUID REFERENCES process_steps(id),
    properties JSONB DEFAULT '{}'
);

-- Séquences de flux matériel
CREATE TABLE flow_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diagram_id UUID REFERENCES diagrams(id) ON DELETE CASCADE,
    source_type VARCHAR(50),
    source_id UUID,
    target_type VARCHAR(50),
    target_id UUID,
    flow_type VARCHAR(50) DEFAULT 'push',
    properties JSONB DEFAULT '{}'
);

-- Flux d'information
CREATE TABLE information_flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diagram_id UUID REFERENCES diagrams(id) ON DELETE CASCADE,
    source_id UUID,
    target_id UUID,
    label VARCHAR(255),
    flow_type VARCHAR(50),
    frequency VARCHAR(100),
    properties JSONB DEFAULT '{}'
);

-- Sources de données
CREATE TABLE data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diagram_id UUID REFERENCES diagrams(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    connection_config JSONB,
    refresh_interval INT,
    is_active BOOLEAN DEFAULT true
);
```

### Indicateurs et Mesures

```sql
CREATE TABLE indicator_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit VARCHAR(50),
    formula TEXT,
    category VARCHAR(100),
    is_standard BOOLEAN DEFAULT false
);

CREATE TABLE element_indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diagram_id UUID REFERENCES diagrams(id) ON DELETE CASCADE,
    element_type VARCHAR(50),
    element_id UUID,
    indicator_id UUID REFERENCES indicator_definitions(id),
    data_source_id UUID REFERENCES data_sources(id),
    target_value FLOAT,
    warning_threshold FLOAT,
    critical_threshold FLOAT
);

CREATE TABLE indicator_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    element_indicator_id UUID REFERENCES element_indicators(id) ON DELETE CASCADE,
    value FLOAT NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    source VARCHAR(100)
);

CREATE INDEX idx_indicator_values_time 
    ON indicator_values(element_indicator_id, recorded_at DESC);
```

### Analyse et Alertes

```sql
CREATE TABLE analysis_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diagram_id UUID REFERENCES diagrams(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(20) DEFAULT 'warning',
    condition_config JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE analysis_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID REFERENCES analysis_rules(id) ON DELETE CASCADE,
    element_type VARCHAR(50),
    element_id UUID,
    message TEXT,
    severity VARCHAR(20),
    is_acknowledged BOOLEAN DEFAULT false,
    acknowledged_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);
```

### Agent Conversationnel

```sql
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    project_id UUID REFERENCES projects(id),
    context JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE agent_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES chat_messages(id),
    action_type VARCHAR(100) NOT NULL,
    parameters JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    executed_at TIMESTAMPTZ,
    result JSONB
);

-- Base de connaissances avec recherche vectorielle
CREATE TABLE knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(1536), -- pgvector pour recherche sémantique
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_knowledge_embedding 
    ON knowledge_base USING ivfflat (embedding vector_cosine_ops);
```

## Rôle du fichier VSMX

Le VSMX devient un **format d'échange**, pas de stockage principal :

### Utilisations du VSMX
1. **Export/Import** entre organisations
2. **Backup local** pour archivage
3. **Mode hors-ligne** avec synchronisation
4. **Version control** (git-friendly)
5. **Compatibilité** avec outils tiers

### Service d'Export/Import

```typescript
interface VSMXExportOptions {
  includeIndicatorValues: boolean;
  includeAnalysisRules: boolean;
  includeLayout: boolean;
  format: 'xmi' | 'json';
}

class VSMXExporter {
  async exportProject(projectId: string, options: VSMXExportOptions): Promise<string>;
  async importProject(vsmxContent: string, organizationId: string): Promise<Project>;
}
```

## Comparaison des Options

| Aspect | BD Seule | VSMX + SQLite | **PostgreSQL + VSMX** |
|--------|----------|---------------|----------------------|
| Multi-utilisateur | ❌ | ❌ | ✅ |
| Temps réel | Limité | Moyen | ✅ Excellent |
| Agent IA | Difficile | Possible | ✅ Optimal |
| Historique | Limité | Moyen | ✅ Illimité |
| Portabilité | ❌ | ✅ | ✅ Via export |
| Mode hors-ligne | ✅ | ✅ | ⚠️ Sync requis |
| Recherche sémantique | ❌ | ❌ | ✅ pgvector |

## Prochaines étapes

1. **Engine Node.js** - API REST + WebSocket
2. **Prisma Schema** - Génération du client typé
3. **Migration** - Scripts de création des tables
4. **VSMX Exporter** - Service d'export/import
