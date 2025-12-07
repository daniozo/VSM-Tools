/**
 * Dialogue pour ajouter ou éditer un indicateur personnalisé
 * Basé sur IndicatorDialog.java d'Eclipse
 * 
 * Structure :
 * - Ligne 1 : Nom + Unité
 * - Ligne 2 : Mode (Radio Statique / Dynamique / Manuel)
 * - Ligne 3 : Valeur (si Statique) OU Group DataConnection (si Dynamique)
 */

import React, { useState, useEffect } from 'react'
import {
  DataSource,
  DataSourceType,
  DataConnection,
  generateId
} from '@/shared/types/vsm-model'
import { FormField } from './shared/FormField'
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
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'

export interface IndicatorData {
  id: string
  name: string
  unit: string
  mode: 'Statique' | 'Dynamique' | 'Manuel'
  value?: string
  dataConnection?: DataConnection
}

interface IndicatorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  availableDataSources: DataSource[]
  initialData?: IndicatorData
  onSave: (data: IndicatorData) => void
}

export const IndicatorDialog: React.FC<IndicatorDialogProps> = ({
  open,
  onOpenChange,
  availableDataSources,
  initialData,
  onSave
}) => {
  const isEditMode = !!initialData

  // États de base
  const [name, setName] = useState('')
  const [unit, setUnit] = useState('')
  const [mode, setMode] = useState<'Statique' | 'Dynamique' | 'Manuel'>('Statique')
  const [value, setValue] = useState('')

  // États DataConnection
  const [selectedDataSourceId, setSelectedDataSourceId] = useState<string>('')
  const [sqlQuery, setSqlQuery] = useState('')
  const [restEndpoint, setRestEndpoint] = useState('')
  const [jsonPath, setJsonPath] = useState('')
  const [parameters, setParameters] = useState('')

  // Charger les données initiales en mode édition
  useEffect(() => {
    if (initialData && open) {
      setName(initialData.name || '')
      setUnit(initialData.unit || '')
      setMode(initialData.mode || 'Statique')
      setValue(initialData.value || '')

      if (initialData.dataConnection) {
        setSelectedDataSourceId(initialData.dataConnection.dataSourceId || '')
        setSqlQuery(initialData.dataConnection.sqlQuery || '')
        setRestEndpoint(initialData.dataConnection.restEndpoint || '')
        setJsonPath(initialData.dataConnection.jsonPath || '')
        setParameters(initialData.dataConnection.parameters || '')
      }
    } else if (!initialData && open) {
      // Réinitialiser pour le mode création
      setName('')
      setUnit('')
      setMode('Statique')
      setValue('')
      setSelectedDataSourceId('')
      setSqlQuery('')
      setRestEndpoint('')
      setJsonPath('')
      setParameters('')
    }
  }, [initialData, open])

  // Déterminer le type de la DataSource sélectionnée
  const selectedDataSource = availableDataSources.find(ds => ds.id === selectedDataSourceId)
  const isSQL = selectedDataSource?.type === DataSourceType.SQL
  const isREST = selectedDataSource?.type === DataSourceType.REST

  const handleSave = () => {
    // Validation
    if (!name.trim()) {
      alert('Veuillez saisir un nom pour l\'indicateur')
      return
    }

    if (!unit.trim()) {
      alert('Veuillez saisir une unité de mesure')
      return
    }

    if (mode === 'Dynamique') {
      if (!selectedDataSourceId) {
        alert('Veuillez sélectionner une source de données')
        return
      }

      if (isSQL && !sqlQuery.trim()) {
        alert('Veuillez saisir une requête SQL')
        return
      }

      if (isREST && !restEndpoint.trim()) {
        alert('Veuillez saisir l\'endpoint REST')
        return
      }
    }

    // Construire l'objet de données
    const data: IndicatorData = {
      id: initialData?.id || generateId('ind'),
      name: name.trim(),
      unit: unit.trim(),
      mode
    }

    if (mode === 'Statique' || mode === 'Manuel') {
      data.value = value.trim()
      data.dataConnection = undefined
    } else {
      data.value = undefined
      data.dataConnection = {
        dataSourceId: selectedDataSourceId,
        sqlQuery: isSQL ? sqlQuery.trim() : undefined,
        restEndpoint: isREST ? restEndpoint.trim() : undefined,
        jsonPath: isREST ? jsonPath.trim() : undefined,
        parameters: parameters.trim() || undefined
      }
    }

    onSave(data)
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Modifier l\'Indicateur' : 'Ajouter un Indicateur Personnalisé'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* LIGNE 1 : Nom + Unité */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Nom"
              type="text"
              value={name}
              onChange={setName}
              required
            />
            <FormField
              label="Unité"
              type="text"
              value={unit}
              onChange={setUnit}
              required
            />
          </div>

          {/* LIGNE 2 : Mode (Radio Buttons) */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Mode :</Label>
            <RadioGroup
              value={mode}
              onValueChange={(value) => setMode(value as 'Statique' | 'Dynamique' | 'Manuel')}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Statique" id="radio-static" />
                <Label htmlFor="radio-static" className="cursor-pointer">Statique</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Dynamique" id="radio-dynamic" />
                <Label htmlFor="radio-dynamic" className="cursor-pointer">Dynamique</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Manuel" id="radio-manual" />
                <Label htmlFor="radio-manual" className="cursor-pointer">Manuel (Saisie opérateur)</Label>
              </div>
            </RadioGroup>
          </div>

          {/* LIGNE 3 : Valeur (uniquement si Statique) */}
          {mode === 'Statique' && (
            <FormField
              label="Valeur"
              type="text"
              value={value}
              onChange={setValue}
            />
          )}

          {/* GROUP : Configuration DataConnection (si Dynamique) */}
          {mode === 'Dynamique' && (
            <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <h4 className="font-semibold text-sm">Configuration du Mode Dynamique</h4>

              {/* Source de données */}
              <div className="space-y-2">
                <Label>Source :</Label>
                <Select
                  value={selectedDataSourceId}
                  onValueChange={setSelectedDataSourceId}
                >
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
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            {isEditMode ? 'Enregistrer' : 'Ajouter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
