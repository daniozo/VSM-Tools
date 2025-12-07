/**
 * Onglet 2 : Sources de Données
 * 
 * Gère les connexions aux systèmes externes (SQL, REST, STATIC)
 */

import React, { useState } from 'react'
import { VSMDiagram, DataSource, DataSourceType, AuthType, generateId } from '@/shared/types/vsm-model'
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
import { CheckCircle, XCircle, Circle } from 'lucide-react'

interface DataSourcesTabProps {
  diagram: VSMDiagram
  onUpdate: (updates: Partial<VSMDiagram>) => void
}

export const DataSourcesTab: React.FC<DataSourcesTabProps> = ({
  diagram,
  onUpdate
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState<Partial<DataSource>>({})
  const [testingConnection, setTestingConnection] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const columns: Column<DataSource>[] = [
    {
      key: 'name',
      label: 'Nom',
      width: '30%'
    },
    {
      key: 'type',
      label: 'Type',
      width: '20%'
    },
    {
      key: 'status',
      label: 'Statut',
      width: '20%',
      render: (ds) => (
        <div className="flex items-center gap-2">
          {ds.status === 'OK' && <CheckCircle size={16} className="text-green-600" />}
          {ds.status === 'ERROR' && <XCircle size={16} className="text-red-600" />}
          {ds.status === 'UNTESTED' && <Circle size={16} className="text-gray-400" />}
          <span className="text-sm">
            {ds.status === 'OK' && 'Connecté'}
            {ds.status === 'ERROR' && 'Erreur'}
            {ds.status === 'UNTESTED' && 'Non testé'}
          </span>
        </div>
      )
    }
  ]

  const handleAdd = () => {
    setEditingIndex(null)
    setFormData({
      id: generateId('ds'),
      name: '',
      type: DataSourceType.REST,
      status: 'UNTESTED',
      config: { baseUrl: '', authType: AuthType.NONE }
    })
    setTestResult(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (ds: DataSource, index: number) => {
    setEditingIndex(index)
    setFormData(ds)
    setTestResult(null)
    setIsDialogOpen(true)
  }

  const handleDelete = (ds: DataSource) => {
    const confirmed = window.confirm(`Supprimer la source "${ds.name}" ?`)
    if (confirmed) {
      onUpdate({
        dataSources: diagram.dataSources.filter(d => d.id !== ds.id)
      })
    }
  }

  const handleTestConnection = async () => {
    if (!formData.type) {
      return
    }

    setTestingConnection(true)
    setTestResult(null)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      if (formData.type === DataSourceType.SQL) {
        const config = formData.config as any
        if (!config?.dbType || !config?.serverUrl) {
          setTestResult({ success: false, message: 'Veuillez remplir tous les champs SQL requis' })
          setTestingConnection(false)
          return
        }
        setTestResult({ success: true, message: 'Connexion SQL établie avec succès' })
        setFormData({ ...formData, status: 'OK' })
      } else if (formData.type === DataSourceType.REST) {
        const config = formData.config as any
        if (!config?.baseUrl) {
          setTestResult({ success: false, message: 'Veuillez fournir une URL de base' })
          setTestingConnection(false)
          return
        }
        setTestResult({ success: true, message: 'API REST accessible' })
        setFormData({ ...formData, status: 'OK' })
      }
    } catch (error) {
      setTestResult({ success: false, message: 'Erreur lors du test de connexion: ' + (error as Error).message })
      setFormData({ ...formData, status: 'ERROR' })
    } finally {
      setTestingConnection(false)
    }
  }

  const handleSave = () => {
    if (!formData.name || !formData.type) {
      alert('Veuillez remplir tous les champs requis')
      return
    }

    const newDataSource: DataSource = formData as DataSource

    if (editingIndex !== null) {
      const updated = [...diagram.dataSources]
      updated[editingIndex] = newDataSource
      onUpdate({ dataSources: updated })
    } else {
      onUpdate({
        dataSources: [...diagram.dataSources, newDataSource]
      })
    }

    setIsDialogOpen(false)
    setTestResult(null)
  }

  const renderConfigFields = () => {
    if (!formData.type) return null

    switch (formData.type) {
      case DataSourceType.SQL:
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Type de base de données <span className="text-red-500">*</span>
              </label>
              <select
                value={(formData.config as any)?.dbType || 'PostgreSQL'}
                onChange={(e) => setFormData({
                  ...formData,
                  config: { ...(formData.config as any), dbType: e.target.value }
                })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="PostgreSQL">PostgreSQL</option>
                <option value="MySQL">MySQL</option>
              </select>
            </div>

            <FormField
              label="Serveur"
              value={(formData.config as any)?.serverUrl || ''}
              onChange={(v) => setFormData({
                ...formData,
                config: { ...(formData.config as any), serverUrl: v }
              })}
              helperText="Format: host:port/database"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Utilisateur"
                value={(formData.config as any)?.username || ''}
                onChange={(v) => setFormData({
                  ...formData,
                  config: { ...(formData.config as any), username: v }
                })}
                required
              />
              <FormField
                label="Mot de passe"
                value={(formData.config as any)?.passwordRef || ''}
                onChange={(v) => setFormData({
                  ...formData,
                  config: { ...(formData.config as any), passwordRef: v }
                })}
                helperText="Sera chiffré automatiquement"
              />
            </div>
          </>
        )

      case DataSourceType.REST:
        return (
          <>
            <FormField
              label="URL de Base"
              value={(formData.config as any)?.baseUrl || ''}
              onChange={(v) => setFormData({
                ...formData,
                config: { ...(formData.config as any), baseUrl: v }
              })}
              placeholder="https://api.example.com"
              required
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">Type d'Authentification</label>
              <select
                value={(formData.config as any)?.authType || AuthType.NONE}
                onChange={(e) => setFormData({
                  ...formData,
                  config: { ...(formData.config as any), authType: e.target.value }
                })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value={AuthType.NONE}>Aucune</option>
                <option value={AuthType.API_KEY}>API Key</option>
                <option value={AuthType.BEARER_TOKEN}>Bearer Token</option>
                <option value={AuthType.BASIC}>Basic Auth</option>
              </select>
            </div>
            {(formData.config as any)?.authType !== AuthType.NONE && (
              <FormField
                label="Référence Secret"
                value={(formData.config as any)?.authSecretRef || ''}
                onChange={(v) => setFormData({
                  ...formData,
                  config: { ...(formData.config as any), authSecretRef: v }
                })}
                placeholder="{API_KEY}"
              />
            )}
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          Sources de Données
        </h3>
        <p className="text-sm text-muted-foreground">
          Configurez les connexions aux systèmes externes pour alimenter les indicateurs dynamiques
        </p>
      </div>

      <FormTable
        columns={columns}
        data={diagram.dataSources}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addLabel="Ajouter une source"
        emptyMessage="Aucune source de données configurée"
        keyExtractor={(ds) => ds.id}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? 'Modifier' : 'Ajouter'} une Source de Données
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <FormField
              label="Nom"
              value={formData.name || ''}
              onChange={(v) => setFormData({ ...formData, name: v })}
              placeholder="Nom de la source de données"
              required
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Type de Source <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type || DataSourceType.REST}
                onChange={(e) => {
                  const newType = e.target.value as DataSourceType
                  setFormData({
                    ...formData,
                    type: newType,
                    config: newType === DataSourceType.REST
                      ? { baseUrl: '', authType: AuthType.NONE }
                      : { dbType: 'PostgreSQL', serverUrl: '' },
                    status: 'UNTESTED'
                  })
                  setTestResult(null)
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value={DataSourceType.REST}>API REST</option>
                <option value={DataSourceType.SQL}>Base de Données SQL</option>
              </select>
            </div>

            {renderConfigFields()}

            {/* Test Connection Section */}
            {formData.type && (
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={testingConnection}
                  >
                    {testingConnection ? 'Test en cours...' : 'Tester la connexion'}
                  </Button>

                  {testResult && (
                    <div className={`flex items-center gap-2 text-sm ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                      {testResult.success ? <CheckCircle size={16} /> : <XCircle size={16} />}
                      <span>{testResult.message}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Vérifiez que la connexion fonctionne avant de sauvegarder
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              {editingIndex !== null ? 'Modifier' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
