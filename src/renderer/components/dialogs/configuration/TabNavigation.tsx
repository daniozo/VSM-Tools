/**
 * Navigation verticale par onglets pour le dialogue de configuration
 * 
 * Affiche la liste des onglets sur le côté gauche du dialogue
 */

import React from 'react'
import { Button } from '@/renderer/components/ui/button'
import { cn } from '@/lib/utils'
import { ConfigurationTab, TabItem } from './types'

interface TabNavigationProps {
  tabs: TabItem[]
  activeTab: ConfigurationTab
  onTabChange: (tab: ConfigurationTab) => void
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange
}) => {
  return (
    <div className="w-64 border-r bg-muted/30 p-4 space-y-2 overflow-y-auto">
      <h2 className="text-sm font-semibold text-muted-foreground mb-4 px-2">
        Configuration
      </h2>

      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant={activeTab === tab.id ? 'secondary' : 'ghost'}
          className={cn(
            'w-full justify-start text-left h-auto py-3 px-3',
            activeTab === tab.id && 'bg-secondary'
          )}
          onClick={() => onTabChange(tab.id)}
        >
          <div className="flex items-start gap-3 w-full">
            <div className="mt-0.5 shrink-0">
              {tab.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">
                {tab.label}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {tab.description}
              </div>
            </div>
          </div>
        </Button>
      ))}
    </div>
  )
}
