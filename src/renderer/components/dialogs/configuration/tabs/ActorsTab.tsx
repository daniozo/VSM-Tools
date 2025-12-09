/**
 * Onglet 3 : Acteurs Externes
 * 
 * Configure les acteurs externes : Fournisseur, Client, Centre de Contrôle
 */

import React from 'react'
import { VSMDiagram, DeliveryFrequency } from '@/shared/types/vsm-model'
import { FormField } from '../shared/FormField'

interface ActorsTabProps {
  diagram: VSMDiagram
  onUpdate: (updates: Partial<VSMDiagram>) => void
}

export const ActorsTab: React.FC<ActorsTabProps> = ({
  diagram,
  onUpdate
}) => {
  const updateSupplier = (field: string, value: any) => {
    onUpdate({
      actors: {
        ...diagram.actors,
        supplier: {
          ...diagram.actors.supplier,
          [field]: value
        }
      }
    })
  }

  const updateCustomer = (field: string, value: any) => {
    onUpdate({
      actors: {
        ...diagram.actors,
        customer: {
          ...diagram.actors.customer,
          [field]: value
        }
      }
    })
  }

  const updateControlCenter = (field: string, value: any) => {
    onUpdate({
      actors: {
        ...diagram.actors,
        controlCenter: {
          ...diagram.actors.controlCenter,
          [field]: value
        } as any
      }
    })
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          Acteurs Externes
        </h3>
        <p className="text-sm text-muted-foreground">
          Définissez les acteurs externes du processus de production
        </p>
      </div>

      {/* Section Fournisseur */}
      <div className="border rounded-lg p-6 space-y-4">
        <h4 className="font-semibold text-base">
          Fournisseur (Supplier)
        </h4>

        <FormField
          label="Nom du Fournisseur"
          value={diagram.actors.supplier.name}
          onChange={(v) => updateSupplier('name', v)}
          required
        />

        <FormField
          label="Contact"
          value={diagram.actors.supplier.contact || ''}
          onChange={(v) => updateSupplier('contact', v)}
          placeholder="Email, Téléphone..."
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Fréquence de Livraison <span className="text-red-500">*</span>
            </label>
            <select
              value={diagram.actors.supplier.deliveryFrequency}
              onChange={(e) => updateSupplier('deliveryFrequency', e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value={DeliveryFrequency.DAILY}>Quotidienne</option>
              <option value={DeliveryFrequency.WEEKLY}>Hebdomadaire</option>
              <option value={DeliveryFrequency.MONTHLY}>Mensuelle</option>
              <option value={DeliveryFrequency.CUSTOM}>Personnalisée</option>
            </select>
          </div>

          <FormField
            label="Délai de Livraison (jours)"
            value={diagram.actors.supplier.leadTime}
            onChange={(v) => updateSupplier('leadTime', parseFloat(v) || 0)}
            type="number"
            required
          />
        </div>

        {diagram.actors.supplier.deliveryFrequency === DeliveryFrequency.CUSTOM && (
          <FormField
            label="Fréquence Personnalisée"
            value={diagram.actors.supplier.customFrequency || ''}
            onChange={(v) => updateSupplier('customFrequency', v)}
            placeholder="Décrivez la fréquence (ex: tous les 3 jours, 2 fois par semaine...)"
            required
          />
        )}
      </div>

      {/* Section Client */}
      <div className="border rounded-lg p-6 space-y-4">
        <h4 className="font-semibold text-base">
          Client (Customer)
        </h4>

        <FormField
          label="Nom du Client"
          value={diagram.actors.customer.name}
          onChange={(v) => updateCustomer('name', v)}
          required
        />

        <FormField
          label="Contact"
          value={diagram.actors.customer.contact || ''}
          onChange={(v) => updateCustomer('contact', v)}
          placeholder="Email, Téléphone..."
        />

        <FormField
          label="Fréquence de Livraison"
          value={diagram.actors.customer.deliveryFrequency || ''}
          onChange={(v) => updateCustomer('deliveryFrequency', v)}
          placeholder="Quotidien, Hebdomadaire, etc."
          helperText="Fréquence de livraison des produits au client"
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Demande Quotidienne (unités/jour)"
            value={diagram.actors.customer.dailyDemand}
            onChange={(v) => {
              const demand = parseFloat(v) || 0
              const workingHours = diagram.actors.customer.workingHoursPerDay || 8
              const calculatedTaktTime = demand > 0 ? (workingHours * 3600) / demand : 0

              onUpdate({
                actors: {
                  ...diagram.actors,
                  customer: {
                    ...diagram.actors.customer,
                    dailyDemand: demand,
                    taktTime: calculatedTaktTime
                  }
                }
              })
            }}
            type="number"
            helperText="Nombre d'unités demandées par jour"
            required
          />

          <FormField
            label="Heures de Travail par Jour"
            value={diagram.actors.customer.workingHoursPerDay || 8}
            onChange={(v) => {
              const workingHours = parseFloat(v) || 8
              const demand = diagram.actors.customer.dailyDemand
              const calculatedTaktTime = demand > 0 ? (workingHours * 3600) / demand : 0

              onUpdate({
                actors: {
                  ...diagram.actors,
                  customer: {
                    ...diagram.actors.customer,
                    workingHoursPerDay: workingHours,
                    taktTime: calculatedTaktTime
                  }
                }
              })
            }}
            type="number"
            helperText="Temps de production disponible (heures/jour)"
            required
          />
        </div>

        <div className="border rounded-md bg-muted/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-semibold">Takt Time (calculé automatiquement)</label>
              <p className="text-xs text-muted-foreground mt-1">
                Formule: (Heures de travail × 3600) / Demande quotidienne
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {diagram.actors.customer.taktTime.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">secondes/unité</div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Centre de Contrôle */}
      <div className="border rounded-lg p-6 space-y-4">
        <h4 className="font-semibold text-base">
          Centre de Contrôle (Control Center)
        </h4>

        <FormField
          label="Nom"
          value={diagram.actors.controlCenter?.name || ''}
          onChange={(v) => updateControlCenter('name', v)}
        />

        <FormField
          label="Description"
          value={diagram.actors.controlCenter?.description || ''}
          onChange={(v) => updateControlCenter('description', v)}
          type="textarea"
          rows={3}
        />
      </div>
    </div>
  )
}
