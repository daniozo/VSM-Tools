/**
 * Onglet 6 : Stocks (Inventaires)
 * 
 * Structure Eclipse :
 * - Section Stock Initial (checkbox + panel)
 * - Table Stocks Entre Étapes (auto-générée depuis process steps)
 * - Section Stock Final (checkbox + panel)
 */

import React, { useState, useEffect } from 'react'
import {
  VSMDiagram,
  Inventory,
  InventoryType,
  DataSourceType,
  DataConnection,
  generateId,
  NodeType
} from '@/shared/types/vsm-model'
import { FormTable, Column } from '../shared/FormTable'
import { FormField } from '../shared/FormField'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface InventoriesTabProps {
  diagram: VSMDiagram
  onUpdate: (updates: Partial<VSMDiagram>) => void
}

interface BetweenStockData {
  id: string
  fromStep: string
  toStep: string
  enabled: boolean
  name: string
  type: InventoryType
  quantity: number
  durationDays: number
  mode: 'Statique' | 'Dynamique' | 'Manuel'
  dataConnection?: DataConnection
}

// Mapping des labels français pour les types d'inventaire
const inventoryTypeLabels: Record<InventoryType, string> = {
  [InventoryType.RAW_MATERIAL]: 'Matière Première',
  [InventoryType.WIP]: 'En-Cours (WIP)',
  [InventoryType.FINISHED_GOODS]: 'Produits Finis',
  [InventoryType.SUPERMARKET]: 'Supermarché'
}

