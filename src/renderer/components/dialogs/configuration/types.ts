/**
 * Types pour la navigation des onglets du dialogue de configuration
 */

export type ConfigurationTab =
  | 'general'
  | 'dataSources'
  | 'actors'
  | 'processSteps'
  | 'indicators'
  | 'inventories'
  | 'materialFlows'
  | 'informationFlows'
  | 'analysis'

export interface TabItem {
  id: ConfigurationTab
  label: string
  icon: React.ReactNode
  description: string
}
