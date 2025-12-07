/**
 * Service de sérialisation XML pour les diagrammes VSM
 * 
 * Convertit les diagrammes VSM entre le format TypeScript et XML (.vsmx)
 * conforme au format défini dans le document de migration.
 * 
 * @date 6 décembre 2025
 * @version 1.0
 */

import {
  VSMDiagram,
  DataSource,
  DataSourceType,
  Node,
  NodeType,
  FlowSequence,
  InformationFlow,
  ImprovementPoint,
  TextAnnotation,
  isSQLConfig,
  isRESTConfig,
  isSQLIndicatorConfig,
  isRESTIndicatorConfig
} from '../types/vsm-model'

import { validateVSMDiagram } from '../types/vsm-validation'

/**
 * Sérialise un diagramme VSM en XML
 */
export class XMLSerializer {
  /**
   * Convertit un VSMDiagram en chaîne XML
   * @param diagram Diagramme à sérialiser
   * @returns Chaîne XML formatée
   */
  public serializeToXML(diagram: VSMDiagram): string {
    // Validation avant sérialisation
    const validation = validateVSMDiagram(diagram)
    if (!validation.success) {
      throw new Error(`Validation échouée : ${JSON.stringify(validation.error.issues)}`)
    }

    const lines: string[] = []
    lines.push('<?xml version="1.0" encoding="UTF-8"?>')
    lines.push(`<VSMDiagram name="${this.escapeXml(diagram.metaData.name)}" version="${this.escapeXml(diagram.metaData.version)}">`)

    // MetaData
    lines.push('  <MetaData>')
    lines.push(`    <Description>${this.escapeXml(diagram.metaData.description || '')}</Description>`)
    lines.push(`    <Author>${this.escapeXml(diagram.metaData.author)}</Author>`)
    lines.push(`    <CreatedDate>${diagram.metaData.createdDate}</CreatedDate>`)
    lines.push(`    <ModifiedDate>${diagram.metaData.modifiedDate}</ModifiedDate>`)
    lines.push(`    <AppVersion>${this.escapeXml(diagram.metaData.appVersion)}</AppVersion>`)
    lines.push('  </MetaData>')

    // DataSources
    if (diagram.dataSources.length > 0) {
      lines.push('  <DataSources>')
      diagram.dataSources.forEach(ds => {
        lines.push(...this.serializeDataSource(ds, 4))
      })
      lines.push('  </DataSources>')
    }

    // Actors
    lines.push('  <Actors>')
    lines.push('    <Supplier>')
    lines.push(`      <Name>${this.escapeXml(diagram.actors.supplier.name)}</Name>`)
    if (diagram.actors.supplier.contact) {
      lines.push(`      <Contact>${this.escapeXml(diagram.actors.supplier.contact)}</Contact>`)
    }
    lines.push(`      <DeliveryFrequency>${diagram.actors.supplier.deliveryFrequency}</DeliveryFrequency>`)
    if (diagram.actors.supplier.customFrequency) {
      lines.push(`      <CustomFrequency>${this.escapeXml(diagram.actors.supplier.customFrequency)}</CustomFrequency>`)
    }
    lines.push(`      <LeadTime>${diagram.actors.supplier.leadTime}</LeadTime>`)
    lines.push('    </Supplier>')

    lines.push('    <Customer>')
    lines.push(`      <Name>${this.escapeXml(diagram.actors.customer.name)}</Name>`)
    if (diagram.actors.customer.contact) {
      lines.push(`      <Contact>${this.escapeXml(diagram.actors.customer.contact)}</Contact>`)
    }
    lines.push(`      <DailyDemand>${diagram.actors.customer.dailyDemand}</DailyDemand>`)
    lines.push(`      <TaktTime>${diagram.actors.customer.taktTime}</TaktTime>`)
    lines.push('    </Customer>')

    if (diagram.actors.controlCenter) {
      lines.push('    <ControlCenter>')
      lines.push(`      <Name>${this.escapeXml(diagram.actors.controlCenter.name)}</Name>`)
      if (diagram.actors.controlCenter.description) {
        lines.push(`      <Description>${this.escapeXml(diagram.actors.controlCenter.description)}</Description>`)
      }
      lines.push('    </ControlCenter>')
    }
    lines.push('  </Actors>')

    // Nodes
    if (diagram.nodes.length > 0) {
      lines.push('  <Nodes>')
      diagram.nodes.forEach(node => {
        lines.push(...this.serializeNode(node, 4))
      })
      lines.push('  </Nodes>')
    }

    // FlowSequences
    if (diagram.flowSequences.length > 0) {
      lines.push('  <FlowSequences>')
      diagram.flowSequences.forEach(seq => {
        lines.push(...this.serializeFlowSequence(seq, 4))
      })
      lines.push('  </FlowSequences>')
    }

    // InformationFlows
    if (diagram.informationFlows.length > 0) {
      lines.push('  <InformationFlows>')
      diagram.informationFlows.forEach(flow => {
        lines.push(...this.serializeInformationFlow(flow, 4))
      })
      lines.push('  </InformationFlows>')
    }

    // ImprovementPoints
    if (diagram.improvementPoints.length > 0) {
      lines.push('  <ImprovementPoints>')
      diagram.improvementPoints.forEach(point => {
        lines.push(...this.serializeImprovementPoint(point, 4))
      })
      lines.push('  </ImprovementPoints>')
    }

    // TextAnnotations
    if (diagram.textAnnotations.length > 0) {
      lines.push('  <TextAnnotations>')
      diagram.textAnnotations.forEach(annotation => {
        lines.push(...this.serializeTextAnnotation(annotation, 4))
      })
      lines.push('  </TextAnnotations>')
    }

    lines.push('</VSMDiagram>')

    return lines.join('\n')
  }

