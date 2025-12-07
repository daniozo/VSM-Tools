# Assistant Chatbot VSM Studio - Agent Intelligent

**Version**: 1.0  
**Date**: 3 Décembre 2025  
**Branche**: `chatbot`  
**Statut**: 📝 Phase de documentation

---

## 🎯 Objectif

Intégrer un **assistant conversationnel intelligent** directement dans VSM Studio pour faciliter la configuration, l'analyse et la navigation dans les diagrammes VSM.

L'assistant agit comme un **agent autonome** capable de :
- 🔍 Comprendre les intentions de l'utilisateur
- 🛠️ Appeler des fonctions (tool calling) pour exécuter des actions
- 💬 Mener une conversation contextuelle
- ✅ Demander confirmation avant toute modification
- 📊 Fournir des analyses et insights

---

## 🎭 Personas et Cas d'Usage

### **Persona 1 : Lean Manager (Utilisateur Principal)**

**Besoins** :
- Créer rapidement des diagrammes VSM
- Analyser les performances de la chaîne
- Identifier les goulots d'étranglement
- Obtenir des suggestions d'amélioration

**Exemples de conversations** :

```
👤 "Crée un nouveau processus de production avec 4 étapes"
🤖 "D'accord ! Quels sont les noms des 4 étapes ?"

👤 "Découpe, Pliage, Soudure, Contrôle"
🤖 "✓ J'ai créé les 4 étapes. Voulez-vous configurer les temps de cycle maintenant ?"
   [Oui] [Non] [Ouvrir le dialogue de configuration]
```

```
👤 "Où est le goulot d'étranglement ?"
🤖 "🔍 Analyse en cours...
     
     Le goulot se trouve à l'étape **Soudure** :
     - Cycle Time: 45 min (le plus élevé)
     - Uptime: 68% (le plus faible)
     - Setup Time: 120 min
     
     💡 Suggestions d'amélioration :
     1. Réduire le temps de changement d'outil (SMED)
     2. Investiguer les causes d'arrêt (maintenance préventive)
     3. Former un second opérateur pour réduire la dépendance"
```

### **Persona 2 : Ingénieur Process (Utilisateur Avancé)**

**Besoins** :
- Configuration précise des connecteurs de données
- Analyse comparative de scénarios
- Export et documentation

**Exemples** :

```
👤 "Configure une source SQL pour récupérer l'uptime depuis la table production_metrics"
🤖 "Je vais configurer la source de données SQL.
     
     Informations nécessaires :
     - Serveur : [À renseigner]
     - Base de données : [À renseigner]
     - Requête SQL : SELECT uptime FROM production_metrics WHERE machine_id = ?
     
     Voulez-vous ouvrir le dialogue de configuration des sources de données ?"
     [Oui] [Saisir maintenant]
```

### **Persona 3 : Débutant VSM (Apprenant)**

**Besoins** :
- Comprendre les concepts VSM
- Être guidé pas à pas
- Apprendre par l'exemple

**Exemples** :

```
👤 "C'est quoi un flux FIFO ?"
🤖 "📚 Un flux FIFO (First In, First Out) signifie que les pièces sont traitées 
     dans l'ordre d'arrivée, sans dépassement possible.
     
     Caractéristiques :
     - ✓ Contrôle du WIP (Work In Progress)
     - ✓ Détection rapide des problèmes
     - ✓ Réduit les délais
     
     Dans VSM Studio, vous pouvez créer un flux FIFO entre deux étapes.
     Voulez-vous que je vous montre comment ?"
     [Oui, montre-moi] [Non merci]
```

---

## 🏗️ Architecture Technique

### Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                    VSM Studio (Eclipse RCP)                  │
│                                                              │
│  ┌────────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │   Explorer     │  │   Canvas     │  │   ChatPanel    │  │
│  │   (20%)        │  │   (60%)      │  │   (20%)        │  │
│  │                │  │              │  │                │  │
│  │  Projects      │  │  [Diagram]   │  │  💬 Assistant  │  │
│  │  - Projet A    │  │              │  │                │  │
│  │  - Projet B    │  │              │  │  👤 User msg   │  │
│  │                │  │              │  │  🤖 Bot reply  │  │
│  │                │  │              │  │                │  │
│  │                │  │              │  │  [Input box]   │  │
│  └────────────────┘  └──────────────┘  └────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ HTTP REST
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                 VSM Engine (Spring Boot)                     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              ChatService (Core)                      │   │
│  │  - Intent Recognition                                │   │
│  │  - Context Management                                │   │
│  │  - Tool Orchestration                                │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│         ┌─────────────────┼─────────────────┐               │
│         ▼                 ▼                 ▼               │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐            │
│  │ ReadTool │     │WriteTool │     │  UITool  │            │
│  │          │     │          │     │          │            │
│  │ get_*()  │     │create_*()│     │ open_*() │            │
│  └──────────┘     └──────────┘     └──────────┘            │
│                                                              │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           │ LLM API
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                 LLM Provider (Cloud)                         │
│                                                              │
│           OpenAI GPT-4 / Anthropic Claude 3.5               │
│                                                              │
│  - Function Calling Support                                 │
│  - Context Window: 128k tokens                              │
│  - Streaming responses                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 Composants Détaillés

### 1. ChatPanel (Frontend - VSM Studio)

**Responsabilités** :
- Afficher l'interface de conversation
- Gérer les entrées utilisateur
- Afficher les réponses du bot
- Gérer les boutons d'action (confirmation, annulation)

