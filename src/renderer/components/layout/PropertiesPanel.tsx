/**
 * PropertiesPanel - Panneau des Propriétés
 * 
 * Selon conception_vsm_studio.md :
 * - Affiche les attributs de l'objet actuellement sélectionné
 * - Formulaire en lecture seule pour les propriétés principales du flux VSM
 * - Champs éditables pour modifications mineures (ex: nom d'un ImprovementPoint)
 * - Les propriétés structurelles se modifient via le Dialogue de Configuration
 */

import React from 'react'
import { ScrollArea } from '@/renderer/components/ui/scroll-area'
import { Label } from '@/renderer/components/ui/label'
import { Input } from '@/renderer/components/ui/input'
import { Badge } from '@/renderer/components/ui/badge'
import { Button } from '@/renderer/components/ui/button'
import { Separator } from '@/renderer/components/ui/separator'
import {
  Settings2,
  Info,
  Factory,
  Package,
  Users,
  Truck,
  ArrowRight,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PropertiesPanelProps {
  width: number
  selectedElementId: string | null
  className?: string
}

// Données de démonstration pour un élément sélectionné
interface ElementProperties {
  id: string
  name: string
  type: string
  typeLabel: string
  icon: React.ReactNode
  properties: { label: string; value: string; editable?: boolean }[]
  indicators?: { name: string; value: string; unit: string }[]
}

// Simulation de récupération des propriétés
const getElementProperties = (elementId: string | null): ElementProperties | null => {
  if (!elementId) return null

  // Données de démo basées sur l'ID
  if (elementId.startsWith('step-')) {
    return {
      id: elementId,
      name: 'Façonnage',
      type: 'process-step',
      typeLabel: 'Étape de Processus',
      icon: <Factory className="h-5 w-5" />,
      properties: [
        { label: 'Nom', value: 'Façonnage', editable: false },
        { label: 'Description', value: 'Mise en forme du métal', editable: false },
        { label: 'Opérateurs', value: '2', editable: false },
      ],
      indicators: [
        { name: 'Temps de Cycle', value: '45', unit: 'sec' },
        { name: 'Uptime', value: '92', unit: '%' },
        { name: 'FPY', value: '98.5', unit: '%' },
      ]
    }
  }

  if (elementId.startsWith('inv-')) {
    return {
      id: elementId,
      name: 'Stock Initial',
      type: 'inventory',
      typeLabel: 'Stock',
      icon: <Package className="h-5 w-5" />,
      properties: [
        { label: 'Type', value: 'Initial', editable: false },
        { label: 'Mode', value: 'Dynamique', editable: false },
        { label: 'Source', value: 'MES_Database', editable: false },
      ],
      indicators: [
        { name: 'Quantité', value: '1500', unit: 'pcs' },
        { name: 'Jours de Stock', value: '2.3', unit: 'jours' },
      ]
    }
  }

  if (elementId.startsWith('supplier-')) {
    return {
      id: elementId,
      name: 'Fournisseur Acier',
      type: 'supplier',
      typeLabel: 'Fournisseur',
      icon: <Truck className="h-5 w-5" />,
      properties: [
        { label: 'Nom', value: 'Fournisseur Acier', editable: false },
        { label: 'Fréquence', value: 'Hebdomadaire', editable: false },
      ]
    }
  }

  if (elementId.startsWith('customer-')) {
    return {
      id: elementId,
      name: 'Client Distribution',
      type: 'customer',
      typeLabel: 'Client',
      icon: <Users className="h-5 w-5" />,
      properties: [
        { label: 'Nom', value: 'Client Distribution', editable: false },
        { label: 'Fréquence', value: 'Journalière', editable: false },
      ]
    }
  }

  if (elementId.startsWith('flow-')) {
    return {
      id: elementId,
      name: 'Flux Matériel 1',
      type: 'material-flow',
      typeLabel: 'Flux Matériel',
      icon: <ArrowRight className="h-5 w-5" />,
      properties: [
        { label: 'Type', value: 'PUSH', editable: false },
        { label: 'Source', value: 'Nettoyage', editable: false },
        { label: 'Cible', value: 'Façonnage', editable: false },
      ]
    }
  }

  return null
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  width,
  selectedElementId,
  className
}) => {
  const element = getElementProperties(selectedElementId)

  return (
    <div
      className={cn('flex flex-col bg-background border-l', className)}
      style={{ width: `${width}px` }}
    >
      {/* En-tête */}
      <div className="flex items-center justify-between h-9 px-3 border-b bg-muted/30">
        <span className="text-sm font-medium">Propriétés</span>
      </div>

      <ScrollArea className="flex-1">
        {element ? (
          <div className="p-3 space-y-4">
            {/* Type et icône */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                {element.icon}
              </div>
              <div>
                <p className="font-medium">{element.name}</p>
                <Badge variant="secondary" className="text-xs">
                  {element.typeLabel}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Propriétés */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Informations</span>
              </div>

              {element.properties.map((prop, index) => (
                <div key={index} className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{prop.label}</Label>
                  <Input
                    value={prop.value}
                    readOnly={!prop.editable}
                    className={cn(
                      'h-8 text-sm',
                      !prop.editable && 'bg-muted/50 cursor-not-allowed'
                    )}
                  />
                </div>
              ))}
            </div>

            {/* Indicateurs */}
            {element.indicators && element.indicators.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Indicateurs</span>
                  </div>

                  <div className="space-y-2">
                    {element.indicators.map((ind, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                      >
                        <span className="text-sm">{ind.name}</span>
                        <span className="text-sm font-medium">
                          {ind.value} <span className="text-muted-foreground">{ind.unit}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Action pour ouvrir la configuration */}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => console.log('Ouvrir configuration pour:', element.id)}
            >
              <Settings2 className="h-4 w-4 mr-2" />
              Configurer...
            </Button>
          </div>
        ) : (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
            <Info className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">Sélectionnez un élément</p>
            <p className="text-xs mt-1">dans l'explorateur ou sur le canevas pour voir ses propriétés</p>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