export const InventoriesTab: React.FC<InventoriesTabProps> = ({
  diagram,
  onUpdate
}) => {
  // Stock Initial
  const [initialStockEnabled, setInitialStockEnabled] = useState(true)
  const [initialStockType, setInitialStockType] = useState<InventoryType>(InventoryType.RAW_MATERIAL)
  const [initialStockName, setInitialStockName] = useState('Stock Matière Première')
  const [initialStockMode, setInitialStockMode] = useState<'Statique' | 'Dynamique' | 'Manuel'>('Statique')
  const [initialStockQty, setInitialStockQty] = useState('500')
  const [initialStockDuration, setInitialStockDuration] = useState('3')
  const [initialStockDataSourceId, setInitialStockDataSourceId] = useState('')
  const [initialStockSqlQuery, setInitialStockSqlQuery] = useState('')
  const [initialStockRestEndpoint, setInitialStockRestEndpoint] = useState('')
  const [initialStockJsonPath, setInitialStockJsonPath] = useState('')
  const [initialStockParameters, setInitialStockParameters] = useState('')

  // Effet pour sauvegarder le stock initial
  useEffect(() => {
    saveInitialStock()
  }, [initialStockEnabled, initialStockName, initialStockType, initialStockMode, initialStockQty, initialStockDuration])

  // Stock Final
  const [finalStockEnabled, setFinalStockEnabled] = useState(true)
  const [finalStockType, setFinalStockType] = useState<InventoryType>(InventoryType.FINISHED_GOODS)
  const [finalStockName, setFinalStockName] = useState('Stock Produits Finis')
  const [finalStockMode, setFinalStockMode] = useState<'Statique' | 'Dynamique' | 'Manuel'>('Statique')
  const [finalStockQty, setFinalStockQty] = useState('200')
  const [finalStockDuration, setFinalStockDuration] = useState('2')
  const [finalStockDataSourceId, setFinalStockDataSourceId] = useState('')
  const [finalStockSqlQuery, setFinalStockSqlQuery] = useState('')
  const [finalStockRestEndpoint, setFinalStockRestEndpoint] = useState('')
  const [finalStockJsonPath, setFinalStockJsonPath] = useState('')
  const [finalStockParameters, setFinalStockParameters] = useState('')

  // Effet pour sauvegarder le stock final
  useEffect(() => {
    saveFinalStock()
  }, [finalStockEnabled, finalStockName, finalStockType, finalStockMode, finalStockQty, finalStockDuration])

  // Dialogue de configuration dynamique
  const [isDynamicConfigDialogOpen, setIsDynamicConfigDialogOpen] = useState(false)
  const [configTarget, setConfigTarget] = useState<'initial' | 'final' | null>(null)

  // Stocks Entre Étapes
  const [betweenStocks, setBetweenStocks] = useState<BetweenStockData[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStock, setEditingStock] = useState<BetweenStockData | null>(null)

  // États pour la configuration dynamique du stock en cours d'édition
  const [stockSqlQuery, setStockSqlQuery] = useState('')
  const [stockRestEndpoint, setStockRestEndpoint] = useState('')
  const [stockJsonPath, setStockJsonPath] = useState('')
  const [stockParameters, setStockParameters] = useState('')

  // Générer automatiquement les paires d'étapes au chargement
  useEffect(() => {
    const processSteps = diagram.nodes.filter(n => n.type === NodeType.PROCESS_STEP)

    if (processSteps.length < 2) {
      setBetweenStocks([])
      return
    }

    const newBetweenStocks: BetweenStockData[] = []

    for (let i = 0; i < processSteps.length - 1; i++) {
      const fromStep = processSteps[i]
      const toStep = processSteps[i + 1]

      // Vérifier si ce stock existe déjà dans betweenStocks
      const existingStock = betweenStocks.find(
        s => s.fromStep === fromStep.name && s.toStep === toStep.name
      )

      if (existingStock) {
        newBetweenStocks.push(existingStock)
      } else {
        newBetweenStocks.push({
          id: generateId('stock'),
          fromStep: fromStep.name,
          toStep: toStep.name,
          enabled: false,
          name: '(aucun)',
          type: InventoryType.WIP,
          quantity: 100,
          durationDays: 1,
          mode: 'Statique'
        })
      }
    }

    setBetweenStocks(newBetweenStocks)
  }, [diagram.nodes])

  const handleEdit = (stock: BetweenStockData) => {
    if (!stock.enabled) {
      alert('Cochez la ligne pour activer ce stock avant de le configurer.')
      return
    }
    setEditingStock({ ...stock })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!editingStock) return

    const updatedStocks = betweenStocks.map(s => (s.id === editingStock.id ? editingStock : s))
    setBetweenStocks(updatedStocks)
    
    // Synchroniser vers flowSequences
    syncBetweenStocksToFlowSequences(updatedStocks)
    
    setIsDialogOpen(false)
    setEditingStock(null)
  }

  const handleToggleStock = (stockId: string) => {
    const updatedStocks = betweenStocks.map(s => {
      if (s.id === stockId) {
        const newEnabled = !s.enabled
        return {
          ...s,
          enabled: newEnabled,
          name: newEnabled && s.name === '(aucun)' ? 'Stock En-Cours' : s.name
        }
      }
      return s
    })
    
    setBetweenStocks(updatedStocks)
    
    // Synchroniser vers flowSequences
    syncBetweenStocksToFlowSequences(updatedStocks)
  }

  /**
   * Synchronise betweenStocks vers diagram.flowSequences
   */
  const syncBetweenStocksToFlowSequences = (stocks: BetweenStockData[]) => {
    const updatedFlowSequences = [...diagram.flowSequences]
    
    // Pour chaque stock activé, créer/mettre à jour l'inventory dans flowSequences
    stocks.forEach((stock) => {
      // Trouver les nodes correspondants
      const fromNode = diagram.nodes.find(n => n.name === stock.fromStep)
      const toNode = diagram.nodes.find(n => n.name === stock.toStep)
      
      if (!fromNode || !toNode) return
      
      // Trouver ou créer la flowSequence
      let flowSeq = updatedFlowSequences.find(fs => fs.fromNodeId === fromNode.id && fs.toNodeId === toNode.id)
      
      if (!flowSeq) {
        flowSeq = {
          order: updatedFlowSequences.length,
          fromNodeId: fromNode.id,
          toNodeId: toNode.id,
          intermediateElements: []
        }
        updatedFlowSequences.push(flowSeq)
      }
      
      // Gérer l'inventory dans intermediateElements
      const invIndex = flowSeq.intermediateElements.findIndex(el => el.type === 'INVENTORY')
      
      if (stock.enabled) {
        // Créer/mettre à jour l'inventory
        const inventory: Inventory = {
          id: stock.id,
          name: stock.name,
          type: stock.type,
          quantity: stock.quantity.toString(),
          duration: stock.durationDays.toString(),
          unit: 'unités',
          mode: stock.mode === 'Dynamique' ? 'dynamic' : stock.mode === 'Manuel' ? 'manual' : 'static',
          indicators: [],
          dataConnection: stock.dataConnection
        }
        
        if (invIndex >= 0) {
          // Mettre à jour
          flowSeq.intermediateElements[invIndex].inventory = inventory
        } else {
          // Ajouter
          flowSeq.intermediateElements.push({
            order: flowSeq.intermediateElements.length + 1,
            type: 'INVENTORY',
            inventory
          })
        }
      } else {
        // Retirer l'inventory si désactivé
        if (invIndex >= 0) {
          flowSeq.intermediateElements.splice(invIndex, 1)
        }
      }
    })
    
    // Sauvegarder
    onUpdate({ flowSequences: updatedFlowSequences })
  }

  /**
   * Sauvegarde le stock initial dans flowSequences
   */
  const saveInitialStock = () => {
    const updatedFlowSequences = [...diagram.flowSequences]
    const firstNode = diagram.nodes.find(n => n.type === NodeType.PROCESS_STEP)
    
    if (!firstNode) return
    
    // Chercher la séquence supplier -> firstNode (ou créer)
    let flowSeq = updatedFlowSequences.find(fs => fs.toNodeId === firstNode.id && (!fs.fromNodeId || fs.fromNodeId === 'supplier'))
    
    if (!flowSeq) {
      flowSeq = {
        order: 0,
        fromNodeId: 'supplier',
        toNodeId: firstNode.id,
        intermediateElements: []
      }
      updatedFlowSequences.unshift(flowSeq)
    }
    
    const invIndex = flowSeq.intermediateElements.findIndex(el => el.type === 'INVENTORY')
    
    if (initialStockEnabled) {
      const inventory: Inventory = {
        id: generateId('stock-initial'),
        name: initialStockName,
        type: initialStockType,
        quantity: initialStockQty,
        duration: initialStockDuration,
        unit: 'unités',
        mode: initialStockMode === 'Dynamique' ? 'dynamic' : initialStockMode === 'Manuel' ? 'manual' : 'static',
        indicators: []
      }
      
      if (invIndex >= 0) {
        flowSeq.intermediateElements[invIndex].inventory = inventory
      } else {
        flowSeq.intermediateElements.push({
          order: 1,
          type: 'INVENTORY',
          inventory
        })
      }
    } else {
      if (invIndex >= 0) {
        flowSeq.intermediateElements.splice(invIndex, 1)
      }
    }
    
    onUpdate({ flowSequences: updatedFlowSequences })
  }

  /**
   * Sauvegarde le stock final dans flowSequences
   */
  const saveFinalStock = () => {
    const updatedFlowSequences = [...diagram.flowSequences]
    const lastNode = diagram.nodes.filter(n => n.type === NodeType.PROCESS_STEP).pop()
    
    if (!lastNode) return
    
    // Chercher la séquence lastNode -> customer (ou créer)
    let flowSeq = updatedFlowSequences.find(fs => fs.fromNodeId === lastNode.id && (!fs.toNodeId || fs.toNodeId === 'customer'))
    
    if (!flowSeq) {
      flowSeq = {
        order: updatedFlowSequences.length,
        fromNodeId: lastNode.id,
        toNodeId: 'customer',
        intermediateElements: []
      }
      updatedFlowSequences.push(flowSeq)
    }
    
    const invIndex = flowSeq.intermediateElements.findIndex(el => el.type === 'INVENTORY')
    
    if (finalStockEnabled) {
      const inventory: Inventory = {
        id: generateId('stock-final'),
        name: finalStockName,
        type: finalStockType,
        quantity: finalStockQty,
        duration: finalStockDuration,
        unit: 'unités',
        mode: finalStockMode === 'Dynamique' ? 'dynamic' : finalStockMode === 'Manuel' ? 'manual' : 'static',
        indicators: []
      }
      
      if (invIndex >= 0) {
        flowSeq.intermediateElements[invIndex].inventory = inventory
      } else {
        flowSeq.intermediateElements.push({
          order: 1,
          type: 'INVENTORY',
          inventory
        })
      }
    } else {
      if (invIndex >= 0) {
        flowSeq.intermediateElements.splice(invIndex, 1)
      }
    }
    
    onUpdate({ flowSequences: updatedFlowSequences })
  }

  const columns: Column<BetweenStockData>[] = [
    {
      key: 'enabled',
      label: '',
      width: '5%',
      render: (item) => (
        <Checkbox
          checked={item.enabled}
          onCheckedChange={() => handleToggleStock(item.id)}
        />
      )
    },
    {
      key: 'fromStep',
      label: 'De',
      width: '15%',
      render: (item) => item.fromStep
    },
    {
      key: 'toStep',
      label: 'Vers',
      width: '15%',
      render: (item) => item.toStep
    },
    {
      key: 'name',
      label: 'Nom du Stock',
      width: '20%',
      render: (item) => item.name
    },
    {
      key: 'type',
      label: 'Type',
      width: '15%',
      render: (item) => item.enabled ? inventoryTypeLabels[item.type] : ''
    },
    {
      key: 'quantity',
      label: 'Quantité',
      width: '10%',
      render: (item) => item.enabled ? item.quantity.toString() : ''
    },
    {
      key: 'durationDays',
      label: 'Durée (j)',
      width: '10%',
      render: (item) => item.enabled ? item.durationDays.toString() : ''
    },
    {
      key: 'mode',
      label: 'Mode',
      width: '20%',
      render: (item) => item.enabled ? item.mode : ''
    }
  ]

  const availableDataSources = diagram.dataSources || []

  return (
    <div className="space-y-6">
      {/* Info */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Stocks & Inventaires</h3>
        <p className="text-sm text-muted-foreground">
          Cochez/décochez les lignes pour indiquer la présence d'un stock
        </p>
      </div>

      {/* Stock Initial */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="chk-initial"
            checked={initialStockEnabled}
            onCheckedChange={(checked) => setInitialStockEnabled(!!checked)}
          />
          <label htmlFor="chk-initial" className="font-medium cursor-pointer">
            Stock Initial (avant la 1ère étape)
          </label>
        </div>

        {initialStockEnabled && (
          <Card className="p-4 ml-6 space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Type :</label>
                <Select
                  value={initialStockType}
                  onValueChange={(value) => setInitialStockType(value as InventoryType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={InventoryType.RAW_MATERIAL}>{inventoryTypeLabels[InventoryType.RAW_MATERIAL]}</SelectItem>
                    <SelectItem value={InventoryType.WIP}>{inventoryTypeLabels[InventoryType.WIP]}</SelectItem>
                    <SelectItem value={InventoryType.FINISHED_GOODS}>{inventoryTypeLabels[InventoryType.FINISHED_GOODS]}</SelectItem>
                    <SelectItem value={InventoryType.SUPERMARKET}>{inventoryTypeLabels[InventoryType.SUPERMARKET]}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <FormField
                label="Nom"
                value={initialStockName}
                onChange={setInitialStockName}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Mode :</label>
              <div className="flex gap-2">
                <Select
                  value={initialStockMode}
                  onValueChange={(value) =>
                    setInitialStockMode(value as 'Statique' | 'Dynamique' | 'Manuel')
                  }
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Statique">Statique</SelectItem>
                    <SelectItem value="Dynamique">Dynamique</SelectItem>
                    <SelectItem value="Manuel">Manuel (Saisie opérateur)</SelectItem>
                  </SelectContent>
                </Select>

                {initialStockMode === 'Dynamique' && (
                  <Button variant="outline" onClick={() => {
                    setConfigTarget('initial')
                    setIsDynamicConfigDialogOpen(true)
                  }}>
                    Configurer...
                  </Button>
                )}
              </div>
            </div>            {initialStockMode === 'Statique' && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Quantité"
                  type="number"
                  value={initialStockQty}
                  onChange={setInitialStockQty}
                  required
                />
                <FormField
                  label="Durée (jours)"
                  type="number"
                  value={initialStockDuration}
                  onChange={setInitialStockDuration}
                  required
                />
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Stocks Entre Étapes */}
      <div className="space-y-3">
        <h4 className="font-medium">Stocks Entre Étapes</h4>
        <FormTable
          columns={columns}
          data={betweenStocks}
          onEdit={handleEdit}
        />
        {betweenStocks.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucune paire d'étapes disponible. Créez au moins 2 étapes de production.
          </p>
        )}
      </div>

      {/* Stock Final */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="chk-final"
            checked={finalStockEnabled}
            onCheckedChange={(checked) => setFinalStockEnabled(!!checked)}
          />
          <label htmlFor="chk-final" className="font-medium cursor-pointer">
            Stock Final (après la dernière étape)
          </label>
        </div>

        {finalStockEnabled && (
          <Card className="p-4 ml-6 space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Type :</label>
                <Select
                  value={finalStockType}
                  onValueChange={(value) => setFinalStockType(value as InventoryType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={InventoryType.RAW_MATERIAL}>{inventoryTypeLabels[InventoryType.RAW_MATERIAL]}</SelectItem>
                    <SelectItem value={InventoryType.WIP}>{inventoryTypeLabels[InventoryType.WIP]}</SelectItem>
                    <SelectItem value={InventoryType.FINISHED_GOODS}>{inventoryTypeLabels[InventoryType.FINISHED_GOODS]}</SelectItem>
                    <SelectItem value={InventoryType.SUPERMARKET}>{inventoryTypeLabels[InventoryType.SUPERMARKET]}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <FormField
                label="Nom"
                value={finalStockName}
                onChange={setFinalStockName}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Mode :</label>
              <div className="flex gap-2">
                <Select
                  value={finalStockMode}
                  onValueChange={(value) =>
                    setFinalStockMode(value as 'Statique' | 'Dynamique' | 'Manuel')
                  }
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Statique">Statique</SelectItem>
                    <SelectItem value="Dynamique">Dynamique</SelectItem>
                    <SelectItem value="Manuel">Manuel (Saisie opérateur)</SelectItem>
                  </SelectContent>
                </Select>

                {finalStockMode === 'Dynamique' && (
                  <Button variant="outline" onClick={() => {
                    setConfigTarget('final')
                    setIsDynamicConfigDialogOpen(true)
                  }}>
                    Configurer...
                  </Button>
                )}
              </div>
            </div>            {finalStockMode === 'Statique' && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Quantité"
                  type="number"
                  value={finalStockQty}
                  onChange={setFinalStockQty}
                  required
                />
                <FormField
                  label="Durée (jours)"
                  type="number"
                  value={finalStockDuration}
                  onChange={setFinalStockDuration}
                  required
                />
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Dialog d'édition des stocks entre étapes */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le Stock Entre Étapes</DialogTitle>
          </DialogHeader>

          {editingStock && (
            <div className="space-y-6 py-4">
              {/* Ligne 1 : De + Vers (désactivés) */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="De"
                  value={editingStock.fromStep}
                  onChange={() => { }}
                  disabled
                />
                <FormField
                  label="Vers"
                  value={editingStock.toStep}
                  onChange={() => { }}
                  disabled
                />
              </div>

              {/* Ligne 2 : Nom + Type */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Nom du Stock"
                  value={editingStock.name}
                  onChange={(value) => setEditingStock({ ...editingStock, name: value })}
                  required
                />
                <div>
                  <label className="text-sm font-medium mb-2 block">Type :</label>
                  <Select
                    value={editingStock.type}
                    onValueChange={(value) =>
                      setEditingStock({ ...editingStock, type: value as InventoryType })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={InventoryType.RAW_MATERIAL}>{inventoryTypeLabels[InventoryType.RAW_MATERIAL]}</SelectItem>
                      <SelectItem value={InventoryType.WIP}>{inventoryTypeLabels[InventoryType.WIP]}</SelectItem>
                      <SelectItem value={InventoryType.FINISHED_GOODS}>{inventoryTypeLabels[InventoryType.FINISHED_GOODS]}</SelectItem>
                      <SelectItem value={InventoryType.SUPERMARKET}>{inventoryTypeLabels[InventoryType.SUPERMARKET]}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Ligne 3 : Mode */}
              <div>
                <label className="text-sm font-medium mb-2 block">Mode :</label>
                <Select
                  value={editingStock.mode}
                  onValueChange={(value) =>
                    setEditingStock({
                      ...editingStock,
                      mode: value as 'Statique' | 'Dynamique' | 'Manuel'
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Statique">Statique</SelectItem>
                    <SelectItem value="Dynamique">Dynamique</SelectItem>
                    <SelectItem value="Manuel">Manuel (Saisie opérateur)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Configuration Dynamique : Affichée directement dans le dialogue */}
              {editingStock.mode === 'Dynamique' && (() => {
                // Déterminer le type de la DataSource sélectionnée
                const selectedDataSource = availableDataSources.find(ds => ds.id === editingStock.dataConnection?.dataSourceId)
                const isSQL = selectedDataSource?.type === DataSourceType.SQL
                const isREST = selectedDataSource?.type === DataSourceType.REST

                return (
                  <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                    <h4 className="font-semibold text-sm">Configuration du Mode Dynamique</h4>

                    {/* Source de données */}
                    <div className="space-y-2">
                      <Label>Source :</Label>
                      <Select
                        value={editingStock.dataConnection?.dataSourceId || ''}
                        onValueChange={(value) =>
                          setEditingStock({ 
                            ...editingStock, 
                            dataConnection: { 
                              ...(editingStock.dataConnection || {}), 
                              dataSourceId: value 
                            } as DataConnection
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une source..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDataSources.map((ds) => (
                            <SelectItem key={ds.id} value={ds.id}>
                              {ds.name} ({ds.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {availableDataSources.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          Configurez des sources de données dans l'onglet Sources de Données
                        </p>
                      )}
                    </div>

                    {/* Champs SQL */}
                    {isSQL && (
                      <>
                        <div className="space-y-2">
                          <Label>Requête SQL :</Label>
                          <Textarea
                            value={editingStock.dataConnection?.sqlQuery || ''}
                            onChange={(e) => setEditingStock({ 
                              ...editingStock, 
                              dataConnection: { 
                                ...(editingStock.dataConnection || { dataSourceId: '' }), 
                                sqlQuery: e.target.value 
                              } as DataConnection
                            })}
                            rows={4}
                            className="font-mono text-sm"
                            placeholder="SELECT quantity FROM inventory WHERE..."
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Paramètres :</Label>
                          <FormField
                            label=""
                            type="text"
                            value={editingStock.dataConnection?.parameters || ''}
                            onChange={(value) => setEditingStock({ 
                              ...editingStock, 
                              dataConnection: { 
                                ...(editingStock.dataConnection || { dataSourceId: '' }), 
                                parameters: value 
                              } as DataConnection
                            })}
                            helperText="Format: key1=value1;key2=value2"
                          />
                        </div>
                      </>
                    )}

                    {/* Champs REST */}
                    {isREST && (
                      <>
                        <FormField
                          label="Endpoint REST"
                          type="text"
                          value={editingStock.dataConnection?.restEndpoint || ''}
                          onChange={(value) => setEditingStock({ 
                            ...editingStock, 
                            dataConnection: { 
                              ...(editingStock.dataConnection || { dataSourceId: '' }), 
                              restEndpoint: value 
                            } as DataConnection
                          })}
                          required
                          placeholder="/api/inventory/quantity"
                        />

                        <FormField
                          label="JSON Path"
                          type="text"
                          value={editingStock.dataConnection?.jsonPath || ''}
                          onChange={(value) => setEditingStock({ 
                            ...editingStock, 
                            dataConnection: { 
                              ...(editingStock.dataConnection || { dataSourceId: '' }), 
                              jsonPath: value 
                            } as DataConnection
                          })}
                          helperText="Ex: $.data.value"
                        />

                        <div className="space-y-2">
                          <Label>Paramètres :</Label>
                          <FormField
                            label=""
                            type="text"
                            value={editingStock.dataConnection?.parameters || ''}
                            onChange={(value) => setEditingStock({ 
                              ...editingStock, 
                              dataConnection: { 
                                ...(editingStock.dataConnection || { dataSourceId: '' }), 
                                parameters: value 
                              } as DataConnection
                            })}
                            helperText="Format: key1=value1;key2=value2"
                          />
                        </div>
                      </>
                    )}
                  </div>
                )
              })()}

              {/* Champs Statique : Quantité + Durée */}
              {editingStock.mode === 'Statique' && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Quantité"
                    type="number"
                    value={editingStock.quantity.toString()}
                    onChange={(value) =>
                      setEditingStock({ ...editingStock, quantity: parseInt(value) || 0 })
                    }
                    required
                  />
                  <FormField
                    label="Durée (jours)"
                    type="number"
                    value={editingStock.durationDays.toString()}
                    onChange={(value) =>
                      setEditingStock({ ...editingStock, durationDays: parseInt(value) || 0 })
                    }
                    required
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue de configuration dynamique pour Stock Initial/Final */}
      <Dialog open={isDynamicConfigDialogOpen} onOpenChange={setIsDynamicConfigDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Configuration Dynamique - {configTarget === 'initial' ? 'Stock Initial' : 'Stock Final'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {(() => {
              const isInitial = configTarget === 'initial'
              const dataSourceId = isInitial ? initialStockDataSourceId : finalStockDataSourceId
              const setDataSourceId = isInitial ? setInitialStockDataSourceId : setFinalStockDataSourceId
              const sqlQuery = isInitial ? initialStockSqlQuery : finalStockSqlQuery
              const setSqlQuery = isInitial ? setInitialStockSqlQuery : setFinalStockSqlQuery
              const restEndpoint = isInitial ? initialStockRestEndpoint : finalStockRestEndpoint
              const setRestEndpoint = isInitial ? setInitialStockRestEndpoint : setFinalStockRestEndpoint
              const jsonPath = isInitial ? initialStockJsonPath : finalStockJsonPath
              const setJsonPath = isInitial ? setInitialStockJsonPath : setFinalStockJsonPath
              const parameters = isInitial ? initialStockParameters : finalStockParameters
              const setParameters = isInitial ? setInitialStockParameters : setFinalStockParameters

              const selectedDataSource = availableDataSources.find(ds => ds.id === dataSourceId)
              const isSQL = selectedDataSource?.type === DataSourceType.SQL
              const isREST = selectedDataSource?.type === DataSourceType.REST

              return (
                <>
                  {/* Source de données */}
                  <div className="space-y-2">
                    <Label>Source de Données :</Label>
                    <Select value={dataSourceId} onValueChange={setDataSourceId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une source..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDataSources.map(ds => (
                          <SelectItem key={ds.id} value={ds.id}>
                            {ds.name} ({ds.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {availableDataSources.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        Configurez des sources de données dans l'onglet Sources de Données
                      </p>
                    )}
                  </div>

                  {/* Champs SQL */}
                  {isSQL && (
                    <>
                      <div className="space-y-2">
                        <Label>Requête SQL :</Label>
                        <Textarea
                          value={sqlQuery}
                          onChange={(e) => setSqlQuery(e.target.value)}
                          rows={4}
                          className="font-mono text-sm"
                          placeholder="SELECT quantity FROM inventory WHERE..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Paramètres :</Label>
                        <FormField
                          label=""
                          type="text"
                          value={parameters}
                          onChange={setParameters}
                          helperText="Format: key1=value1;key2=value2"
                        />
                      </div>
                    </>
                  )}

                  {/* Champs REST */}
                  {isREST && (
                    <>
                      <FormField
                        label="Endpoint REST"
                        type="text"
                        value={restEndpoint}
                        onChange={setRestEndpoint}
                        required
                        placeholder="/api/inventory/quantity"
                      />

                      <FormField
                        label="JSON Path"
                        type="text"
                        value={jsonPath}
                        onChange={setJsonPath}
                        helperText="Ex: $.data.value"
                      />

                      <div className="space-y-2">
                        <Label>Paramètres :</Label>
                        <FormField
                          label=""
                          type="text"
                          value={parameters}
                          onChange={setParameters}
                          helperText="Format: key1=value1;key2=value2"
                        />
                      </div>
                    </>
                  )}
                </>
              )
            })()}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDynamicConfigDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={() => setIsDynamicConfigDialogOpen(false)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