**Technologies** :
- **SWT Browser** avec contenu HTML/CSS/JavaScript
- **WebSocket** ou **HTTP Polling** pour communication temps réel
- **Local Storage** pour historique éphémère de session

**Structure UI** :

```java
public class ChatPanel extends ViewPart {
    private Browser browser;
    private ChatService chatService;
    
    @Override
    public void createPartControl(Composite parent) {
        browser = new Browser(parent, SWT.NONE);
        browser.setUrl("chatbot.html"); // HTML embarqué
        
        // Bridge JavaScript ↔ Java
        new BrowserFunction(browser, "sendMessage") {
            public Object function(Object[] arguments) {
                String userMessage = (String) arguments[0];
                return chatService.sendMessage(userMessage);
            }
        };
    }
}
```

**HTML Interface** :

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial; padding: 10px; }
        .chat-container { height: calc(100vh - 100px); overflow-y: auto; }
        .message { margin: 10px 0; padding: 10px; border-radius: 8px; }
        .user-message { background: #e3f2fd; text-align: right; }
        .bot-message { background: #f5f5f5; }
        .input-box { position: fixed; bottom: 0; width: 100%; }
        .action-buttons button { margin: 5px; padding: 8px 16px; }
    </style>
</head>
<body>
    <div class="chat-container" id="chatContainer">
        <!-- Messages apparaissent ici -->
    </div>
    <div class="input-box">
        <input type="text" id="userInput" placeholder="Tapez votre message..." />
        <button onclick="sendMessage()">Envoyer</button>
    </div>
    
    <script>
        function sendMessage() {
            const input = document.getElementById('userInput');
            const message = input.value;
            if (!message) return;
            
            // Afficher le message utilisateur
            appendMessage('user', message);
            input.value = '';
            
            // Envoyer au backend via bridge Java
            const response = sendMessage(message); // Appel Java
            appendMessage('bot', response);
        }
        
        function appendMessage(sender, text) {
            const container = document.getElementById('chatContainer');
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${sender}-message`;
            messageDiv.textContent = text;
            container.appendChild(messageDiv);
            container.scrollTop = container.scrollHeight;
        }
    </script>
</body>
</html>
```

---

### 2. ChatService (Backend - VSM Engine)

**Responsabilités** :
- Recevoir les messages utilisateur
- Appeler le LLM avec contexte et tools disponibles
- Exécuter les tools appelés par le LLM
- Retourner les réponses formatées

**API Endpoints** :

```java
@RestController
@RequestMapping("/api/chat")
public class ChatController {
    
    @Autowired
    private ChatService chatService;
    
    /**
     * Envoyer un message au chatbot
     */
    @PostMapping("/message")
    public ResponseEntity<ChatResponse> sendMessage(
        @RequestBody ChatRequest request
    ) {
        ChatResponse response = chatService.processMessage(request);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Confirmer une action proposée
     */
    @PostMapping("/confirm")
    public ResponseEntity<ChatResponse> confirmAction(
        @RequestBody ConfirmRequest request
    ) {
        ChatResponse response = chatService.executeAction(request.getActionId());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Annuler une action proposée
     */
    @PostMapping("/cancel")
    public ResponseEntity<Void> cancelAction(
        @RequestBody CancelRequest request
    ) {
        chatService.cancelAction(request.getActionId());
        return ResponseEntity.ok().build();
    }
}
```

**Modèles de données** :

```java
@Data
public class ChatRequest {
    private String message;
    private String sessionId;
    private String projectId; // Contexte du projet actif
}

@Data
public class ChatResponse {
    private String message;
    private MessageType type; // TEXT, ACTION_REQUEST, CONFIRMATION
    private List<ActionButton> buttons;
    private String actionId; // Si confirmation nécessaire
    private Map<String, Object> metadata;
}

public enum MessageType {
    TEXT,              // Simple réponse textuelle
    ACTION_REQUEST,    // Demande de confirmation avant action
    CONFIRMATION,      // Confirmation d'action exécutée
    ERROR             // Erreur lors de l'exécution
}

@Data
public class ActionButton {
    private String label;     // "Oui", "Non", "Ouvrir Config"
    private String action;    // "confirm", "cancel", "open_dialog"
    private Map<String, String> params;
}
```

**Service Principal** :

```java
@Service
public class ChatService {
    
    @Autowired
    private LLMClient llmClient;
    
    @Autowired
    private ToolRegistry toolRegistry;
    
    @Autowired
    private VsmStateService vsmStateService;
    
    /**
     * Traiter un message utilisateur
     */
    public ChatResponse processMessage(ChatRequest request) {
        
        // 1. Récupérer le contexte du projet actif
        VSMDiagram diagram = vsmStateService.getCurrentDiagram(request.getProjectId());
        
        // 2. Construire le prompt système avec contexte
        String systemPrompt = buildSystemPrompt(diagram);
        
        // 3. Préparer les tools disponibles
        List<ToolDefinition> tools = toolRegistry.getAvailableTools();
        
        // 4. Appeler le LLM
        LLMResponse llmResponse = llmClient.chat(
            systemPrompt,
            request.getMessage(),
            tools
        );
        
        // 5. Si le LLM veut appeler un tool
        if (llmResponse.hasToolCalls()) {
            return handleToolCalls(llmResponse);
        }
        
        // 6. Sinon, retourner la réponse textuelle
        return ChatResponse.builder()
            .message(llmResponse.getContent())
            .type(MessageType.TEXT)
            .build();
    }
    
    /**
     * Gérer les appels de tools par le LLM
     */
    private ChatResponse handleToolCalls(LLMResponse llmResponse) {
        
        List<ToolCall> toolCalls = llmResponse.getToolCalls();
        
        for (ToolCall toolCall : toolCalls) {
            
            Tool tool = toolRegistry.getTool(toolCall.getName());
            
            // Si le tool nécessite confirmation (write operations)
            if (tool.requiresConfirmation()) {
                
                // Générer un ID d'action unique
                String actionId = UUID.randomUUID().toString();
                
                // Stocker l'action en attente
                pendingActions.put(actionId, toolCall);
                
                // Demander confirmation à l'utilisateur
                return ChatResponse.builder()
                    .message(tool.getConfirmationMessage(toolCall.getArguments()))
                    .type(MessageType.ACTION_REQUEST)
                    .actionId(actionId)
                    .buttons(Arrays.asList(
                        new ActionButton("Oui", "confirm"),
                        new ActionButton("Non", "cancel")
                    ))
                    .build();
            }
            
            // Sinon, exécuter directement (read operations)
            Object result = tool.execute(toolCall.getArguments());
            
            // Retourner le résultat à l'utilisateur
            return ChatResponse.builder()
                .message(formatResult(result))
                .type(MessageType.TEXT)
                .build();
        }
        
        return null;
    }
    
    /**
     * Exécuter une action confirmée
     */
    public ChatResponse executeAction(String actionId) {
        
        ToolCall toolCall = pendingActions.get(actionId);
        if (toolCall == null) {
            throw new IllegalArgumentException("Action non trouvée");
        }
        
        Tool tool = toolRegistry.getTool(toolCall.getName());
        Object result = tool.execute(toolCall.getArguments());
        
        // Supprimer de la queue
        pendingActions.remove(actionId);
        
        return ChatResponse.builder()
            .message("✓ " + tool.getSuccessMessage(result))
            .type(MessageType.CONFIRMATION)
            .build();
    }
    
    /**
     * Construire le prompt système avec contexte
     */
    private String buildSystemPrompt(VSMDiagram diagram) {
        return String.format("""
            Tu es un assistant expert en Value Stream Mapping intégré dans VSM Studio.
            
            Contexte actuel :
            - Diagramme : %s
            - Nombre d'étapes : %d
            - Nombre de flux : %d
            - Lead Time total : %s jours
            
            Capacités :
            - Tu peux lire et analyser le diagramme
            - Tu peux créer/modifier des éléments (avec confirmation)
            - Tu peux calculer des métriques
            - Tu peux donner des conseils d'amélioration
            
            Règles :
            - Toujours demander confirmation avant de modifier
            - Être concis et précis
            - Utiliser des emojis pour la clarté
            - Proposer des actions concrètes
            """,
            diagram.getName(),
            diagram.getProcessSteps().size(),
            diagram.getMaterialFlows().size(),
            calculateLeadTime(diagram)
        );
    }
}
```

---

### 3. LLM Client (Intégration Cloud)

**Responsabilités** :
- Appeler l'API du LLM (OpenAI, Claude)
- Gérer le streaming des réponses
- Parser les tool calls
- Gérer les erreurs et retry

**Configuration** :

```yaml
# application.yml
llm:
  provider: openai  # ou anthropic
  api-key: ${LLM_API_KEY}
  model: gpt-4-turbo-preview  # ou claude-3-5-sonnet-20241022
  max-tokens: 2000
  temperature: 0.7
  streaming: true
```

**Implémentation OpenAI** :

```java
@Service
public class OpenAIClient implements LLMClient {
    
    @Value("${llm.api-key}")
    private String apiKey;
    
    @Value("${llm.model}")
    private String model;
    
    private final RestTemplate restTemplate;
    
    @Override
    public LLMResponse chat(
        String systemPrompt,
        String userMessage,
        List<ToolDefinition> tools
    ) {
        
        String url = "https://api.openai.com/v1/chat/completions";
        
        // Construire le payload
        Map<String, Object> payload = new HashMap<>();
        payload.put("model", model);
        payload.put("messages", Arrays.asList(
            Map.of("role", "system", "content", systemPrompt),
            Map.of("role", "user", "content", userMessage)
        ));
        payload.put("tools", convertToolsToOpenAIFormat(tools));
        payload.put("tool_choice", "auto");
        
        // Headers
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
        
        // Appel API
        ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
        
        // Parser la réponse
        return parseOpenAIResponse(response.getBody());
    }
    
    private List<Map<String, Object>> convertToolsToOpenAIFormat(List<ToolDefinition> tools) {
        return tools.stream().map(tool -> Map.of(
            "type", "function",
            "function", Map.of(
                "name", tool.getName(),
                "description", tool.getDescription(),
                "parameters", tool.getParametersSchema()
            )
        )).collect(Collectors.toList());
    }
}
```

---

## 🛠️ Tools Registry - Fonctions Disponibles

### Catégories de Tools

```java
public interface Tool {
    String getName();
    String getDescription();
    Map<String, Object> getParametersSchema();
    boolean requiresConfirmation();
    Object execute(Map<String, Object> arguments);
    String getConfirmationMessage(Map<String, Object> arguments);
    String getSuccessMessage(Object result);
}
```

### **Groupe 1 : READ TOOLS (Pas de confirmation nécessaire)**

#### **1.1 get_diagram_info**

```java
@Component
public class GetDiagramInfoTool implements Tool {
    
    @Override
    public String getName() {
        return "get_diagram_info";
    }
    
    @Override
    public String getDescription() {
        return "Récupère les informations générales du diagramme VSM actif";
    }
    
    @Override
    public Map<String, Object> getParametersSchema() {
        return Map.of(
            "type", "object",
            "properties", Map.of(),
            "required", List.of()
        );
    }
    
    @Override
    public boolean requiresConfirmation() {
        return false;
    }
    
    @Override
    public Object execute(Map<String, Object> arguments) {
        VSMDiagram diagram = vsmStateService.getCurrentDiagram();
        return Map.of(
            "name", diagram.getName(),
            "version", diagram.getVersion(),
            "processSteps", diagram.getProcessSteps().size(),
            "inventories", diagram.getInventories().size(),
            "materialFlows", diagram.getMaterialFlows().size(),
            "informationFlows", diagram.getInformationFlows().size()
        );
    }
}
```

#### **1.2 get_process_steps**

```java
@Component
public class GetProcessStepsTool implements Tool {
    
    @Override
    public String getName() {
        return "get_process_steps";
    }
    
    @Override
    public String getDescription() {
        return "Liste toutes les étapes de processus du diagramme";
    }
    
    @Override
    public Object execute(Map<String, Object> arguments) {
        VSMDiagram diagram = vsmStateService.getCurrentDiagram();
        return diagram.getProcessSteps().stream()
            .map(step -> Map.of(
                "id", step.getId(),
                "name", step.getName(),
                "cycleTime", getIndicatorValue(step, "cycle_time"),
                "uptime", getIndicatorValue(step, "uptime"),
                "operators", step.getNumberOfOperators()
            ))
            .collect(Collectors.toList());
    }
}
```

#### **1.3 calculate_lead_time**

```java
@Component
public class CalculateLeadTimeTool implements Tool {
    
    @Override
    public String getName() {
        return "calculate_lead_time";
    }
    
    @Override
    public String getDescription() {
        return "Calcule le Lead Time total de la chaîne de valeur";
    }
    
    @Override
    public Object execute(Map<String, Object> arguments) {
        VSMDiagram diagram = vsmStateService.getCurrentDiagram();
        
        double totalLeadTime = 0.0;
        
        // Somme des temps d'attente (inventaires)
        for (Inventory inv : diagram.getInventories()) {
            String durationStr = inv.getDurationDays();
            if (durationStr != null) {
                totalLeadTime += Double.parseDouble(durationStr);
            }
        }
        
        // Somme des temps de traitement (process steps)
        for (ProcessStep step : diagram.getProcessSteps()) {
            String ctStr = getIndicatorValue(step, "cycle_time");
            if (ctStr != null) {
                totalLeadTime += Double.parseDouble(ctStr) / (8 * 60); // Convertir min → jours
            }
        }
        
        return Map.of(
            "leadTimeDays", totalLeadTime,
            "leadTimeHours", totalLeadTime * 24,
            "unit", "days"
        );
    }
}
```

#### **1.4 find_bottleneck**

```java
@Component
public class FindBottleneckTool implements Tool {
    
    @Override
    public String getName() {
        return "find_bottleneck";
    }
    
    @Override
    public String getDescription() {
        return "Identifie le goulot d'étranglement de la chaîne";
    }
    
    @Override
    public Object execute(Map<String, Object> arguments) {
        VSMDiagram diagram = vsmStateService.getCurrentDiagram();
        
        ProcessStep bottleneck = null;
        double maxCycleTime = 0.0;
        
        for (ProcessStep step : diagram.getProcessSteps()) {
            String ctStr = getIndicatorValue(step, "cycle_time");
            if (ctStr != null) {
                double ct = Double.parseDouble(ctStr);
                if (ct > maxCycleTime) {
                    maxCycleTime = ct;
                    bottleneck = step;
                }
            }
        }
        
        if (bottleneck == null) {
            return Map.of("found", false);
        }
        
        return Map.of(
            "found", true,
            "stepId", bottleneck.getId(),
            "stepName", bottleneck.getName(),
            "cycleTime", maxCycleTime,
            "uptime", getIndicatorValue(bottleneck, "uptime"),
            "suggestions", generateImprovementSuggestions(bottleneck)
        );
    }
}
```

#### **1.5 get_improvement_suggestions**

```java
@Component
public class GetImprovementSuggestionsTool implements Tool {
    
    @Override
    public String getName() {
        return "get_improvement_suggestions";
    }
    
    @Override
    public String getDescription() {
        return "Génère des suggestions d'amélioration basées sur l'analyse du diagramme";
    }
    
    @Override
    public Object execute(Map<String, Object> arguments) {
        VSMDiagram diagram = vsmStateService.getCurrentDiagram();
        
        List<String> suggestions = new ArrayList<>();
        
        // Analyser les inventaires excessifs
        for (Inventory inv : diagram.getInventories()) {
            double duration = Double.parseDouble(inv.getDurationDays());
            if (duration > 3) {
                suggestions.add(String.format(
                    "📦 Réduire l'inventaire '%s' (actuellement %s jours). Target: < 3 jours",
                    inv.getName(), duration
                ));
            }
        }
        
        // Analyser les temps de changement
        for (ProcessStep step : diagram.getProcessSteps()) {
            String setupStr = getIndicatorValue(step, "setup_time");
            if (setupStr != null) {
                double setupTime = Double.parseDouble(setupStr);
                if (setupTime > 60) {
                    suggestions.add(String.format(
                        "⚡ Appliquer SMED sur '%s' (C/O actuel: %s min). Target: < 10 min",
                        step.getName(), setupTime
                    ));
                }
            }
        }
        
        // Analyser les uptimes faibles
        for (ProcessStep step : diagram.getProcessSteps()) {
            String uptimeStr = getIndicatorValue(step, "uptime");
            if (uptimeStr != null) {
                double uptime = Double.parseDouble(uptimeStr);
                if (uptime < 85) {
                    suggestions.add(String.format(
                        "🔧 Améliorer la disponibilité de '%s' (actuellement %s%%). Target: > 90%%",
                        step.getName(), uptime
                    ));
                }
            }
        }
        
        return Map.of("suggestions", suggestions);
    }
}
```

---

### **Groupe 2 : WRITE TOOLS (Confirmation requise)**

#### **2.1 create_process_step**

```java
@Component
public class CreateProcessStepTool implements Tool {
    
    @Override
    public String getName() {
        return "create_process_step";
    }
    
    @Override
    public String getDescription() {
        return "Crée une nouvelle étape de processus dans le diagramme";
    }
    
    @Override
    public Map<String, Object> getParametersSchema() {
        return Map.of(
            "type", "object",
            "properties", Map.of(
                "name", Map.of("type", "string", "description", "Nom de l'étape"),
                "operators", Map.of("type", "integer", "description", "Nombre d'opérateurs")
            ),
            "required", List.of("name")
        );
    }
    
    @Override
    public boolean requiresConfirmation() {
        return true;
    }
    
    @Override
    public String getConfirmationMessage(Map<String, Object> arguments) {
        return String.format(
            "Voulez-vous créer une étape de processus '%s' avec %s opérateur(s) ?",
            arguments.get("name"),
            arguments.getOrDefault("operators", 1)
        );
    }
    
    @Override
    public Object execute(Map<String, Object> arguments) {
        VSMDiagram diagram = vsmStateService.getCurrentDiagram();
        
        ProcessStep newStep = VsmFactory.eINSTANCE.createProcessStep();
        newStep.setId(UUID.randomUUID().toString());
        newStep.setName((String) arguments.get("name"));
        newStep.setNumberOfOperators((Integer) arguments.getOrDefault("operators", 1));
        
        diagram.getProcessSteps().add(newStep);
        vsmStateService.saveDiagram(diagram);
        
        return Map.of(
            "id", newStep.getId(),
            "name", newStep.getName()
        );
    }
    
    @Override
    public String getSuccessMessage(Object result) {
        Map<String, String> res = (Map<String, String>) result;
        return String.format("Étape '%s' créée avec succès", res.get("name"));
    }
}
```

#### **2.2 create_material_flow**

```java
@Component
public class CreateMaterialFlowTool implements Tool {
    
    @Override
    public String getName() {
        return "create_material_flow";
    }
    
    @Override
    public String getDescription() {
        return "Crée un flux matériel entre deux éléments";
    }
    
    @Override
    public Map<String, Object> getParametersSchema() {
        return Map.of(
            "type", "object",
            "properties", Map.of(
                "fromId", Map.of("type", "string", "description", "ID de l'élément source"),
                "toId", Map.of("type", "string", "description", "ID de l'élément cible"),
                "flowType", Map.of("type", "string", "enum", List.of("PUSH", "PULL", "FIFO", "SUPERMARKET"))
            ),
            "required", List.of("fromId", "toId", "flowType")
        );
    }
    
    @Override
    public boolean requiresConfirmation() {
        return true;
    }
    
    @Override
    public Object execute(Map<String, Object> arguments) {
        VSMDiagram diagram = vsmStateService.getCurrentDiagram();
        
        String fromId = (String) arguments.get("fromId");
        String toId = (String) arguments.get("toId");
        String flowTypeStr = (String) arguments.get("flowType");
        
        VSMElement source = findElementById(diagram, fromId);
        VSMElement target = findElementById(diagram, toId);
        
        MaterialFlow flow = VsmFactory.eINSTANCE.createMaterialFlow();
        flow.setId(UUID.randomUUID().toString());
        flow.setSource(source);
        flow.setTarget(target);
        flow.setFlowType(FlowType.valueOf(flowTypeStr));
        
        diagram.getMaterialFlows().add(flow);
        vsmStateService.saveDiagram(diagram);
        
        return Map.of("id", flow.getId());
    }
}
```

#### **2.3 update_indicator**

```java
@Component
public class UpdateIndicatorTool implements Tool {
    
    @Override
    public String getName() {
        return "update_indicator";
    }
    
    @Override
    public String getDescription() {
        return "Met à jour la valeur d'un indicateur";
    }
    
    @Override
    public Map<String, Object> getParametersSchema() {
        return Map.of(
            "type", "object",
            "properties", Map.of(
                "stepId", Map.of("type", "string"),
                "indicatorName", Map.of("type", "string"),
                "value", Map.of("type", "string")
            ),
            "required", List.of("stepId", "indicatorName", "value")
        );
    }
    
    @Override
    public boolean requiresConfirmation() {
        return true;
    }
    
    @Override
    public Object execute(Map<String, Object> arguments) {
        // Implémenter la logique de mise à jour
        // ...
        return Map.of("success", true);
    }
}
```

---

### **Groupe 3 : UI TOOLS (Actions d'interface)**

#### **3.1 open_config_dialog**

```java
@Component
public class OpenConfigDialogTool implements Tool {
    
    @Override
    public String getName() {
        return "open_config_dialog";
    }
    
    @Override
    public String getDescription() {
        return "Ouvre le dialogue de configuration du diagramme";
    }
    
    @Override
    public Map<String, Object> getParametersSchema() {
        return Map.of(
            "type", "object",
            "properties", Map.of(
                "tab", Map.of(
                    "type", "string",
                    "enum", List.of("general", "data_sources", "nodes", "sequencing", "info_flows", "indicators"),
                    "description", "Onglet à ouvrir (optionnel)"
                )
            )
        );
    }
    
    @Override
    public boolean requiresConfirmation() {
        return false; // Pas de confirmation pour ouvrir un dialogue
    }
    
    @Override
    public Object execute(Map<String, Object> arguments) {
        String tab = (String) arguments.get("tab");
        
        // Envoyer un événement au frontend pour ouvrir le dialogue
        uiEventService.fireEvent(new OpenConfigDialogEvent(tab));
        
        return Map.of(
            "action", "open_config_dialog",
            "tab", tab != null ? tab : "general"
        );
    }
}
```

#### **3.2 zoom_to_element**

```java
@Component
public class ZoomToElementTool implements Tool {
    
    @Override
    public String getName() {
        return "zoom_to_element";
    }
    
    @Override
    public String getDescription() {
        return "Zoome et centre la vue sur un élément spécifique du diagramme";
    }
    
    @Override
    public Object execute(Map<String, Object> arguments) {
        String elementId = (String) arguments.get("elementId");
        
        uiEventService.fireEvent(new ZoomToElementEvent(elementId));
        
        return Map.of("action", "zoom_to_element", "elementId", elementId);
    }
}
```

#### **3.3 export_diagram**

```java
@Component
public class ExportDiagramTool implements Tool {
    
    @Override
    public String getName() {
        return "export_diagram";
    }
    
    @Override
    public String getDescription() {
        return "Exporte le diagramme dans un format spécifique";
    }
    
    @Override
    public Map<String, Object> getParametersSchema() {
        return Map.of(
            "type", "object",
            "properties", Map.of(
                "format", Map.of(
                    "type", "string",
                    "enum", List.of("PDF", "PNG", "SVG"),
                    "description", "Format d'export"
                ),
                "filename", Map.of("type", "string", "description", "Nom du fichier (optionnel)")
            ),
            "required", List.of("format")
        );
    }
    
    @Override
    public boolean requiresConfirmation() {
        return false;
    }
    
    @Override
    public Object execute(Map<String, Object> arguments) {
        String format = (String) arguments.get("format");
        String filename = (String) arguments.getOrDefault("filename", "diagram." + format.toLowerCase());
        
        uiEventService.fireEvent(new ExportDiagramEvent(format, filename));
        
        return Map.of(
            "action", "export_diagram",
            "format", format,
            "filename", filename
        );
    }
}
```

---

## 💬 Workflows de Conversation Types

### **Workflow 1 : Création d'Étapes Multiples**

```
👤 "Crée un processus avec 4 étapes : Découpe, Pliage, Soudure, Contrôle"

🤖 [LLM décompose en 4 appels de create_process_step]
   "Je vais créer les 4 étapes suivantes :
    1. Découpe
    2. Pliage
    3. Soudure
    4. Contrôle
    
    Confirmez-vous ?"
    [Oui] [Non]

👤 [Clic sur "Oui"]

🤖 [Exécute les 4 créations]
   "✓ Les 4 étapes ont été créées avec succès !
    
    Souhaitez-vous maintenant :
    - Configurer les temps de cycle ?
    - Créer les flux entre les étapes ?
    - Ouvrir le dialogue de configuration ?"
    [Config temps] [Config flux] [Ouvrir dialogue]
```

### **Workflow 2 : Analyse et Suggestion**

```
👤 "Analyse mon diagramme et donne-moi des conseils"

🤖 [Appelle get_diagram_info, calculate_lead_time, find_bottleneck, get_improvement_suggestions]
   "📊 Analyse complète :
    
    🔍 Vue d'ensemble :
    - 5 étapes de production
    - Lead Time total : 8.5 jours
    - Process Time total : 147 minutes
    - %C&A : 2.4% (très faible !)
    
    🚨 Goulot d'étranglement identifié :
    Étape **Soudure**
    - Cycle Time : 45 min (le plus élevé)
    - Uptime : 68% (problèmes de disponibilité)
    
    💡 Mes suggestions :
    1. Réduire le stock entre Pliage et Soudure (actuellement 4 jours)
    2. Appliquer SMED sur Soudure (C/O = 120 min)
    3. Investiguer les causes d'arrêt de Soudure (uptime faible)
    
    Voulez-vous que je détaille l'une de ces suggestions ?"
    [Détailler 1] [Détailler 2] [Détailler 3] [Créer un plan d'action]
```

### **Workflow 3 : Configuration Guidée**

```
👤 "Comment configurer une source de données SQL ?"

🤖 "Je vais vous guider pour configurer une source SQL.
    
    Informations nécessaires :
    1. Nom de la source (ex: 'MES_Production')
    2. Serveur (ex: 'localhost:5432')
    3. Base de données (ex: 'manufacturing')
    4. Table/Vue à interroger
    
    Commençons : Quel nom voulez-vous donner à cette source ?"

👤 "MES_Production"

🤖 "Parfait. Quelle est l'adresse du serveur SQL ?"

👤 "192.168.1.100:5432"

🤖 "Bien. Nom de la base de données ?"

👤 "production_db"

🤖 "Excellent. Je peux maintenant créer cette source.
    
    Résumé :
    - Nom : MES_Production
    - Serveur : 192.168.1.100:5432
    - BDD : production_db
    - Type : PostgreSQL (détecté)
    
    Créer cette source ?"
    [Oui] [Modifier] [Annuler]
```

### **Workflow 4 : Aide Contextuelle**

```
👤 "C'est quoi un flux FIFO ?"

🤖 "📚 **FIFO (First In, First Out)**
    
    Définition :
    Les pièces sont traitées dans l'ordre strict d'arrivée, 
    sans dépassement possible.
    
    Caractéristiques VSM :
    - ✓ Contrôle du WIP (Work In Progress)
    - ✓ Délai prévisible
    - ✓ Détection rapide des problèmes qualité
    - ✓ Signal visuel de l'état du flux
    
    Quand l'utiliser :
    - Entre deux étapes proches physiquement
    - Quand le temps de cycle est court
    - Pour limiter le stock entre les étapes
    
    Dans votre diagramme, vous avez actuellement 0 flux FIFO.
    
    Voulez-vous en créer un ?"
    [Oui, créer] [Non merci] [En savoir plus]
```

---

## 🎨 Design de l'Interface Chat

### Layout dans VSM Studio

```
┌───────────────────────────────────────────────────────────────────┐
│  VSM Studio                                    [−] [□] [×]         │
├───────────────────────────────────────────────────────────────────┤
│  File  Edit  View  Project  Help                                  │
├──────────────┬────────────────────────────────┬───────────────────┤
│              │                                │                   │
│  Explorer    │         Canvas                 │  💬 Assistant     │
│  (20%)       │         (60%)                  │  (20%)            │
│              │                                │                   │
│  📁 Projets  │    ┌──────────┐               │  ┌─────────────┐ │
│  └─📊 Ligne  │    │ Découpe  │               │  │ 👤 User     │ │
│     ├─diagram│    └──────────┘               │  │ Analyse mon │ │
│     ├─notes  │         │                      │  │ diagramme   │ │
│     └─exports│         ▼                      │  └─────────────┘ │
│              │    ┌──────────┐               │                   │
│              │    │  Pliage  │               │  ┌─────────────┐ │
│              │    └──────────┘               │  │ 🤖 Bot      │ │
│              │         │                      │  │ Analyse en  │ │
│              │         ▼                      │  │ cours...    │ │
│              │    ┌──────────┐               │  └─────────────┘ │
│              │    │ Soudure  │ ⚠️            │                   │
│              │    └──────────┘               │  ┌─────────────┐ │
│              │                                │  │ Type here...│ │
│              │                                │  └─────────────┘ │
│              │                                │   [Send] 🎤      │
└──────────────┴────────────────────────────────┴───────────────────┘
```

### États du ChatPanel

#### **État 1 : Collapsed (Minimisé)**

```
┌─────────────────┐
│ 💬 Assistant    │
│ [Expand]        │
└─────────────────┘
```

#### **État 2 : Expanded (Normal)**

```
┌──────────────────────────────┐
│ 💬 Assistant VSM    [−] [×]  │
├──────────────────────────────┤
│                              │
│  [Historique de chat]        │
│                              │
│                              │
│                              │
├──────────────────────────────┤
│ Type your message...  [Send] │
└──────────────────────────────┘
```

#### **État 3 : Confirmation Pending**

```
┌──────────────────────────────┐
│ 💬 Assistant VSM             │
├──────────────────────────────┤
│ 🤖 Bot:                      │
│ Voulez-vous créer une étape  │
│ "Assemblage" avec 3          │
│ opérateurs ?                 │
│                              │
│   [✓ Oui]  [✗ Non]          │
├──────────────────────────────┤
│ [Waiting for confirmation]   │
└──────────────────────────────┘
```

---

## 🔐 Sécurité et Permissions

### Contrôle d'Accès aux Tools

```java
@Service
public class ToolSecurityService {
    
    /**
     * Vérifier si l'utilisateur peut exécuter un tool
     */
    public boolean canExecute(User user, Tool tool) {
        
        // Les read tools sont accessibles à tous
        if (!tool.requiresConfirmation()) {
            return true;
        }
        
        // Les write tools nécessitent des permissions
        switch (tool.getName()) {
            case "create_process_step":
            case "create_material_flow":
            case "update_indicator":
                return user.hasPermission("EDIT_DIAGRAM");
                
            case "delete_process_step":
            case "delete_flow":
                return user.hasPermission("DELETE_ELEMENTS");
                
            default:
                return false;
        }
    }
}
```

### Protection contre l'Injection

```java
@Component
public class InputSanitizer {
    
    /**
     * Nettoyer les entrées utilisateur avant envoi au LLM
     */
    public String sanitize(String userInput) {
        
        // Supprimer les caractères dangereux
        String cleaned = userInput
            .replaceAll("[<>]", "")
            .replaceAll("\\{\\{.*?\\}\\}", "")
            .trim();
        
        // Limiter la longueur
        if (cleaned.length() > 1000) {
            cleaned = cleaned.substring(0, 1000);
        }
        
        return cleaned;
    }
}
```

### Rate Limiting

```java
@Component
public class RateLimiter {
    
    private final Map<String, Queue<Long>> userRequests = new HashMap<>();
    
    /**
     * Limiter à 10 requêtes par minute par utilisateur
     */
    public boolean allowRequest(String userId) {
        
        Queue<Long> requests = userRequests.computeIfAbsent(userId, k -> new LinkedList<>());
        long now = System.currentTimeMillis();
        
        // Supprimer les requêtes > 1 minute
        requests.removeIf(timestamp -> now - timestamp > 60000);
        
        if (requests.size() >= 10) {
            return false;
        }
        
        requests.add(now);
        return true;
    }
}
```

---

## 📊 Métriques et Monitoring

### Indicateurs à Suivre

```java
@Service
public class ChatMetricsService {
    
    @Autowired
    private MeterRegistry meterRegistry;
    
    public void recordConversation(String intent, boolean success, long durationMs) {
        
        // Nombre de conversations
        meterRegistry.counter("chat.conversations.total",
            "intent", intent,
            "success", String.valueOf(success)
        ).increment();
        
        // Durée des réponses
        meterRegistry.timer("chat.response.duration",
            "intent", intent
        ).record(durationMs, TimeUnit.MILLISECONDS);
        
        // Token usage (pour LLM)
        // ...
    }
}
```

### Dashboard de Monitoring

| Métrique | Description | Objectif |
|----------|-------------|----------|
| **Temps de réponse moyen** | Latence end-to-end | < 3 secondes |
| **Taux de succès** | Conversations réussies vs erreurs | > 95% |
| **Tool calls executés** | Nombre de fonctions appelées | Suivi |
| **Coût LLM** | Tokens consommés (API) | Budget mensuel |
| **Satisfaction utilisateur** | Feedback positif/négatif | > 4/5 |

---

## 🧪 Tests et Validation

### Scénarios de Test

#### **T1 : Conversation Simple**

```
Input: "Combien j'ai d'étapes ?"
Expected Tool: get_diagram_info
Expected Output: "Vous avez 5 étapes de processus"
```

#### **T2 : Création avec Confirmation**

```
Input: "Crée une étape Assemblage"
Expected Tool: create_process_step
Expected Output: "Voulez-vous créer..." + boutons [Oui] [Non]
Action: Confirmer
Expected Result: Étape créée dans le modèle
```

#### **T3 : Analyse Complexe**

```
Input: "Analyse complète du diagramme"
Expected Tools: 
  - get_diagram_info
  - calculate_lead_time
  - find_bottleneck
  - get_improvement_suggestions
Expected Output: Rapport structuré avec métriques et suggestions
```

#### **T4 : Gestion d'Erreur**

```
Input: "Crée un flux de toto vers tata"
Expected: "Je n'ai pas trouvé les éléments 'toto' et 'tata'. Voici les éléments disponibles: ..."
```

#### **T5 : Aide Contextuelle**

```
Input: "Comment améliorer mon lead time ?"
Expected: Analyse + suggestions concrètes basées sur le diagramme actuel
```

---

## 📅 Roadmap MVP

### Phase 1 : Infrastructure (Semaine 1-2)

- [x] Documentation complète
- [ ] Backend ChatService + LLM Client
- [ ] API endpoints (/api/chat/*)
- [ ] Intégration OpenAI API
- [ ] Tests unitaires backend

### Phase 2 : Tools de Base (Semaine 3)

- [ ] Implémenter 5 READ tools essentiels
  - get_diagram_info
  - get_process_steps
  - calculate_lead_time
  - find_bottleneck
  - get_improvement_suggestions
- [ ] Tests d'intégration

### Phase 3 : Tools d'Écriture (Semaine 4)

- [ ] Implémenter 3 WRITE tools
  - create_process_step
  - create_material_flow
  - update_indicator
- [ ] Système de confirmation
- [ ] Tests de sécurité

### Phase 4 : Interface UI (Semaine 5)

- [ ] ChatPanel dans VSM Studio (SWT)
- [ ] Interface HTML/JavaScript
- [ ] Bridge Java ↔ JavaScript
- [ ] Gestion des boutons d'action

### Phase 5 : Intégration & Tests (Semaine 6)

- [ ] Tests end-to-end
- [ ] Tests utilisateurs (3-5 personnes)
- [ ] Corrections de bugs
- [ ] Documentation utilisateur

### Phase 6 : Déploiement (Semaine 7)

- [ ] Configuration production
- [ ] Monitoring et métriques
- [ ] Formation utilisateurs
- [ ] Release v1.0

---

## 💰 Estimation des Coûts

### Coût LLM (OpenAI GPT-4)

**Hypothèses** :
- 1000 conversations/mois
- Moyenne 2000 tokens par conversation (input + output)
- Prix : $0.03 / 1k tokens (GPT-4 Turbo)

**Calcul** :
```
1000 conversations × 2000 tokens = 2M tokens/mois
2M tokens × $0.03 / 1k = $60/mois
```

**Alternative Claude 3.5 Sonnet** :
- Prix : $0.003 / 1k tokens input, $0.015 / 1k tokens output
- Coût estimé : ~$30/mois (moins cher)

---

## 📚 Ressources et Références

- [OpenAI Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)
- [Anthropic Claude Tool Use](https://docs.anthropic.com/claude/docs/tool-use)
- [Eclipse SWT Browser](https://www.eclipse.org/swt/widgets/)
- [Spring Boot WebSocket](https://spring.io/guides/gs/messaging-stomp-websocket/)

---

## 🤝 Feedback et Itération

### Mécanismes de Feedback

**Boutons de satisfaction** :
```
🤖 Bot: [Réponse]

Était-ce utile ? 👍 👎
```

**Logs d'analyse** :
- Conversations qui échouent
- Tools jamais utilisés
- Erreurs fréquentes

**Sessions utilisateurs** :
- Observer 5 utilisateurs réels
- Identifier les frictions
- Améliorer les prompts

---

**Document maintenu par** : VSM Studio Team  
**Prochaine révision** : Après Phase 1  
**Questions/Feedback** : GitHub Issues