  /**
   * Sérialise une source de données
   */
  private serializeDataSource(ds: DataSource, indent: number): string[] {
    const ind = ' '.repeat(indent)
    const lines: string[] = []

    lines.push(`${ind}<DataSource id="${ds.id}" type="${ds.type}">`)
    lines.push(`${ind}  <Name>${this.escapeXml(ds.name)}</Name>`)

    if (ds.status) {
      lines.push(`${ind}  <Status>${ds.status}</Status>`)
    }
    if (ds.errorMessage) {
      lines.push(`${ind}  <ErrorMessage>${this.escapeXml(ds.errorMessage)}</ErrorMessage>`)
    }

    lines.push(`${ind}  <Config>`)

    if (ds.type === DataSourceType.SQL && isSQLConfig(ds.config)) {
      // Conversion dbType + serverUrl → jdbcUrl + driver pour le backend Java
      let jdbcUrl: string
      let driver: string

      switch (ds.config.dbType) {
        case 'PostgreSQL':
          jdbcUrl = `jdbc:postgresql://${ds.config.serverUrl}`
          driver = 'org.postgresql.Driver'
          break
        case 'MySQL':
          jdbcUrl = `jdbc:mysql://${ds.config.serverUrl}`
          driver = 'com.mysql.cj.jdbc.Driver'
          break
        case 'SQLite':
          jdbcUrl = `jdbc:sqlite:${ds.config.serverUrl}`
          driver = 'org.sqlite.JDBC'
          break
        default:
          throw new Error(`Type de base de données non supporté: ${ds.config.dbType}`)
      }

      lines.push(`${ind}    <JdbcUrl>${this.escapeXml(jdbcUrl)}</JdbcUrl>`)
      lines.push(`${ind}    <Driver>${this.escapeXml(driver)}</Driver>`)

      if (ds.config.username) {
        lines.push(`${ind}    <User>${this.escapeXml(ds.config.username)}</User>`)
      }
      if (ds.config.passwordRef) {
        lines.push(`${ind}    <PasswordRef>${this.escapeXml(ds.config.passwordRef)}</PasswordRef>`)
      }
    } else if (ds.type === DataSourceType.REST && isRESTConfig(ds.config)) {
      lines.push(`${ind}    <BaseUrl>${this.escapeXml(ds.config.baseUrl)}</BaseUrl>`)
      lines.push(`${ind}    <AuthType>${ds.config.authType}</AuthType>`)
      if (ds.config.authSecretRef) {
        lines.push(`${ind}    <AuthSecretRef>${this.escapeXml(ds.config.authSecretRef)}</AuthSecretRef>`)
      }
      if (ds.config.headers) {
        lines.push(`${ind}    <Headers>`)
        Object.entries(ds.config.headers).forEach(([key, value]) => {
          lines.push(`${ind}      <Header key="${this.escapeXml(key)}" value="${this.escapeXml(value)}" />`)
        })
        lines.push(`${ind}    </Headers>`)
      }
    }

    lines.push(`${ind}  </Config>`)
    lines.push(`${ind}</DataSource>`)

    return lines
  }

