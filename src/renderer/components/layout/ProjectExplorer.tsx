/**
 * ProjectExplorer - Panneau Explorateur de Projets
 * 
 * Selon conception_vsm_studio.md :
 * - Vue en arborescence des projets ouverts
 * - Pour chaque projet : diagram.vsmx, action_plan.md, notes.md, exports/
 * - Le fichier .vsmx est déroulable et révèle les entités du modèle
 * - Double-clic sur diagram.vsmx ouvre le diagramme
 * - Clic sur une entité met en surbrillance sur le canevas
 */

import React, { useState, useMemo } from 'react'
import { ScrollArea } from '@/renderer/components/ui/scroll-area'
import { Button } from '@/renderer/components/ui/button'
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  FileCode,
  FileBox,
  Users,
  Truck,
  Factory,
  ArrowRight,
  Package,
  Activity,
  LayoutDashboard,
  FolderPlus,
  Building2,
  Triangle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useVsmStore } from '@/store/vsmStore'
import { NodeType, VSMDiagram, Node, InformationFlow, FlowType, TransmissionType } from '@/shared/types/vsm-model'

// Types pour l'arborescence
interface TreeNode {
  id: string
  name: string
  type: 'project' | 'file' | 'folder' | 'entity-group' | 'entity'
  icon?: React.ReactNode
  children?: TreeNode[]
  entityType?: string
}

interface ProjectExplorerProps {
  width: number
  activeProject: string | null
  selectedElementId: string | null
  onSelect: (elementId: string, elementType: string) => void
  onNewProject?: () => void
  onOpenProject?: () => void
  className?: string
}

/**
 * Construit l'arborescence à partir du diagramme VSM
 */
