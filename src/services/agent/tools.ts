/**
 * Définitions des outils disponibles pour l'agent VSM
 * 
 * Chaque outil définit une action que l'agent peut proposer
 */

import { ToolDefinition } from './types'

export const VSM_TOOLS: ToolDefinition[] = [
  // ============================================
  // OUTILS DE LECTURE / ANALYSE
  // ============================================
  {
    name: 'get_diagram_summary',
    description: 'Récupère un résumé complet du diagramme VSM actuel',
    category: 'analysis',
    parameters: [],
    requiresConfirmation: false
  },
  {
    name: 'get_node_details',
    description: 'Récupère les détails complets d\'un nœud/étape',
    category: 'analysis',
    parameters: [
      {
        name: 'nodeId',
        type: 'string',
        description: 'ID du nœud',
        required: true
      }
    ],
    requiresConfirmation: false
  },
  {
    name: 'calculate_metrics',
    description: 'Calcule les métriques VSM (lead time, cycle time, efficacité)',
    category: 'analysis',
    parameters: [],
    requiresConfirmation: false
  },
  {
    name: 'identify_bottlenecks',
    description: 'Identifie les goulots d\'étranglement dans le flux',
    category: 'analysis',
    parameters: [
      {
        name: 'threshold',
        type: 'number',
        description: 'Seuil de temps de cycle pour considérer comme goulot (en secondes)',
        required: false,
        default: 0
      }
    ],
    requiresConfirmation: false
  },
  {
    name: 'analyze_wastes',
    description: 'Analyse et identifie les gaspillages (MUDA) dans le processus',
    category: 'analysis',
    parameters: [],
    requiresConfirmation: false
  },

  // ============================================
  // OUTILS DE MODIFICATION - NŒUDS
  // ============================================
  {
    name: 'add_process_step',
    description: 'Ajoute une nouvelle étape de processus au diagramme',
    category: 'node',
    parameters: [
      {
        name: 'name',
        type: 'string',
        description: 'Nom de l\'étape',
        required: true
      },
      {
        name: 'cycleTime',
        type: 'number',
        description: 'Temps de cycle en secondes',
        required: false,
        default: 0
      },
      {
        name: 'operators',
        type: 'number',
        description: 'Nombre d\'opérateurs',
        required: false,
        default: 1
      },
      {
        name: 'position',
        type: 'number',
        description: 'Position dans la séquence (index)',
        required: false
      }
    ],
    requiresConfirmation: true,
    confirmationMessage: (args) =>
      `Voulez-vous ajouter l'étape "${args.name}" avec un temps de cycle de ${args.cycleTime || 0}s ?`
  },
  {
    name: 'update_node',
    description: 'Met à jour les propriétés d\'un nœud existant',
    category: 'node',
    parameters: [
      {
        name: 'nodeId',
        type: 'string',
        description: 'ID du nœud à modifier',
        required: true
      },
      {
        name: 'name',
        type: 'string',
        description: 'Nouveau nom',
        required: false
      },
      {
        name: 'cycleTime',
        type: 'number',
        description: 'Nouveau temps de cycle en secondes',
        required: false
      },
      {
        name: 'changeoverTime',
        type: 'number',
        description: 'Nouveau temps de changement en secondes',
        required: false
      },
      {
        name: 'uptime',
        type: 'number',
        description: 'Nouveau taux de disponibilité (0-100)',
        required: false
      },
      {
        name: 'operators',
        type: 'number',
        description: 'Nouveau nombre d\'opérateurs',
        required: false
      }
    ],
    requiresConfirmation: true,
    confirmationMessage: (args) => {
      const changes = Object.entries(args)
        .filter(([key, value]) => key !== 'nodeId' && value !== undefined)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ')
      return `Voulez-vous modifier le nœud avec les changements suivants: ${changes} ?`
    }
  },
  {
    name: 'delete_node',
    description: 'Supprime un nœud du diagramme',
    category: 'node',
    parameters: [
      {
        name: 'nodeId',
        type: 'string',
        description: 'ID du nœud à supprimer',
        required: true
      }
    ],
    requiresConfirmation: true,
    confirmationMessage: () =>
      `⚠️ Êtes-vous sûr de vouloir supprimer ce nœud ? Cette action est irréversible.`
  },

  // ============================================
  // OUTILS DE MODIFICATION - STOCKS
  // ============================================
  {
    name: 'add_inventory',
    description: 'Ajoute un stock entre deux étapes',
    category: 'inventory',
    parameters: [
      {
        name: 'afterNodeId',
        type: 'string',
        description: 'ID du nœud après lequel ajouter le stock',
        required: true
      },
      {
        name: 'quantity',
        type: 'number',
        description: 'Quantité en stock',
        required: false,
        default: 0
      },
      {
        name: 'waitingTime',
        type: 'number',
        description: 'Temps d\'attente en secondes',
        required: false,
        default: 0
      }
    ],
    requiresConfirmation: true,
    confirmationMessage: (args) =>
      `Voulez-vous ajouter un stock de ${args.quantity || 0} unités après le nœud ?`
  },
  {
    name: 'update_inventory',
    description: 'Met à jour un stock existant',
    category: 'inventory',
    parameters: [
      {
        name: 'sequenceOrder',
        type: 'number',
        description: 'Ordre de la séquence contenant le stock',
        required: true
      },
      {
        name: 'elementOrder',
        type: 'number',
        description: 'Ordre de l\'élément dans la séquence',
        required: true
      },
      {
        name: 'quantity',
        type: 'number',
        description: 'Nouvelle quantité',
        required: false
      },
      {
        name: 'waitingTime',
        type: 'number',
        description: 'Nouveau temps d\'attente en secondes',
        required: false
      }
    ],
    requiresConfirmation: true,
    confirmationMessage: () =>
      `Voulez-vous mettre à jour ce stock ?`
  },

  // ============================================
  // OUTILS DE MODIFICATION - FLUX D'INFORMATION
  // ============================================
  {
    name: 'add_information_flow',
    description: 'Ajoute un flux d\'information entre deux éléments',
    category: 'flow',
    parameters: [
      {
        name: 'sourceId',
        type: 'string',
        description: 'ID de l\'élément source',
        required: true
      },
      {
        name: 'targetId',
        type: 'string',
        description: 'ID de l\'élément cible',
        required: true
      },
      {
        name: 'label',
        type: 'string',
        description: 'Libellé du flux',
        required: false
      },
      {
        name: 'type',
        type: 'string',
        description: 'Type de flux',
        required: false,
        enum: ['manual', 'electronic', 'verbal'],
        default: 'electronic'
      }
    ],
    requiresConfirmation: true,
    confirmationMessage: (args) =>
      `Voulez-vous créer un flux d'information${args.label ? ` "${args.label}"` : ''} ?`
  },

  // ============================================
  // OUTILS D'AMÉLIORATION
  // ============================================
  {
    name: 'add_improvement_point',
    description: 'Ajoute un point d\'amélioration (Kaizen burst)',
    category: 'improvement',
    parameters: [
      {
        name: 'nodeId',
        type: 'string',
        description: 'ID du nœud concerné',
        required: true
      },
      {
        name: 'description',
        type: 'string',
        description: 'Description de l\'amélioration proposée',
        required: true
      },
      {
        name: 'priority',
        type: 'string',
        description: 'Priorité de l\'amélioration',
        required: false,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      },
      {
        name: 'expectedBenefit',
        type: 'string',
        description: 'Bénéfice attendu',
        required: false
      }
    ],
    requiresConfirmation: true,
    confirmationMessage: (args) =>
      `Voulez-vous ajouter un point d'amélioration: "${args.description}" ?`
  },

  // ============================================
  // OUTILS DE CONFIGURATION
  // ============================================
  {
    name: 'update_takt_time',
    description: 'Met à jour le Takt Time du diagramme',
    category: 'diagram',
    parameters: [
      {
        name: 'taktTime',
        type: 'number',
        description: 'Nouveau Takt Time en secondes',
        required: true
      }
    ],
    requiresConfirmation: true,
    confirmationMessage: (args) =>
      `Voulez-vous définir le Takt Time à ${args.taktTime} secondes ?`
  },
  {
    name: 'update_customer_demand',
    description: 'Met à jour la demande client',
    category: 'diagram',
    parameters: [
      {
        name: 'dailyDemand',
        type: 'number',
        description: 'Demande journalière',
        required: true
      },
      {
        name: 'unit',
        type: 'string',
        description: 'Unité de mesure',
        required: false,
        default: 'pièces'
      }
    ],
    requiresConfirmation: true,
    confirmationMessage: (args) =>
      `Voulez-vous définir la demande client à ${args.dailyDemand} ${args.unit || 'pièces'}/jour ?`
  },
  {
    name: 'open_configuration_dialog',
    description: 'Ouvrir la fenêtre de configuration complète du diagramme VSM',
    category: 'diagram',
    parameters: [],
    requiresConfirmation: false
  },

  // ============================================
  // OUTILS DE NOTES
  // ============================================
  {
    name: 'list_notes',
    description: 'Lister toutes les notes du projet',
    category: 'notes',
    parameters: [],
    requiresConfirmation: false
  },
  {
    name: 'create_note',
    description: 'Créer une nouvelle note dans le projet',
    category: 'notes',
    parameters: [
      {
        name: 'title',
        type: 'string',
        description: 'Titre de la note',
        required: true
      },
      {
        name: 'content',
        type: 'string',
        description: 'Contenu de la note',
        required: false,
        default: ''
      }
    ],
    requiresConfirmation: true,
    confirmationMessage: (args) =>
      `Voulez-vous créer la note "${args.title}" ?`
  },
  {
    name: 'update_note',
    description: 'Modifier une note existante',
    category: 'notes',
    parameters: [
      {
        name: 'noteId',
        type: 'string',
        description: 'ID de la note à modifier',
        required: true
      },
      {
        name: 'title',
        type: 'string',
        description: 'Nouveau titre',
        required: false
      },
      {
        name: 'content',
        type: 'string',
        description: 'Nouveau contenu',
        required: false
      }
    ],
    requiresConfirmation: true,
    confirmationMessage: () =>
      `Voulez-vous mettre à jour cette note ?`
  },

  // ============================================
  // OUTILS DE PLAN D'ACTION
  // ============================================
  {
    name: 'list_action_items',
    description: 'Lister toutes les actions du plan d\'action',
    category: 'actionplan',
    parameters: [],
    requiresConfirmation: false
  },
  {
    name: 'create_action_item',
    description: 'Créer une nouvelle action dans le plan d\'action',
    category: 'actionplan',
    parameters: [
      {
        name: 'action',
        type: 'string',
        description: 'Description de l\'action',
        required: true
      },
      {
        name: 'responsible',
        type: 'string',
        description: 'Personne responsable',
        required: false
      },
      {
        name: 'priority',
        type: 'string',
        description: 'Priorité de l\'action',
        required: false,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      },
      {
        name: 'dueDate',
        type: 'string',
        description: 'Date d\'échéance (format YYYY-MM-DD)',
        required: false
      }
    ],
    requiresConfirmation: true,
    confirmationMessage: (args) =>
      `Voulez-vous créer l'action "${args.action}" ?`
  },
  {
    name: 'update_action_item',
    description: 'Modifier une action existante (statut, priorité, responsable)',
    category: 'actionplan',
    parameters: [
      {
        name: 'actionId',
        type: 'string',
        description: 'ID de l\'action à modifier',
        required: true
      },
      {
        name: 'action',
        type: 'string',
        description: 'Nouvelle description',
        required: false
      },
      {
        name: 'status',
        type: 'string',
        description: 'Nouveau statut',
        required: false,
        enum: ['pending', 'in_progress', 'completed']
      },
      {
        name: 'priority',
        type: 'string',
        description: 'Nouvelle priorité',
        required: false,
        enum: ['low', 'medium', 'high']
      },
      {
        name: 'responsible',
        type: 'string',
        description: 'Nouveau responsable',
        required: false
      }
    ],
    requiresConfirmation: true,
    confirmationMessage: () =>
      `Voulez-vous mettre à jour cette action ?`
  },

  // ============================================
  // OUTILS D'ÉTAT FUTUR
  // ============================================
  {
    name: 'create_future_state',
    description: 'Créer un diagramme VSM état futur basé sur l\'état actuel avec les améliorations identifiées',
    category: 'futurestate',
    parameters: [
      {
        name: 'improvements',
        type: 'string',
        description: 'Liste des améliorations à appliquer (séparées par des virgules)',
        required: false
      },
      {
        name: 'targetLeadTimeReduction',
        type: 'number',
        description: 'Objectif de réduction du lead time en pourcentage',
        required: false,
        default: 30
      }
    ],
    requiresConfirmation: true,
    confirmationMessage: (args) =>
      `Voulez-vous créer un état futur avec un objectif de réduction de ${args.targetLeadTimeReduction || 30}% du lead time ?`
  }
]

/**
 * Récupère un outil par son nom
 */
export function getToolByName(name: string): ToolDefinition | undefined {
  return VSM_TOOLS.find(tool => tool.name === name)
}

/**
 * Récupère les outils par catégorie
 */
export function getToolsByCategory(category: string): ToolDefinition[] {
  return VSM_TOOLS.filter(tool => tool.category === category)
}

/**
 * Génère le schéma des outils pour l'API LLM (format OpenAI/Gemini)
 */
export function generateToolsSchema(): any[] {
  return VSM_TOOLS.map(tool => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: {
        type: 'object',
        properties: tool.parameters.reduce((acc, param) => {
          acc[param.name] = {
            type: param.type,
            description: param.description,
            ...(param.enum && { enum: param.enum }),
            ...(param.default !== undefined && { default: param.default })
          }
          return acc
        }, {} as Record<string, any>),
        required: tool.parameters
          .filter(p => p.required)
          .map(p => p.name)
      }
    }
  }))
}