  /**
   * Sérialise un nœud
   */
  private serializeNode(node: Node, indent: number): string[] {
    const ind = ' '.repeat(indent)
    const lines: string[] = []

    lines.push(`${ind}<Node id="${node.id}" type="${node.type}">`)
    lines.push(`${ind}  <Name>${this.escapeXml(node.name)}</Name>`)

    if (node.operators !== undefined) {
      lines.push(`${ind}  <Operators>${node.operators}</Operators>`)
    }

    if (node.indicators.length > 0) {
      lines.push(`${ind}  <Indicators>`)
      node.indicators.forEach(indicator => {
        lines.push(`${ind}    <Indicator id="${indicator.id}">`)
        lines.push(`${ind}      <Name>${this.escapeXml(indicator.name)}</Name>`)
        lines.push(`${ind}      <Unit>${this.escapeXml(indicator.unit)}</Unit>`)

        if (indicator.dataSourceId) {
          lines.push(`${ind}      <DataSourceId>${indicator.dataSourceId}</DataSourceId>`)
        }

        if (indicator.config) {
          lines.push(`${ind}      <Config>`)
          if (isSQLIndicatorConfig(indicator.config)) {
            lines.push(`${ind}        <Query>${this.escapeXml(indicator.config.query)}</Query>`)
          } else if (isRESTIndicatorConfig(indicator.config)) {
            lines.push(`${ind}        <Endpoint>${this.escapeXml(indicator.config.endpoint)}</Endpoint>`)
            lines.push(`${ind}        <Method>${indicator.config.method}</Method>`)
            if (indicator.config.body) {
              lines.push(`${ind}        <Body>${this.escapeXml(indicator.config.body)}</Body>`)
            }
            if (indicator.config.jsonPath) {
              lines.push(`${ind}        <JsonPath>${this.escapeXml(indicator.config.jsonPath)}</JsonPath>`)
            }
          }
          lines.push(`${ind}      </Config>`)
        }

        if (indicator.value !== undefined) {
          lines.push(`${ind}      <Value>${indicator.value}</Value>`)
        }
        if (indicator.lastUpdated) {
          lines.push(`${ind}      <LastUpdated>${indicator.lastUpdated}</LastUpdated>`)
        }

        lines.push(`${ind}    </Indicator>`)
      })
      lines.push(`${ind}  </Indicators>`)
    }

    lines.push(`${ind}</Node>`)

    return lines
  }

  /**
   * Sérialise une séquence de flux
   */
  private serializeFlowSequence(seq: FlowSequence, indent: number): string[] {
    const ind = ' '.repeat(indent)
    const lines: string[] = []

    lines.push(`${ind}<FlowSequence order="${seq.order}">`)
    lines.push(`${ind}  <FromNodeId>${seq.fromNodeId}</FromNodeId>`)
    lines.push(`${ind}  <ToNodeId>${seq.toNodeId}</ToNodeId>`)

    if (seq.intermediateElements.length > 0) {
      lines.push(`${ind}  <IntermediateElements>`)
      seq.intermediateElements.forEach(elem => {
        lines.push(`${ind}    <Element order="${elem.order}" type="${elem.type}">`)

        if (elem.type === 'INVENTORY' && elem.inventory) {
          const inv = elem.inventory
          lines.push(`${ind}      <Inventory id="${inv.id}">`)
          lines.push(`${ind}        <Name>${this.escapeXml(inv.name)}</Name>`)
          lines.push(`${ind}        <Type>${inv.type}</Type>`)
          lines.push(`${ind}        <Quantity>${inv.quantity}</Quantity>`)
          lines.push(`${ind}        <Duration>${inv.duration}</Duration>`)
          if (inv.dataSourceId) {
            lines.push(`${ind}        <DataSourceId>${inv.dataSourceId}</DataSourceId>`)
          }
          // Indicateurs du stock (simplifié pour brièveté)
          lines.push(`${ind}      </Inventory>`)
        } else if (elem.type === 'MATERIAL_FLOW' && elem.materialFlow) {
          const flow = elem.materialFlow
          lines.push(`${ind}      <MaterialFlow id="${flow.id}">`)
          lines.push(`${ind}        <FlowType>${flow.flowType}</FlowType>`)
          if (flow.method) {
            lines.push(`${ind}        <Method>${this.escapeXml(flow.method)}</Method>`)
          }
          lines.push(`${ind}      </MaterialFlow>`)
        }

        lines.push(`${ind}    </Element>`)
      })
      lines.push(`${ind}  </IntermediateElements>`)
    }

    lines.push(`${ind}</FlowSequence>`)

    return lines
  }

