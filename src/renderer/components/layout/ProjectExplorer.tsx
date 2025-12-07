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

import React, { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
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
  LayoutDashboard
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
  className?: string
}

// Données de démonstration - À remplacer par les vraies données du store
const demoProjects: TreeNode[] = [
  {
    id: 'project-1',
    name: 'Ligne_Production_Cintres',
    type: 'project',
    children: [
      {
        id: 'diagram-1',
        name: 'diagram.vsmx',
        type: 'file',
        icon: <FileBox className="h-4 w-4 text-blue-500" />,
        children: [
          {
            id: 'actors-group',
            name: 'Acteurs',
            type: 'entity-group',
            icon: <Users className="h-4 w-4" />,
            children: [
              { id: 'supplier-1', name: 'Fournisseur Acier', type: 'entity', entityType: 'supplier', icon: <Truck className="h-4 w-4" /> },
              { id: 'customer-1', name: 'Client Distribution', type: 'entity', entityType: 'customer', icon: <Users className="h-4 w-4" /> },
            ]
          },
          {
            id: 'steps-group',
            name: 'Étapes de Processus',
            type: 'entity-group',
            icon: <Factory className="h-4 w-4" />,
            children: [
              { id: 'step-1', name: 'Nettoyage', type: 'entity', entityType: 'process-step', icon: <Factory className="h-4 w-4" /> },
              { id: 'step-2', name: 'Façonnage', type: 'entity', entityType: 'process-step', icon: <Factory className="h-4 w-4" /> },
              { id: 'step-3', name: 'Emballage', type: 'entity', entityType: 'process-step', icon: <Factory className="h-4 w-4" /> },
            ]
          },
          {
            id: 'flows-group',
            name: 'Flux',
            type: 'entity-group',
            icon: <ArrowRight className="h-4 w-4" />,
            children: [
              { id: 'flow-1', name: 'Flux Matériel 1', type: 'entity', entityType: 'material-flow', icon: <ArrowRight className="h-4 w-4" /> },
            ]
          },
          {
            id: 'inventory-group',
            name: 'Stocks',
            type: 'entity-group',
            icon: <Package className="h-4 w-4" />,
            children: [
              { id: 'inv-1', name: 'Stock Initial', type: 'entity', entityType: 'inventory', icon: <Package className="h-4 w-4" /> },
              { id: 'inv-2', name: 'Stock Final', type: 'entity', entityType: 'inventory', icon: <Package className="h-4 w-4" /> },
            ]
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
        id: 'actionplan-1',
        name: 'action_plan.md',
        type: 'file',
        icon: <FileText className="h-4 w-4 text-green-500" />,
      },
      {
        id: 'notes-1',
        name: 'notes.md',
        type: 'file',
        icon: <FileText className="h-4 w-4 text-yellow-500" />,
      },
      {
        id: 'exports-1',
        name: 'exports',
        type: 'folder',
        icon: <Folder className="h-4 w-4" />,
        children: []
      },
    ]
  }
]

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
  className
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['project-1', 'diagram-1']))
  const [localSelectedId, setLocalSelectedId] = useState<string | null>(selectedElementId)

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

      {/* Arborescence */}
      <ScrollArea className="flex-1">
        <div className="py-2">
          {demoProjects.map(project => (
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

      {/* Pied avec boutons d'action */}
      <div className="flex items-center gap-1 p-2 border-t">
        <Button variant="ghost" size="sm" className="h-7 text-xs">
          Nouveau Projet
        </Button>
      </div>
    </div>
  )
}
