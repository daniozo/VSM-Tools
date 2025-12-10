/**
 * ProjectTreePanel - Arborescence simplifiée du projet VSM
 * Sans le dossier racine du projet, juste les éléments du diagramme
 */

import React, { useState } from 'react';
import { ScrollArea } from '@/renderer/components/ui/scroll-area';
import { Button } from '@/renderer/components/ui/button';
import { 
  ChevronRight, 
  ChevronDown,
  Truck, 
  Users, 
  Building2,
  Package,
  Link as LinkIcon,
  ArrowRight,
  Boxes
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVsmStore } from '@/store/vsmStore';
import type { VSMDiagram } from '@/shared/types/vsm-model';
import { NodeType } from '@/shared/types/vsm-model';

interface TreeNode {
  id: string;
  name: string;
  type: 'entity' | 'folder';
  icon?: React.ReactNode;
  children?: TreeNode[];
  entityType?: string;
}

interface ProjectTreePanelProps {
  width: number;
  selectedElementId: string | null;
  onSelect: (elementId: string, elementType: string) => void;
  className?: string;
}

/**
 * Construit l'arborescence à partir du diagramme VSM (sans dossier projet)
 */
function buildTreeFromDiagram(diagram: VSMDiagram | null): TreeNode[] {
  if (!diagram || !diagram.actors) return [];

  const nodes: TreeNode[] = [];
  
  // Acteurs
  const actorsChildren: TreeNode[] = [];
  
  if (diagram.actors?.supplier) {
    actorsChildren.push({
      id: 'supplier',
      name: diagram.actors.supplier.name || 'Fournisseur',
      type: 'entity',
      entityType: 'supplier',
      icon: <Truck className="h-4 w-4 text-purple-500" />
    });
  }
  
  if (diagram.actors?.customer) {
    actorsChildren.push({
      id: 'customer',
      name: diagram.actors.customer.name || 'Client',
      type: 'entity',
      entityType: 'customer',
      icon: <Users className="h-4 w-4 text-green-500" />
    });
  }
  
  if (diagram.actors?.controlCenter) {
    actorsChildren.push({
      id: 'control-center',
      name: diagram.actors.controlCenter.name || 'Planification',
      type: 'entity',
      entityType: 'control-center',
      icon: <Building2 className="h-4 w-4 text-blue-500" />
    });
  }

  if (actorsChildren.length > 0) {
    nodes.push({
      id: 'actors-group',
      name: 'Acteurs',
      type: 'folder',
      children: actorsChildren
    });
  }

  // Étapes de processus
  const stepsChildren: TreeNode[] = (diagram.nodes || [])
    .filter(node => node.type === NodeType.PROCESS_STEP)
    .map(node => ({
      id: node.id,
      name: node.name || 'Étape',
      type: 'entity' as const,
      entityType: 'process-step',
      icon: <Package className="h-4 w-4 text-orange-500" />
    }));

  if (stepsChildren.length > 0) {
    nodes.push({
      id: 'steps-group',
      name: 'Étapes de processus',
      type: 'folder',
      children: stepsChildren
    });
  }

  // Flux d'informations
  const infoFlowsChildren: TreeNode[] = (diagram.informationFlows || []).map((flow, index) => ({
    id: flow.id || `info-flow-${index}`,
    name: `Flux: ${flow.from} → ${flow.to}`,
    type: 'entity' as const,
    entityType: 'information-flow',
    icon: <LinkIcon className="h-4 w-4 text-cyan-500" />
  }));

  if (infoFlowsChildren.length > 0) {
    nodes.push({
      id: 'info-flows-group',
      name: 'Flux d\'information',
      type: 'folder',
      children: infoFlowsChildren
    });
  }

  // Stocks (inventaires) - extraits depuis flowSequences
  const inventoriesChildren: TreeNode[] = [];
  (diagram.flowSequences || []).forEach((sequence, seqIndex) => {
    (sequence.elements || []).forEach((element, elemIndex) => {
      if (element.type === 'Inventory' && element.inventory) {
        inventoriesChildren.push({
          id: `inventory-${seqIndex}-${elemIndex}`,
          name: element.inventory.label || 'Stock',
          type: 'entity' as const,
          entityType: 'inventory',
          icon: <Boxes className="h-4 w-4 text-amber-500" />
        });
      }
    });
  });

  if (inventoriesChildren.length > 0) {
    nodes.push({
      id: 'inventories-group',
      name: 'Stocks',
      type: 'folder',
      children: inventoriesChildren
    });
  }

  // Flux matériels - extraits depuis flowSequences
  const materialFlowsChildren: TreeNode[] = [];
  (diagram.flowSequences || []).forEach((sequence, seqIndex) => {
    if (sequence.fromNodeId && sequence.toNodeId) {
      // Trouver les noms des nœuds source et destination
      const fromNode = diagram.nodes?.find(n => n.id === sequence.fromNodeId);
      const toNode = diagram.nodes?.find(n => n.id === sequence.toNodeId);
      const fromName = fromNode?.name || sequence.fromNodeId;
      const toName = toNode?.name || sequence.toNodeId;
      
      materialFlowsChildren.push({
        id: `material-flow-${seqIndex}`,
        name: `${fromName} → ${toName}`,
        type: 'entity' as const,
        entityType: 'material-flow',
        icon: <ArrowRight className="h-4 w-4 text-blue-500" />
      });
    }
  });

  if (materialFlowsChildren.length > 0) {
    nodes.push({
      id: 'material-flows-group',
      name: 'Flux matériels',
      type: 'folder',
      children: materialFlowsChildren
    });
  }

  return nodes;
}

interface TreeNodeComponentProps {
  node: TreeNode;
  level: number;
  selectedId: string | null;
  onSelect: (node: TreeNode) => void;
}

const TreeNodeComponent: React.FC<TreeNodeComponentProps> = ({
  node,
  level,
  selectedId,
  onSelect
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-1 px-2 py-1.5 cursor-pointer hover:bg-muted rounded',
          selectedId === node.id && 'bg-muted',
          'text-sm'
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => onSelect(node)}
      >
        {hasChildren && (
          <button
            className="flex-shrink-0 p-0.5 hover:bg-background rounded"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-5" />}
        {node.icon && <span className="flex-shrink-0">{node.icon}</span>}
        <span className="flex-1 truncate">{node.name}</span>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children!.map(child => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const ProjectTreePanel: React.FC<ProjectTreePanelProps> = ({
  width,
  selectedElementId,
  onSelect,
  className
}) => {
  const diagram = useVsmStore(state => state.diagram);
  const tree = buildTreeFromDiagram(diagram);

  const handleSelect = (node: TreeNode) => {
    if (node.type === 'entity' && node.entityType) {
      onSelect(node.id, node.entityType);
    }
  };

  return (
    <div
      className={cn('flex flex-col bg-background border-r overflow-hidden', className)}
      style={{ width: `${width}px` }}
    >
      <div className="h-9 px-3 border-b flex items-center bg-muted/30">
        <span className="text-sm font-medium">Explorateur</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {tree.length > 0 ? (
            tree.map(node => (
              <TreeNodeComponent
                key={node.id}
                node={node}
                level={0}
                selectedId={selectedElementId}
                onSelect={handleSelect}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <p>Aucun élément</p>
              <p className="text-xs mt-1">Configurez votre diagramme</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ProjectTreePanel;
