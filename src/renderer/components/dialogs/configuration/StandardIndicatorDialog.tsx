/**
 * Dialogue pour sélectionner un indicateur standard depuis la bibliothèque
 * 
 * Permet à l'utilisateur de parcourir les indicateurs standards par catégorie
 * et d'en sélectionner un pour l'ajouter à une étape de production.
 */

import React, { useState, useMemo } from 'react'
import {
  STANDARD_INDICATORS,
  StandardIndicator,
  IndicatorCategory,
  getAllCategories,
  getIndicatorsByCategory,
  searchIndicators
} from '@/shared/data/standardIndicators'
import { Button } from '@/renderer/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/renderer/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/renderer/components/ui/select'
import { Input } from '@/renderer/components/ui/input'
import { Label } from '@/renderer/components/ui/label'
import { Badge } from '@/renderer/components/ui/badge'
import { ScrollArea } from '@/renderer/components/ui/scroll-area'
import { Info } from 'lucide-react'

interface StandardIndicatorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (indicator: StandardIndicator) => void
}

export const StandardIndicatorDialog: React.FC<StandardIndicatorDialogProps> = ({
  open,
  onOpenChange,
  onSelect
}) => {
  const [selectedCategory, setSelectedCategory] = useState<IndicatorCategory | 'Toutes'>('Toutes')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndicator, setSelectedIndicator] = useState<StandardIndicator | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [detailIndicator, setDetailIndicator] = useState<StandardIndicator | null>(null)

  // Filtrer les indicateurs selon la catégorie et la recherche
  const filteredIndicators = useMemo(() => {
    let results = selectedCategory === 'Toutes'
      ? STANDARD_INDICATORS
      : getIndicatorsByCategory(selectedCategory)

    if (searchQuery.trim()) {
      const searchResults = searchIndicators(searchQuery)
      results = results.filter(ind => searchResults.includes(ind))
    }

    return results
  }, [selectedCategory, searchQuery])

  const handleSelect = () => {
    if (selectedIndicator) {
      onSelect(selectedIndicator)
      onOpenChange(false)
      setSelectedIndicator(null)
      setSearchQuery('')
      setSelectedCategory('Toutes')
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
    setSelectedIndicator(null)
    setSearchQuery('')
    setSelectedCategory('Toutes')
  }

  const handleShowDetail = (indicator: StandardIndicator, e: React.MouseEvent) => {
    e.stopPropagation()
    setDetailIndicator(indicator)
    setDetailDialogOpen(true)
  }

  const getModeVariant = (mode: 'Statique' | 'Dynamique' | 'Manuel') => {
    switch (mode) {
      case 'Statique': return 'secondary'
      case 'Dynamique': return 'default'
      case 'Manuel': return 'outline'
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Indicateurs Standards</DialogTitle>
            <DialogDescription>
              Sélectionnez un indicateur standard à ajouter
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Filtres */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Rechercher</Label>
                <Input
                  placeholder="Rechercher par nom..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="w-[200px]">
                <Label className="text-xs text-muted-foreground">Catégorie</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => setSelectedCategory(value as IndicatorCategory | 'Toutes')}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Toutes">Toutes</SelectItem>
                    {getAllCategories().map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Liste des indicateurs */}
            <ScrollArea className="h-[400px] border rounded-lg">
              <table className="w-full">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium w-[250px]">Nom</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Catégorie</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Unité</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Mode</th>
                    <th className="px-4 py-3 text-left text-sm font-medium w-[50px]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredIndicators.map(ind => (
                    <tr
                      key={ind.id}
                      className={`cursor-pointer hover:bg-muted/50 ${selectedIndicator?.id === ind.id ? 'bg-primary/10' : ''}`}
                      onClick={() => setSelectedIndicator(ind)}
                    >
                      <td className="px-4 py-3 text-sm font-medium">
                        <div>
                          <div>{ind.name}</div>
                          <div className="text-xs text-muted-foreground">{ind.technicalName}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant="outline">{ind.category}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">{ind.unit}</td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant={getModeVariant(ind.defaultMode)}>
                          {ind.defaultMode}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleShowDetail(ind, e)}
                          className="h-8 w-8"
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredIndicators.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        Aucun indicateur ne correspond à votre recherche.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Annuler
            </Button>
            <Button onClick={handleSelect} disabled={!selectedIndicator}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue de détail */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{detailIndicator?.name}</DialogTitle>
            <DialogDescription>{detailIndicator?.technicalName}</DialogDescription>
          </DialogHeader>
          {detailIndicator && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Description</Label>
                <p className="text-sm mt-1">{detailIndicator.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Catégorie</Label>
                  <p className="text-sm mt-1">{detailIndicator.category}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Unité</Label>
                  <p className="text-sm mt-1">{detailIndicator.unit}</p>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Mode par défaut</Label>
                <p className="text-sm mt-1">{detailIndicator.defaultMode}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Sources potentielles</Label>
                <p className="text-sm mt-1">{detailIndicator.potentialSources.join(', ')}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}