function buildTreeFromDiagram(diagram: VSMDiagram | null, projectName: string = 'Projet VSM'): TreeNode[] {
  if (!diagram || !diagram.actors) return []

  const actorsChildren: TreeNode[] = []

  // Fournisseur
  if (diagram.actors?.supplier) {
    actorsChildren.push({
      id: 'supplier',
      name: diagram.actors.supplier.name || 'Fournisseur',
      type: 'entity',
      entityType: 'supplier',
      icon: <Truck className="h-4 w-4 text-purple-500" />
    })
  }

  // Client
  if (diagram.actors?.customer) {
    actorsChildren.push({
      id: 'customer',
      name: diagram.actors.customer.name || 'Client',
      type: 'entity',
      entityType: 'customer',
      icon: <Users className="h-4 w-4 text-green-500" />
    })
  }

  // Centre de contrôle
  if (diagram.actors?.controlCenter) {
    actorsChildren.push({
      id: 'control-center',
      name: diagram.actors.controlCenter.name || 'Planification',
      type: 'entity',
      entityType: 'control-center',
      icon: <Building2 className="h-4 w-4 text-blue-500" />
    })
  }

  // Étapes de processus
  const stepsChildren: TreeNode[] = (diagram.nodes || [])
    .filter((n: Node) => n.type === NodeType.PROCESS_STEP)
    .map((node: Node) => ({
      id: node.id,
      name: node.name,
      type: 'entity' as const,
      entityType: 'process-step',
      icon: <Factory className="h-4 w-4 text-blue-600" />
    }))

  // Inventaires (à partir des flowSequences) avec informations enrichies
  const inventoryChildren: TreeNode[] = []
  const materialFlowChildren: TreeNode[] = []

  // Labels pour les types de flux
  const flowTypeLabels: Record<FlowType, string> = {
    [FlowType.PUSH]: 'PUSH (Poussé)',
    [FlowType.PULL]: 'PULL (Tiré)',
    [FlowType.FIFO_LANE]: 'FIFO',
    [FlowType.KANBAN]: 'KANBAN'
  }

  // Labels pour les types de transmission d'information
  const transmissionLabels: Record<TransmissionType, string> = {
    [TransmissionType.ELECTRONIC]: 'Électronique',
    [TransmissionType.MANUAL]: 'Manuel',
    [TransmissionType.KANBAN]: 'Kanban',
    [TransmissionType.SCHEDULE]: 'Planning'
  }

  // Construire un map des noms de nœuds par ID
  const nodeNameById: Record<string, string> = {}
  for (const node of (diagram.nodes || [])) {
    nodeNameById[node.id] = node.name
  }
  // Ajouter supplier et customer
  nodeNameById['supplier'] = diagram.actors?.supplier?.name || 'Fournisseur'
  nodeNameById['customer'] = diagram.actors?.customer?.name || 'Client'
  if (diagram.actors?.controlCenter) {
    nodeNameById['control-center'] = diagram.actors.controlCenter.name || 'Planification'
  }

  for (const seq of (diagram.flowSequences || [])) {
    const fromName = nodeNameById[seq.fromNodeId] || seq.fromNodeId
    const toName = nodeNameById[seq.toNodeId] || seq.toNodeId

    for (const elem of (seq.intermediateElements || [])) {
      if (elem.type === 'INVENTORY' && elem.inventory) {
        const inv = elem.inventory
        const durationInfo = inv.duration ? ` (${inv.duration}j)` : ''
        const qtyInfo = inv.quantity ? ` - ${inv.quantity} unités` : ''
        inventoryChildren.push({
          id: inv.id,
          name: `${inv.name || 'Stock'}${durationInfo}${qtyInfo}`,
          type: 'entity',
          entityType: 'inventory',
          icon: <Triangle className="h-4 w-4 text-amber-500" />
        })
      }

      if (elem.type === 'MATERIAL_FLOW' && elem.materialFlow) {
        const mf = elem.materialFlow
        const flowTypeLabel = mf.flowType ? flowTypeLabels[mf.flowType] || mf.flowType : 'Non défini'
        materialFlowChildren.push({
          id: mf.id || `flow-${seq.order}-${elem.order}`,
          name: `${fromName} → ${toName} [${flowTypeLabel}]`,
          type: 'entity',
          entityType: 'material-flow',
          icon: <ArrowRight className="h-4 w-4 text-orange-500" />
        })
      }
    }
  }

  // Flux d'information avec détails enrichis
  const infoFlowChildren: TreeNode[] = (diagram.informationFlows || []).map((flow: InformationFlow) => {
    const sourceName = nodeNameById[flow.sourceNodeId] || flow.sourceNodeId
    const targetName = nodeNameById[flow.targetNodeId] || flow.targetNodeId
    const transmissionLabel = flow.transmissionType ? transmissionLabels[flow.transmissionType] || flow.transmissionType : ''
    const frequencyInfo = flow.frequency ? ` - ${flow.frequency}` : ''

    return {
      id: flow.id,
      name: `${flow.description || 'Flux'} (${sourceName} → ${targetName})${transmissionLabel ? ` [${transmissionLabel}]` : ''}${frequencyInfo}`,
      type: 'entity' as const,
      entityType: 'information-flow',
      icon: <ArrowRight className="h-4 w-4 text-cyan-500" />
    }
  })

  return [
    {
      id: 'project-root',
      name: projectName,
      type: 'project',
      children: [
        {
          id: 'diagram-file',
          name: 'Diagramme',
          type: 'file',
          icon: <FileBox className="h-4 w-4 text-blue-500" />,
          children: [
            {
              id: 'actors-group',
              name: 'Acteurs',
              type: 'entity-group',
              icon: <Users className="h-4 w-4" />,
              children: actorsChildren
            },
            {
              id: 'steps-group',
              name: 'Étapes de Processus',
              type: 'entity-group',
              icon: <Factory className="h-4 w-4" />,
              children: stepsChildren
            },
            {
              id: 'inventory-group',
              name: 'Stocks',
              type: 'entity-group',
              icon: <Package className="h-4 w-4" />,
              children: inventoryChildren
            },
            {
              id: 'material-flows-group',
              name: 'Flux Matériels',
              type: 'entity-group',
              icon: <ArrowRight className="h-4 w-4 text-orange-500" />,
              children: materialFlowChildren
            },
            {
              id: 'info-flows-group',
              name: 'Flux Information',
              type: 'entity-group',
              icon: <ArrowRight className="h-4 w-4" />,
              children: infoFlowChildren
            },
            {
              id: 'indicators-group',
              name: 'Indicateurs',
              type: 'entity-group',
              icon: <Activity className="h-4 w-4" />,
              children: []
            },
          ]
        },
        {
          id: 'actionplan-file',
          name: 'Plan d\'Action',
          type: 'file',
          icon: <FileText className="h-4 w-4 text-green-500" />,
        },
        {
          id: 'notes-file',
          name: 'Notes',
          type: 'file',
          icon: <FileText className="h-4 w-4 text-yellow-500" />,
        }
      ]
    }
  ]
}

// Composant pour un noeud de l'arbre
interface TreeNodeItemProps {
  node: TreeNode
  level: number
  selectedId: string | null
  expandedIds: Set<string>
  onToggle: (id: string) => void
  onSelect: (node: TreeNode) => void
  onDoubleClick: (node: TreeNode) => void
}

