/**
 * Onglet 1 : Informations Générales
 * 
 * Permet de configurer les métadonnées du diagramme VSM
 */

import React from 'react'
import { VSMDiagram } from '@/shared/types/vsm-model'
import { FormField } from '../shared/FormField'

interface GeneralInfoTabProps {
  diagram: VSMDiagram
  onUpdate: (updates: Partial<VSMDiagram>) => void
}

export const GeneralInfoTab: React.FC<GeneralInfoTabProps> = ({
  diagram,
  onUpdate
}) => {
  const updateMetaData = (field: string, value: string) => {
    onUpdate({
      metaData: {
        ...diagram.metaData,
        [field]: value
      }
    })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          Informations Générales
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Définissez les métadonnées du diagramme
        </p>
      </div>

      <FormField
        label="Nom du Diagramme"
        value={diagram.metaData.name}
        onChange={(value) => updateMetaData('name', value)}
        required
      />

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Description
        </label>
        <textarea
          value={diagram.metaData.description || ''}
          onChange={(e) => updateMetaData('description', e.target.value)}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ height: '120px', resize: 'none' }}
          placeholder="Description du processus"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Version"
          value={diagram.metaData.version}
          onChange={(value) => updateMetaData('version', value)}
          placeholder="Numéro de version"
          required
        />

        <FormField
          label="Auteur"
          value={diagram.metaData.author}
          onChange={(value) => updateMetaData('author', value)}
          placeholder="Votre nom"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Date de Création"
          value={new Date(diagram.metaData.createdDate).toLocaleString()}
          onChange={() => { }}
          disabled
        />

        <FormField
          label="Date de Modification"
          value={new Date(diagram.metaData.modifiedDate).toLocaleString()}
          onChange={() => { }}
          disabled
        />
      </div>
    </div>
  )
}
