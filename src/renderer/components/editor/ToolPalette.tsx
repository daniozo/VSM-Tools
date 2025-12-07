import React, { useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useVsmStore } from '@/store/vsmStore'
import { VsmElementType } from '@/shared/types/vsm-elements'
import {
  Box,
  ArrowRight,
  Zap,
  FileText,
  Users,
  Truck,
  Database,
  MousePointer,
  Clock
} from 'lucide-react'

export interface ToolPaletteProps {
  onToolSelect?: (toolId: string) => void
  className?: string
}

interface ToolItem {
  id: string
  name: string
  icon: React.ReactNode
  type: VsmElementType | 'pointer'
  description: string
  category: 'selection' | 'elements' | 'flows'
}

const tools: ToolItem[] = [
  // Outils de sélection
  {
    id: 'pointer',
    name: 'Sélection',
    icon: <MousePointer size={20} />,
    type: 'pointer',
    description: 'Sélectionner et déplacer des éléments',
    category: 'selection'
  },

  // Éléments VSM principaux
  {
    id: 'process',
    name: 'Processus',
    icon: <Box size={20} />,
    type: VsmElementType.PROCESS,
    description: 'Ajouter un processus de transformation',
    category: 'elements'
  },
  {
    id: 'stock',
    name: 'Stock',
    icon: <Database size={20} />,
    type: VsmElementType.STOCK,
    description: 'Ajouter un stock ou inventory',
    category: 'elements'
  },
  {
    id: 'supplier',
    name: 'Fournisseur',
    icon: <Truck size={20} />,
    type: VsmElementType.SUPPLIER,
    description: 'Ajouter un fournisseur externe',
    category: 'elements'
  },
  {
    id: 'customer',
    name: 'Client',
    icon: <Users size={20} />,
    type: VsmElementType.CUSTOMER,
    description: 'Ajouter un client',
    category: 'elements'
  },
  {
    id: 'dataBox',
    name: 'Boîte de données',
    icon: <FileText size={20} />,
    type: VsmElementType.DATA_BOX,
    description: 'Ajouter des métriques et données',
    category: 'elements'
  },
  {
    id: 'kaizenBurst',
    name: 'Kaizen',
    icon: <Zap size={20} />,
    type: VsmElementType.KAIZEN_BURST,
    description: 'Ajouter une opportunité d\'amélioration',
    category: 'elements'
  },
  {
    id: 'text',
    name: 'Texte',
    icon: <FileText size={20} />,
    type: VsmElementType.TEXT,
    description: 'Ajouter du texte libre',
    category: 'elements'
  },
  {
    id: 'timeline',
    name: 'Timeline',
    icon: <Clock size={20} />,
    type: VsmElementType.TIMELINE,
    description: 'Ajouter une timeline de processus',
    category: 'elements'
  },

  // Flux
  {
    id: 'flowArrow',
    name: 'Flèche de flux',
    icon: <ArrowRight size={20} />,
    type: VsmElementType.FLOW_ARROW,
    description: 'Connecter des éléments avec un flux',
    category: 'flows'
  }
]

const ToolPalette: React.FC<ToolPaletteProps> = ({ onToolSelect, className }) => {
  const [selectedTool, setSelectedTool] = useState<string>('pointer')
  const setActiveTool = useVsmStore(state => state.setActiveTool)

  const handleToolClick = useCallback((tool: ToolItem) => {
    setSelectedTool(tool.id)

    // Mise à jour du store global
    setActiveTool(tool.type === 'pointer' ? null : tool.type)

    // Callback externe
    onToolSelect?.(tool.id)
  }, [setActiveTool, onToolSelect])

  const renderToolsByCategory = (category: string, title: string) => {
    const categoryTools = tools.filter(tool => tool.category === category)

    return (
      <div key={category} className="mb-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-2 px-2">
          {title}
        </h3>
        <div className="space-y-1">
          {categoryTools.map(tool => (
            <Button
              key={tool.id}
              variant={selectedTool === tool.id ? "default" : "ghost"}
              size="sm"
              className={`
                w-full justify-start h-10 px-3
                ${selectedTool === tool.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
                }
              `}
              onClick={() => handleToolClick(tool)}
              title={tool.description}
            >
              <span className="mr-3 flex-shrink-0">{tool.icon}</span>
              <span className="text-left truncate">{tool.name}</span>
            </Button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Card className={`h-full ${className}`}>
      <CardContent className="p-4 space-y-4 h-full overflow-auto">
        <div className="border-b pb-2 mb-4">
          <h2 className="font-semibold text-sm text-foreground">
            Palette d'outils VSM
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Sélectionnez un outil et cliquez sur le canvas
          </p>
        </div>

        {renderToolsByCategory('selection', 'Sélection')}
        {renderToolsByCategory('elements', 'Éléments VSM')}
        {renderToolsByCategory('flows', 'Flux')}

        <div className="border-t pt-4 mt-6">
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Outil actuel:</strong></p>
            <p className="text-primary">
              {tools.find(t => t.id === selectedTool)?.name || 'Aucun'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ToolPalette