const TreeNodeItem: React.FC<TreeNodeItemProps> = ({
  node,
  level,
  selectedId,
  expandedIds,
  onToggle,
  onSelect,
  onDoubleClick
}) => {
  const hasChildren = node.children && node.children.length > 0
  const isExpanded = expandedIds.has(node.id)
  const isSelected = selectedId === node.id

  const getDefaultIcon = () => {
    switch (node.type) {
      case 'project':
        return isExpanded ? <FolderOpen className="h-4 w-4 text-amber-500" /> : <Folder className="h-4 w-4 text-amber-500" />
      case 'folder':
        return isExpanded ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />
      case 'file':
        return <FileCode className="h-4 w-4" />
      default:
        return <LayoutDashboard className="h-4 w-4" />
    }
  }

  return (
    <div>
      <div
        className={cn(
          'flex items-center h-7 px-1 cursor-pointer hover:bg-muted/50 rounded-sm',
          isSelected && 'bg-primary/10 text-primary'
        )}
        style={{ paddingLeft: `${level * 12 + 4}px` }}
        onClick={() => onSelect(node)}
        onDoubleClick={() => onDoubleClick(node)}
      >
        {/* Chevron pour les éléments avec enfants */}
        <div className="w-4 h-4 flex items-center justify-center mr-1">
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggle(node.id)
              }}
              className="p-0.5 hover:bg-muted rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          ) : null}
        </div>

        {/* Icône */}
        <span className="mr-2 flex-shrink-0">
          {node.icon || getDefaultIcon()}
        </span>

        {/* Nom */}
        <span className="text-sm truncate">{node.name}</span>
      </div>

      {/* Enfants */}
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map(child => (
            <TreeNodeItem
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onSelect={onSelect}
              onDoubleClick={onDoubleClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export const ProjectExplorer: React.FC<ProjectExplorerProps> = ({
  width,
  activeProject: _activeProject,
  selectedElementId,
  onSelect,
  onNewProject,
  onOpenProject,
  className
}) => {
  // Store VSM
  const { diagram, selectElement } = useVsmStore()

  // Récupérer le nom du projet actuel
  const [projectName, setProjectName] = React.useState<string>('Projet VSM');

  React.useEffect(() => {
    (async () => {
      try {
        const { useProjectsStore } = await import('@/store/projectsStore');
        const { currentProject } = useProjectsStore.getState();
        if (currentProject?.name) {
          setProjectName(currentProject.name);
        }
      } catch (error) {
        console.error('Erreur chargement nom projet:', error);
      }
    })();
  }, [diagram]);

  // Construire l'arborescence à partir du diagramme
  const projectTree = useMemo(() => buildTreeFromDiagram(diagram, projectName), [diagram, projectName])

  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(['project-root', 'diagram-file', 'actors-group', 'steps-group'])
  )
  const [localSelectedId, setLocalSelectedId] = useState<string | null>(selectedElementId)

  // Vérifier si un projet est ouvert (via le store)
  const hasOpenProject = diagram !== null

  const handleToggle = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSelect = (node: TreeNode) => {
    setLocalSelectedId(node.id)
    if (node.type === 'entity' && node.entityType) {
      onSelect(node.id, node.entityType)

      // Sélectionner aussi dans le store pour synchroniser avec le canvas
      if (node.entityType === 'process-step') {
        selectElement({ type: 'node', id: node.id })
      } else if (node.entityType === 'inventory') {
        // Pour l'inventaire, on a besoin de trouver sequenceOrder et elementOrder
        // Pour l'instant, on log juste
        console.log('Sélection inventaire:', node.id)
      }
    }
  }

  const handleDoubleClick = (node: TreeNode) => {
    if (node.type === 'file' && node.name.endsWith('.vsmx')) {
      console.log('Ouvrir le diagramme:', node.name)
      // TODO: Ouvrir le diagramme dans le canevas
    } else if (node.type === 'file' && node.name.endsWith('.md')) {
      console.log('Ouvrir le fichier:', node.name)
      // TODO: Ouvrir dans un éditeur markdown
    }
  }

  return (
    <div
      className={cn('flex flex-col bg-background border-r', className)}
      style={{ width: `${width}px` }}
    >
      {/* En-tête */}
      <div className="flex items-center justify-between h-9 px-3 border-b bg-muted/30">
        <span className="text-sm font-medium">Explorateur</span>
      </div>

      {hasOpenProject ? (
        /* Arborescence du projet */
        <ScrollArea className="flex-1">
          <div className="py-2">
            {projectTree.map(project => (
              <TreeNodeItem
                key={project.id}
                node={project}
                level={0}
                selectedId={localSelectedId}
                expandedIds={expandedIds}
                onToggle={handleToggle}
                onSelect={handleSelect}
                onDoubleClick={handleDoubleClick}
              />
            ))}
          </div>
        </ScrollArea>
      ) : (
        /* État vide - Aucun projet ouvert */
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <FolderPlus className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-sm font-semibold mb-2">Aucun projet ouvert</h3>
          <p className="text-xs text-muted-foreground mb-6 max-w-[200px]">
            Pour commencer, créez un nouveau projet ou ouvrez un projet existant.
          </p>
          <div className="flex flex-col gap-2 w-full max-w-[180px]">
            <Button
              variant="default"
              size="sm"
              className="w-full"
              onClick={onNewProject}
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              Créer un projet
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={onOpenProject}
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              Ouvrir un projet
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