  /**
   * Sérialise un flux d'information
   */
  private serializeInformationFlow(flow: InformationFlow, indent: number): string[] {
    const ind = ' '.repeat(indent)
    const lines: string[] = []

    lines.push(`${ind}<InformationFlow id="${flow.id}">`)
    lines.push(`${ind}  <Description>${this.escapeXml(flow.description)}</Description>`)
    lines.push(`${ind}  <SourceNodeId>${flow.sourceNodeId}</SourceNodeId>`)
    lines.push(`${ind}  <TargetNodeId>${flow.targetNodeId}</TargetNodeId>`)
    lines.push(`${ind}  <TransmissionType>${flow.transmissionType}</TransmissionType>`)
    lines.push(`${ind}</InformationFlow>`)

    return lines
  }

  /**
   * Sérialise un point d'amélioration
   */
  private serializeImprovementPoint(point: ImprovementPoint, indent: number): string[] {
    const ind = ' '.repeat(indent)
    const lines: string[] = []

    lines.push(`${ind}<ImprovementPoint id="${point.id}">`)
    lines.push(`${ind}  <Description>${this.escapeXml(point.description)}</Description>`)
    lines.push(`${ind}  <X>${point.x}</X>`)
    lines.push(`${ind}  <Y>${point.y}</Y>`)

    if (point.priority !== undefined) {
      lines.push(`${ind}  <Priority>${point.priority}</Priority>`)
    }
    if (point.owner) {
      lines.push(`${ind}  <Owner>${this.escapeXml(point.owner)}</Owner>`)
    }
    if (point.dueDate) {
      lines.push(`${ind}  <DueDate>${point.dueDate}</DueDate>`)
    }
    if (point.status) {
      lines.push(`${ind}  <Status>${point.status}</Status>`)
    }

    lines.push(`${ind}</ImprovementPoint>`)

    return lines
  }

  /**
   * Sérialise une annotation textuelle
   */
  private serializeTextAnnotation(annotation: TextAnnotation, indent: number): string[] {
    const ind = ' '.repeat(indent)
    const lines: string[] = []

    lines.push(`${ind}<TextAnnotation id="${annotation.id}">`)
    lines.push(`${ind}  <Content>${this.escapeXml(annotation.content)}</Content>`)
    lines.push(`${ind}  <X>${annotation.x}</X>`)
    lines.push(`${ind}  <Y>${annotation.y}</Y>`)

    if (annotation.width !== undefined) {
      lines.push(`${ind}  <Width>${annotation.width}</Width>`)
    }
    if (annotation.height !== undefined) {
      lines.push(`${ind}  <Height>${annotation.height}</Height>`)
    }
    if (annotation.color) {
      lines.push(`${ind}  <Color>${this.escapeXml(annotation.color)}</Color>`)
    }

    lines.push(`${ind}</TextAnnotation>`)

    return lines
  }

  /**
   * Échappe les caractères spéciaux XML
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  /**
   * Désérialise un XML en VSMDiagram
   * @param xml Chaîne XML à parser
   * @returns Diagramme VSM
   */
  public deserializeFromXML(xml: string): VSMDiagram {
    // TODO: Implémenter le parsing XML -> VSMDiagram
    // Pour l'instant, on lève une erreur
    throw new Error('deserializeFromXML: Non implémenté pour le moment')
  }
}

/**
 * Instance singleton du serializer XML
 */
export const xmlSerializer = new XMLSerializer()
