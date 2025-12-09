/**
 * Onglet 7 : Flux Matériels
 * 
 * Structure Eclipse :
 * - Table simple 4 colonnes [De, Vers, Type, Description]
 * - Auto-générée depuis les process steps
 * - Type éditable (PUSH, PULL, FIFO, SUPERMARKET)
 */

import React, { useState, useEffect } from 'react'
import {
  VSMDiagram,
  FlowType,
  NodeType,
  generateId
} from '@/shared/types/vsm-model'
import { FormTable, Column } from '../shared/FormTable'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/renderer/components/ui/select'

interface MaterialFlowsTabProps {
  diagram: VSMDiagram
  onUpdate: (updates: Partial<VSMDiagram>) => void
}

interface MaterialFlowData {
  id: string
  fromStep: string
  toStep: string
  type: FlowType | ''
  description: string
}

export const MaterialFlowsTab: React.FC<MaterialFlowsTabProps> = ({
  diagram,
  onUpdate
}) => {
  const [flows, setFlows] = useState<MaterialFlowData[]>([])

  // Générer automatiquement les flux depuis les process steps
  useEffect(() => {
    const processSteps = diagram.nodes.filter(n => n.type === NodeType.PROCESS_STEP)

    if (processSteps.length < 2) {
      setFlows([])
      return
    }

    const newFlows: MaterialFlowData[] = []

    for (let i = 0; i < processSteps.length - 1; i++) {
      const fromStep = processSteps[i]
      const toStep = processSteps[i + 1]

      // Vérifier si ce flux existe déjà
      const existingFlow = flows.find(
        f => f.fromStep === fromStep.name && f.toStep === toStep.name
      )

      if (existingFlow) {
        newFlows.push(existingFlow)
      } else {
        newFlows.push({
          id: generateId('flow'),
          fromStep: fromStep.name,
          toStep: toStep.name,
          type: FlowType.PUSH,
          description: 'Flux poussé standard'
        })
      }
    }

    setFlows(newFlows)
  }, [diagram.nodes])

  const handleTypeChange = (flowId: string, newType: FlowType | '') => {
    const updatedFlows = flows.map(f => {
      if (f.id === flowId) {
        let description = ''
        if (newType === FlowType.PUSH) {
          description = 'Flux poussé standard'
        } else if (newType === FlowType.PULL) {
          description = 'Flux tiré par demande client'
        } else if (newType === FlowType.FIFO_LANE) {
          description = 'First In First Out (file d\'attente)'
        } else if (newType === FlowType.KANBAN) {
          description = 'Stock Kanban avec système de réapprovisionnement'
        }

        return {
          ...f,
          type: newType,
          description
        }
      }
      return f
    })
    
    setFlows(updatedFlows)
    
    // Synchroniser vers flowSequences
    syncFlowsToFlowSequences(updatedFlows)
  }
  
  /**
   * Synchronise les flows vers diagram.flowSequences
   */
  const syncFlowsToFlowSequences = (updatedFlows: MaterialFlowData[]) => {
    const updatedFlowSequences = [...diagram.flowSequences]
    
    updatedFlows.forEach(flow => {
      const fromNode = diagram.nodes.find(n => n.name === flow.fromStep)
      const toNode = diagram.nodes.find(n => n.name === flow.toStep)
      
      if (!fromNode || !toNode) return
      
      const flowSeq = updatedFlowSequences.find(fs => fs.fromNodeId === fromNode.id && fs.toNodeId === toNode.id)
      
      if (flowSeq) {
        // Mettre à jour le materialFlow dans intermediateElements
        const mfIndex = flowSeq.intermediateElements.findIndex(el => el.type === 'MATERIAL_FLOW')
        
        if (mfIndex >= 0 && flow.type) {
          flowSeq.intermediateElements[mfIndex].materialFlow = {
            flowType: flow.type,
            description: flow.description
          }
        } else if (flow.type) {
          flowSeq.intermediateElements.push({
            order: flowSeq.intermediateElements.length + 1,
            type: 'MATERIAL_FLOW',
            materialFlow: {
              flowType: flow.type,
              description: flow.description
            }
          })
        }
      }
    })
    
    onUpdate({ flowSequences: updatedFlowSequences })
  }

  const columns: Column<MaterialFlowData>[] = [
    {
      key: 'fromStep',
      label: 'De',
      width: '25%',
      render: (item) => item.fromStep
    },
    {
      key: 'toStep',
      label: 'Vers',
      width: '25%',
      render: (item) => item.toStep
    },
    {
      key: 'type',
      label: 'Type',
      width: '20%',
      render: (item) => (
        <Select
          value={item.type || 'none'}
          onValueChange={(value) =>
            handleTypeChange(item.id, value === 'none' ? '' : (value as FlowType))
          }
        >
          <SelectTrigger className="h-8">
            <SelectValue placeholder="-- Sélectionner --" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">-- Sélectionner --</SelectItem>
            <SelectItem value={FlowType.PUSH}>PUSH</SelectItem>
            <SelectItem value={FlowType.PULL}>PULL</SelectItem>
            <SelectItem value={FlowType.FIFO_LANE}>FIFO</SelectItem>
            <SelectItem value={FlowType.KANBAN}>KANBAN</SelectItem>
          </SelectContent>
        </Select>
      )
    },
    {
      key: 'description',
      label: 'Description',
      width: '30%',
      render: (item) => (
        <span className="text-sm text-muted-foreground">{item.description}</span>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Flux Matériels</h3>
        <p className="text-sm text-muted-foreground">
          Spécifiez le type de flux entre chaque paire d'étapes de production
        </p>
      </div>

      {/* Table des flux */}
      <FormTable
        columns={columns}
        data={flows}
      />

      {flows.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Aucun flux disponible. Créez au moins 2 étapes de production.
        </p>
      )}
    </div>
  )
}
