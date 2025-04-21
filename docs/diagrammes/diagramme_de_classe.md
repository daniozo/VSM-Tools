# 📦 Diagrammes de Classes - Client VSM (Qt)

> Ces diagrammes représentent la structure interne du client Qt de l'application VSM, regroupés par logique fonctionnelle : UI principale, éléments graphiques, modèles de données, communication réseau, stockage local, moteur de calcul, et plan d’action.

---

## 🎨 UI Principale (MainWindow et Docks)

```plantuml
@startuml MainWindow
class MainWindow {
    - menuBar: QMenuBar
    - toolBar: QToolBar
    - statusBar: QStatusBar
    - centralView: VsmGraphicsView
    - dockWidgets: List<QDockWidget>
}

MainWindow --> VsmGraphicsView
MainWindow --> PropertyEditorPanel
MainWindow --> SymbolPalettePanel
MainWindow --> TimelineWidget
@enduml
```

## 🗺️ Éléments Graphiques (VSM Scene et Items)

```plantuml
@startuml VsmGraphicsScene
class VsmGraphicsView {
    - scene: VsmGraphicsScene
}

class VsmGraphicsScene {
    - items: List<QGraphicsItem>
}

class VsmGraphicsItem <<abstract>> {
    + setPosition()
    + setSelected()
}

class ProcessItem
class StockItem
class FlowArrowItem
class KaizenBurstItem
class DataBoxItem

VsmGraphicsView --> VsmGraphicsScene
VsmGraphicsScene --> VsmGraphicsItem

VsmGraphicsItem <|-- ProcessItem
VsmGraphicsItem <|-- StockItem
VsmGraphicsItem <|-- FlowArrowItem
VsmGraphicsItem <|-- KaizenBurstItem
VsmGraphicsItem <|-- DataBoxItem
@enduml
```

## 🧠 Modèles de Données Métier (C++)

```plantuml
@startuml BusinessModels
class VsmMap {
    - processes: List<ProcessData>
    - stocks: List<StockData>
    - flows: List<FlowData>
    - metaData: MapMetaData
    - isFutureState: bool
}

class ProcessData {
    - cycleTime: double
    - VA: double
    - NVA: double
    - operators: int
    - TRS: double
}

class StockData {
    - quantity: int
    - type: string
}

class FlowData {
    - type: string
    - sourceId: string
    - targetId: string
    - flowMode: enum
}

class MapMetaData {
    - name: string
    - author: string
    - createdDate: Date
}

VsmMap --> ProcessData
VsmMap --> StockData
VsmMap --> FlowData
VsmMap --> MapMetaData
@enduml
```

## ⚙️ Panneaux Latéraux (UI)

```plantuml
@startuml UIPanels
class PropertyEditorPanel {
    - fields: QWidget[]
    + updateFromSelection(item)
}

class SymbolPalettePanel {
    - symbols: List<QPushButton>
}

class TimelineWidget {
    + drawTimeline(data: VsmMap)
}

MainWindow --> PropertyEditorPanel
MainWindow --> SymbolPalettePanel
MainWindow --> TimelineWidget
@enduml
```

## 🌐 Communication Réseau (Client-Serveur)

```plantuml
@startuml NetworkManager
class NetworkManager {
    - networkAccess: QNetworkAccessManager
    - authToken: string
    + login()
    + getMaps()
    + saveMap()
    + deleteMap()
}

NetworkManager --> VsmMap : JSON<->C++
@enduml
```

## 💾 Stockage Local (Fichiers et Base de Données)

```plantuml
@startuml LocalStorage
class LocalStorageManager {
    + saveMapToDisk(map: VsmMap, path: string)
    + loadMapFromDisk(path: string): VsmMap
}

LocalStorageManager --> VsmMap
@enduml
```

## ⚙️ Moteur de Calcul (Analyse et Optimisation)

```plantuml
@startuml CalculationEngine
class CalculationEngine {
    + computeLeadTime(map: VsmMap): double
    + computeVA(map: VsmMap): double
    + computeTaktTime(dailyTime: double, demand: int): double
    + detectBottlenecks(map: VsmMap): List<ProcessData>
}
@enduml
```

## 📝 Plan d'Action (Actions et Suivi)

```plantuml
@startuml ActionPlan
class ActionPlanManager {
    - actions: List<ActionItem>
    + addAction(item: KaizenBurstItem, action: ActionItem)
    + updateAction(id, data)
}

class ActionItem {
    - description: string
    - owner: string
    - dueDate: Date
    - status: string
}

KaizenBurstItem --> ActionItem
ActionPlanManager --> ActionItem
@enduml
```

## 🔒 Authentification

```plantuml
@startuml Auth
class LoginDialog {
    + getCredentials(): (string, string)
    + showError()
}

LoginDialog --> NetworkManager
@enduml
```

## 📦 Organisation Générale

```plantuml
@startuml GlobalOverview
package "UI" {
    class MainWindow
    class VsmGraphicsView
    class VsmGraphicsScene
    class PropertyEditorPanel
    class SymbolPalettePanel
    class TimelineWidget
}

package "Items Graphiques" {
    class ProcessItem
    class StockItem
    class FlowArrowItem
    class KaizenBurstItem
    class DataBoxItem
}

package "Modèle Métier" {
    class VsmMap
    class ProcessData
    class StockData
    class FlowData
    class MapMetaData
}

package "Services" {
    class NetworkManager
    class LocalStorageManager
    class CalculationEngine
    class ActionPlanManager
}

MainWindow --> VsmGraphicsView
MainWindow --> PropertyEditorPanel
MainWindow --> SymbolPalettePanel
MainWindow --> TimelineWidget

VsmGraphicsView --> VsmGraphicsScene
VsmGraphicsScene --> ProcessItem
VsmGraphicsScene --> StockItem
VsmGraphicsScene --> FlowArrowItem
VsmGraphicsScene --> KaizenBurstItem
VsmGraphicsScene --> DataBoxItem

MainWindow --> NetworkManager
MainWindow --> LocalStorageManager
MainWindow --> CalculationEngine
MainWindow --> ActionPlanManager
@enduml
```