/**
 * Onglet 8 : Flux d'Information
 * 
 * Gère les flux d'information transverses entre les acteurs et étapes
 * (plannings, commandes, feedback, etc.)
 */

import React, { useState } from 'react'
import {
  VSMDiagram,
  InformationFlow,
  TransmissionType,
  NodeType,
  generateId
} from '@/shared/types/vsm-model'
import { FormTable, Column } from '../shared/FormTable'
import { FormField } from '../shared/FormField'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

interface InformationFlowsTabProps {
  diagram: VSMDiagram
  onUpdate: (updates: Partial<VSMDiagram>) => void
}

export const InformationFlowsTab: React.FC<InformationFlowsTabProps> = ({
  diagram,
  onUpdate
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState<Partial<InformationFlow>>({})

  const columns: Column<InformationFlow>[] = [
    {
      key: 'sourceNodeId',
      label: 'De',
      width: '20%',
      render: (flow) => {
        const node = diagram.nodes.find(n => n.id === flow.sourceNodeId)
        return <span className="text-sm font-medium">{node?.name || 'Inconnu'}</span>
      }
    },
    {
      key: 'targetNodeId',
      label: 'Vers',
      width: '20%',
      render: (flow) => {
        const node = diagram.nodes.find(n => n.id === flow.targetNodeId)
        return <span className="text-sm font-medium">{node?.name || 'Inconnu'}</span>
      }
    },
    {
      key: 'transmissionType',
      label: 'Type',
      width: '15%',
      render: (flow) => {
        const typeLabels = {
          [TransmissionType.ELECTRONIC]: 'Électronique',
          [TransmissionType.MANUAL]: 'Manuel',
          [TransmissionType.KANBAN]: 'Kanban',
          [TransmissionType.SCHEDULE]: 'Planning'
        }
        return (
          <span className="text-sm">
            {typeLabels[flow.transmissionType]}
          </span>
        )
      }
    },
    {
      key: 'frequency',
      label: 'Fréquence',
      width: '15%',
      render: (flow) => <span className="text-sm">{flow.frequency || '-'}</span>
    },
    {
      key: 'description',
      label: 'Description',
      width: '30%'
    }
  ]

  const handleAdd = () => {
    setEditingIndex(null)
    setFormData({
      id: generateId('info'),
      description: '',
      sourceNodeId: '',
      targetNodeId: '',
      transmissionType: TransmissionType.ELECTRONIC
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (flow: InformationFlow, index: number) => {
    setEditingIndex(index)
    setFormData(flow)
    setIsDialogOpen(true)
  }

  const handleDelete = (flow: InformationFlow) => {
    const confirmed = window.confirm(`Supprimer le flux d'information "${flow.description}" ?`)
    if (confirmed) {
      onUpdate({
        informationFlows: diagram.informationFlows.filter(f => f.id !== flow.id)
      })
    }
  }

  const handleSave = () => {
    if (!formData.description?.trim()) {
      alert('Veuillez saisir une description pour le flux d\'information')
      return
    }

    if (!formData.sourceNodeId || !formData.targetNodeId) {
      alert('Veuillez sélectionner la source et la cible')
      return
    }

    if (formData.sourceNodeId === formData.targetNodeId) {
      alert('La source et la cible doivent être différentes')
      return
    }

    const newFlow: InformationFlow = {
      id: formData.id || generateId('info'),
      description: formData.description.trim(),
      sourceNodeId: formData.sourceNodeId,
      targetNodeId: formData.targetNodeId,
      transmissionType: formData.transmissionType || TransmissionType.ELECTRONIC
    }

    if (editingIndex !== null) {
      const updatedFlows = [...diagram.informationFlows]
      updatedFlows[editingIndex] = newFlow
      onUpdate({ informationFlows: updatedFlows })
    } else {
      onUpdate({
        informationFlows: [...diagram.informationFlows, newFlow]
      })
    }

    setIsDialogOpen(false)
    setFormData({})
  }

  const handleCancel = () => {
    setIsDialogOpen(false)
    setFormData({})
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2">
          Flux d'Information
        </h3>
        <p className="text-sm text-muted-foreground">
          Définissez les flux d'information transverses entre les différents acteurs et étapes
        </p>
      </div>

      {/* Table des flux d'information */}
      <FormTable
        columns={columns}
        data={diagram.informationFlows}
        onAdd={diagram.nodes.length >= 2 ? handleAdd : undefined}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addLabel="Ajouter un flux d'information"
        emptyMessage="Aucun flux d'information défini"
        keyExtractor={(flow) => flow.id}
      />

      {diagram.nodes.length < 2 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Au moins 2 éléments requis. Créez des acteurs et des étapes de production.
        </p>
      )}

      {/* Dialog Ajouter/Modifier */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? 'Modifier le flux d\'information' : 'Ajouter un flux d\'information'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <FormField
              label="Description du flux"
              type="text"
              value={formData.description || ''}
              onChange={(value) => setFormData({ ...formData, description: value })}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Source <span className="text-destructive">*</span>
                </label>
                <Select
                  value={formData.sourceNodeId || ''}
                  onValueChange={(value) => setFormData({ ...formData, sourceNodeId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {diagram.nodes.map(node => (
                      <SelectItem key={node.id} value={node.id}>
                        {node.name}
                        {node.type === NodeType.SUPPLIER && ' (Fournisseur)'}
                        {node.type === NodeType.PROCESS_STEP && ' (Étape)'}
                        {node.type === NodeType.CUSTOMER && ' (Client)'}
                        {node.type === NodeType.CONTROL_CENTER && ' (Contrôle)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Cible <span className="text-destructive">*</span>
                </label>
                <Select
                  value={formData.targetNodeId || ''}
                  onValueChange={(value) => setFormData({ ...formData, targetNodeId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {diagram.nodes.map(node => (
                      <SelectItem
                        key={node.id}
                        value={node.id}
                        disabled={node.id === formData.sourceNodeId}
                      >
                        {node.name}
                        {node.type === NodeType.SUPPLIER && ' (Fournisseur)'}
                        {node.type === NodeType.PROCESS_STEP && ' (Étape)'}
                        {node.type === NodeType.CUSTOMER && ' (Client)'}
                        {node.type === NodeType.CONTROL_CENTER && ' (Contrôle)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Type de transmission <span className="text-destructive">*</span>
                </label>
                <Select
                  value={formData.transmissionType || TransmissionType.ELECTRONIC}
                  onValueChange={(value) =>
                    setFormData({ ...formData, transmissionType: value as TransmissionType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TransmissionType.ELECTRONIC}>
                      Électronique
                    </SelectItem>
                    <SelectItem value={TransmissionType.MANUAL}>
                      Manuel
                    </SelectItem>
                    <SelectItem value={TransmissionType.KANBAN}>
                      Kanban
                    </SelectItem>
                    <SelectItem value={TransmissionType.SCHEDULE}>
                      Planning
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Fréquence
                </label>
                <Select
                  value={formData.frequency || ''}
                  onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Optionnel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Quotidien">Quotidien</SelectItem>
                    <SelectItem value="Hebdomadaire">Hebdomadaire</SelectItem>
                    <SelectItem value="Par lot">Par lot</SelectItem>
                    <SelectItem value="Temps réel">Temps réel</SelectItem>
                    <SelectItem value="Après chaque lot">Après chaque lot</SelectItem>
                    <SelectItem value="Mensuel">Mensuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              {editingIndex !== null ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
