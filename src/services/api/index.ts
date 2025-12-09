export { API_CONFIG } from './config';
export { socketService } from './socket';
export type { DiagramUpdateEvent, NodeUpdateEvent, CursorMoveEvent } from './socket';
export { 
  projectsApi, 
  diagramsApi, 
  checkHealth,
  type Project,
  type Diagram,
  type DiagramNode,
  type DiagramEdge,
  type NodeIndicators,
} from './client';
export { configurationApi, type ConfigurationSection } from './configuration';
export * as dataSourcesApi from './dataSources';
export * as analysisApi from './analysis';
