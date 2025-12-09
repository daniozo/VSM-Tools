/**
 * Onglet 2 : Sources de Données
 * 
 * Gère uniquement l'enregistrement des connexions SQL/REST
 * Les indicateurs et stocks configurent leurs propres sources dans leurs onglets respectifs
 */

import React, { useState } from 'react'
import {
  VSMDiagram,
  DataSource,
  DataSourceType,
  generateId
} from '@/shared/types/vsm-model'
import { FormTable, Column } from '../shared/FormTable'
import { Button } from '@/renderer/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/renderer/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/renderer/components/ui/select'
import { FormField } from '../shared/FormField'

interface DataSourcesTabProps {
  diagram: VSMDiagram
  onUpdate: (updates: Partial<VSMDiagram>) => void
}

export const DataSourcesTab: React.FC<DataSourcesTabProps> = ({
  diagram,
  onUpdate
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<DataSource | null>(null)
  
  // États du formulaire
  const [name, setName] = useState('')
  const [type, setType] = useState<DataSourceType>(DataSourceType.SQL)
  const [host, setHost] = useState('')
  const [port, setPort] = useState('')
  const [database, setDatabase] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [url, setUrl] = useState('')
  const [authType, setAuthType] = useState<'none' | 'bearer' | 'apikey' | 'basic'>('none')
  const [authToken, setAuthToken] = useState('')

  const dataSources = diagram.dataSources || []

  const columns: Column<DataSource>[] = [
    {
      key: 'name',
      label: 'Nom',
      width: '25%'
    },
    {
      key: 'type',
      label: 'Type',
      width: '15%'
    },
    {
      key: 'connectionString',
      label: 'Connexion',
      width: '50%',
      render: (ds) => {
        if (ds.type === DataSourceType.SQL) {
          return `${ds.host}:${ds.port}/${ds.database}`
        }
        return ds.url || ''
      }
    }
  ]

  const handleAdd = () => {
    setEditingSource(null)
    resetForm()
    setIsDialogOpen(true)
  }

  const handleEdit = (source: DataSource) => {
    setEditingSource(source)
    setName(source.name)
    setType(source.type)
    
    if (source.type === DataSourceType.SQL) {
      setHost(source.host || '')
      setPort(source.port?.toString() || '')
      setDatabase(source.database || '')
      setUsername(source.username || '')
      setPassword(source.password || '')
    } else {
      setUrl(source.url || '')
      setAuthType(source.authType || 'none')
      setAuthToken(source.authToken || '')
    }
    
    setIsDialogOpen(true)
  }

  const handleDelete = (source: DataSource) => {
    const confirmed = window.confirm(`Supprimer la source "${source.name}" ?`)
    if (confirmed) {
      onUpdate({
        dataSources: dataSources.filter(ds => ds.id !== source.id)
      })
    }
  }

  const resetForm = () => {
    setName('')
    setType(DataSourceType.SQL)
    setHost('')
    setPort('')
    setDatabase('')
    setUsername('')
    setPassword('')
    setUrl('')
    setAuthType('none')
    setAuthToken('')
  }

  const handleSave = () => {
    if (!name.trim()) {
      alert('Veuillez saisir un nom')
      return
    }

    if (type === DataSourceType.SQL) {
      if (!host || !port || !database) {
        alert('Veuillez remplir tous les champs de connexion SQL')
        return
      }
    } else if (type === DataSourceType.REST) {
      if (!url) {
        alert('Veuillez saisir l\'URL')
        return
      }
    }

    const newSource: DataSource = {
      id: editingSource?.id || generateId('ds'),
      name: name.trim(),
      type,
      host: type === DataSourceType.SQL ? host : undefined,
      port: type === DataSourceType.SQL ? parseInt(port) : undefined,
      database: type === DataSourceType.SQL ? database : undefined,
      username: type === DataSourceType.SQL ? username : undefined,
      password: type === DataSourceType.SQL ? password : undefined,
      url: type === DataSourceType.REST ? url : undefined,
      authType: type === DataSourceType.REST ? authType : undefined,
      authToken: type === DataSourceType.REST ? authToken : undefined
    }

    if (editingSource) {
      onUpdate({
        dataSources: dataSources.map(ds => ds.id === editingSource.id ? newSource : ds)
      })
    } else {
      onUpdate({
        dataSources: [...dataSources, newSource]
      })
    }

    setIsDialogOpen(false)
    resetForm()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Sources de Données</h3>
        <p className="text-sm text-muted-foreground">
          Enregistrez les connexions SQL et REST. Les indicateurs et stocks pourront ensuite les utiliser.
        </p>
      </div>

      {/* Bouton Ajouter */}
      <div>
        <Button onClick={handleAdd}>Ajouter une Source</Button>
      </div>

      {/* Table */}
      <FormTable
        columns={columns}
        data={dataSources}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSource ? 'Modifier la Source' : 'Nouvelle Source'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Nom */}
            <FormField
              label="Nom"
              value={name}
              onChange={setName}
              required
            />

            {/* Type */}
            <div>
              <label className="text-sm font-medium mb-2 block">Type :</label>
              <Select value={type} onValueChange={(v) => setType(v as DataSourceType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DataSourceType.SQL}>Base de données SQL</SelectItem>
                  <SelectItem value={DataSourceType.REST}>API REST</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* SQL Fields */}
            {type === DataSourceType.SQL && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Hôte"
                    value={host}
                    onChange={setHost}
                    required
                  />
                  <FormField
                    label="Port"
                    type="number"
                    value={port}
                    onChange={setPort}
                    required
                  />
                </div>
                <FormField
                  label="Base de données"
                  value={database}
                  onChange={setDatabase}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Utilisateur"
                    value={username}
                    onChange={setUsername}
                  />
                  <FormField
                    label="Mot de passe"
                    type="password"
                    value={password}
                    onChange={setPassword}
                  />
                </div>
              </div>
            )}

            {/* REST Fields */}
            {type === DataSourceType.REST && (
              <div className="space-y-4">
                <FormField
                  label="URL de base"
                  value={url}
                  onChange={setUrl}
                  required
                  placeholder="https://api.example.com"
                />
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Authentification :</label>
                  <Select value={authType} onValueChange={(v) => setAuthType(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune</SelectItem>
                      <SelectItem value="bearer">Bearer Token</SelectItem>
                      <SelectItem value="apikey">API Key</SelectItem>
                      <SelectItem value="basic">Basic Auth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {authType !== 'none' && (
                  <FormField
                    label={authType === 'bearer' ? 'Token' : authType === 'apikey' ? 'API Key' : 'Credentials'}
                    type="password"
                    value={authToken}
                    onChange={setAuthToken}
                  />
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
