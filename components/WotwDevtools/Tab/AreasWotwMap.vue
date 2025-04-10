<template>
  <div class="d-flex flex-column flex-grow-1 relative">
    <!-- Map -->
    <wotw-map @mousemove="updateMousePosition" @click="mapClicked" ref="map" class="flex-grow-1 flex-shrink-1">
      <k-layer>
        <k-line v-for="line in displayedLines" :key="line.elementDisplayIndex" :config="line"
          @click="selectDisplayedObject(line.name)" @mouseout="displayElementMouseOut(line.name)"
          @mouseover="displayElementMouseOver(line.name)" />

        <k-circle v-for="circle in displayedCircles" :key="circle.elementDisplayIndex" :config="circle"
          @click="selectDisplayedObject(circle.name)" @mouseout="displayElementMouseOut(circle.name)"
          @mouseover="displayElementMouseOver(circle.name)" />
      </k-layer>
    </wotw-map>

    <!-- coordinates -->
    <v-slide-x-transition>

      <v-card class="pa-2 cursor-coordinates d-flex align-center" v-if="cursorPosition">
        <table class="table-coordinates selection-info-table">
          <tbody>
            <tr>
              <td>X:</td>
              <td>{{ cursorPosition.x.toFixed(2) }}</td>
            </tr>
            <tr>
              <td>Y:</td>
              <td>{{ cursorPosition.y.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
        <copy-to-clipboard-button v-if="coordinatesFrozen" class="selection-button" :value="`${cursorPosition.x.toFixed(2).toString()},${cursorPosition.y.toFixed(2).toString()}`" />
      </v-card>
    </v-slide-x-transition>

    <!-- Selection Info -->
    <div class="selection-info-right-toggle">
      <v-btn-toggle mandatory v-model="cursorSelectionMode">
        <v-btn :value="false" @click="toggleSelectionCursor(false)">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
        <v-btn :value="true" @click="toggleSelectionCursor(true)">
          <v-icon>mdi-cursor-default-outline</v-icon>
        </v-btn>
      </v-btn-toggle>
        <v-btn-toggle v-model="selectionInfoOpen">
          <v-btn :value="true" :disabled="!selectedObject">
            <v-icon>mdi-eye-outline</v-icon>
          </v-btn>
        </v-btn-toggle>
      </div>

    <v-slide-x-reverse-transition>
      <v-card v-if="selectionInfoOpen" class="selection-info-right pa-3">

        <h4>{{ capitalCase(selectionInfo.typeDescription) }}</h4>
        <!-- Node - Anchor / Pickup -->
        <template v-if="selectionInfo.typeDescription != 'connection'">
          <table class="selection-info-table-copyable selection-info-table">
            <tbody>
              <tr>
                <td>
                  <div>{{ selectionInfo.completeName }}</div>
                </td>
                <td><copy-to-clipboard-button class="selection-button" :value="selectionInfo.completeName" /></td>
              </tr>
            </tbody>
          </table>
          <table class="table-coordinates selection-info-table">
            <tbody>
              <tr>
                <td>X:</td>
                <td>{{ selectedObject.x.toFixed(1) }}</td>
              </tr>
              <tr>
                <td>Y:</td>
                <td>{{ selectedObject.y.toFixed(1) }}</td>
              </tr>
            </tbody>
          </table>

          <!-- node connections-->
          <template v-if="selectionInfo.nodeConnections.length > 0">

            <h4 class="mt-5">Connections</h4>
            <table class="selection-info-table selection-info-table-copyable">
              <tbody>
                <tr v-for="connection in selectionInfo.nodeConnections" :key="connection.nodeName"
                  :class="{ 'indirect-connection': connection.toNode }">
                  <td>{{ capitalCase(connection.typeDescription) }}:</td>
                  <td>
                    <a @click="selectDisplayedObject(connection.connectionName)"
                      @mouseover="displayElementMouseOver(connection.connectionName)"
                      @mouseout="displayElementMouseOut(connection.connectionName)">
                      <v-icon small>mdi-chart-timeline-variant</v-icon>
                    </a>
                  </td>
                  <td>
                    <a @click="selectDisplayedObject(connection.nodeName)"
                      @mouseover="displayElementMouseOver(connection.nodeName)"
                      @mouseout="displayElementMouseOut(connection.nodeName)">
                      {{ connection.nodeName }}
                    </a>
                  <td><copy-to-clipboard-button class="selection-button" :value="connection.nodeName" /></td>
                  </td>
                </tr>
              </tbody>
            </table>
          </template>
        </template>

        <!-- Connections -->
        <template v-if="selectionInfo.typeDescription == 'connection'">
          <table class="selection-info-table-copyable selection-info-table">
            <tbody>
              <tr>
                <td>From:</td>
                <td>
                  <a @click="selectDisplayedObject(selectedObject.start)"
                    @mouseover="displayElementMouseOver(selectedObject.start)"
                    @mouseout="displayElementMouseOut(selectedObject.start)">
                    {{ selectedObject.start }}
                  </a>
                </td>
                <td><copy-to-clipboard-button class="selection-button" :value="selectedObject.start" /></td>
              </tr>
              <tr>
                <td>To:</td>
                <td>
                  <a @click="selectDisplayedObject(selectedObject.end)"
                    @mouseover="displayElementMouseOver(selectedObject.end)"
                    @mouseout="displayElementMouseOut(selectedObject.end)">
                    {{ selectedObject.end }}
                  </a>
                </td>
                <td><copy-to-clipboard-button class="selection-button" :value="selectedObject.end" /></td>
              </tr>
            </tbody>
          </table>
          <div>Unidirectional: {{ capitalCase(selectedObject.unidirectional.toString()) }}</div>
        </template>
      </v-card>
    </v-slide-x-reverse-transition>
  </div>
</template>

<script>
import { capitalCase } from 'capital-case'
import { Matrix3, Vector2 } from '@math.gl/core'
import WebworkerPromise from 'webworker-promise/lib'
import { GraphObjectType, LogicalType } from '~/assets/lib/areasMap'
// eslint-disable-next-line import/default
import AreasWotwGraphWorker from '~/assets/lib/workers/areasWotwGraph.worker.js'
import { getSeedgen } from '~/assets/lib/getSeedgen'

const COLOR_PICKUP = '#44AAFF'
const COLOR_ANCHOR = '#00BB66'
const COLOR_SELECTION = '#dadddb'

export default {
  name: 'AreasWotwMap',
  data: () => ({
    selectionInfoOpen: false,
    graphObjects: null,
    connectionType: null,
    currentDisplayIndex: 0,
    displayedObjects: null,
    renderingOverlay: false,
    shouldRenderOverlayAgainAfterRenderingCompleted: false,
    selectedObject: null,
    selectionInfo: null,
    cursorSelectionMode: true,
    cursorPosition: null,
    coordinatesFrozen: false,
    LogicalType,
  }),
  mounted() {
    window.electronApi.invoke('seedgen.startWatchingSourceFiles')
    window.electronApi.on('seedgen.sourceFilesUpdated', async () => {
      console.log('Seedgen source files updated!')

      if (!this.renderingOverlay) {
        await this.updateOverlay()
      } else {
        this.shouldRenderOverlayAgainAfterRenderingCompleted = true
      }
    })
    this.updateOverlay()
  },
  beforeDestroy() {
    window.electronApi.invoke('seedgen.stopWatchingSourceFiles')
  },
  computed: {
    displayedLines() {
      return this.displayedObjects?.filter((obj) => obj.graphObjectType === GraphObjectType.Connection)
    },
    displayedCircles() {
      return this.displayedObjects?.filter((obj) => obj.graphObjectType === GraphObjectType.Node)
    },
  },
  methods: {
    capitalCase,
    getGraphObject(name) {
      return this.graphObjects.find((obj) => obj.name === name)
    },
    getDisplayedObject(name) {
      return this.displayedObjects.find((obj) => obj.name === name)
    },

    async updateOverlay() {
      const { ConnectionType } = await getSeedgen()
      this.connectionType = ConnectionType

      await this.updateCoreGraphics()
      await this.updateDisplayedGraphics()

      this.renderingOverlay = false
      if (this.shouldRenderOverlayAgainAfterRenderingCompleted) {
        this.updateOverlay()
      }
    },

    async updateCoreGraphics() {
      try {
        // read data from the logic files
        const areasWotwContents = await window.electronApi.invoke('seedgen.getAreasFileContents')
        const locDataFileContents = await window.electronApi.invoke('seedgen.getLocDataFileContents')

        const worker = new WebworkerPromise(new AreasWotwGraphWorker())
        const graph = await worker.postMessage({
          areasWotwContents,
          locDataFileContents,
        })

        this.graphObjects = []

        // create objects and add/calc additional data

        // nodes
        for (const [nodeName, node] of Object.entries(graph.nodes)) {
          this.graphObjects.push({
            name: nodeName,
            graphObjectType: GraphObjectType.Node,
            logicalType: graph.connections.some(
              (conn) => conn.type === this.connectionType.Leaf && conn.end === nodeName,
            )
              ? LogicalType.Pickup
              : LogicalType.Anchor,
            x: node.position.x,
            y: node.position.y,
          })
        }

        // connections
        for (const connection of graph.connections) {
          const startNode = graph.nodes[connection.start]
          const endNode = graph.nodes[connection.end]
          const startPoint = new Vector2().fromObject(startNode.position)
          const endPoint = new Vector2().fromObject(endNode.position)
          const midPoint = [
            startPoint[0] + (endPoint[0] - startPoint[0]) * 0.5,
            startPoint[1] + (endPoint[1] - startPoint[1]) * 0.5,
          ]
          const delta = [endPoint[0] - startPoint[0], endPoint[1] - startPoint[1]]
          const connectionName = `${connection.start}_${connection.end}`
          this.graphObjects.push({
            name: connectionName,
            graphObjectType: GraphObjectType.Connection,
            logicalType: LogicalType.Connection,
            ...connection,
            startPoint,
            endPoint,
            delta,
            midPoint,
            points: [startNode.position.x, startNode.position.y, endNode.position.x, endNode.position.y],
          })
        }
      } catch (e) {
        console.error(e)
      }
    },

    updateDisplayedGraphics() {
      // add graphical data to the elements that should be displayed

      this.displayedObjects = []
      this.currentDisplayIndex = 0

      // nodes
      for (const node of this.graphObjects.filter((obj) => obj.graphObjectType === GraphObjectType.Node)) {
        const radius = node.logicalType === LogicalType.Anchor ? 4 : 3.5
        const color = node.logicalType === LogicalType.Anchor ? COLOR_ANCHOR : COLOR_PICKUP
        this.displayedObjects.push({
          ...node,
          elementDisplayIndex: this.currentDisplayIndex,
          parentName: null,
          radius,
          initialRadius: radius,
          fill: color,
          initialFill: color,
          strokeWidth: 1,
          hitStrokeWidth: radius * 1.2,
        })

        this.currentDisplayIndex += 1
      }

      // connections
      for (const connection of this.graphObjects.filter(
        (obj) => obj.graphObjectType === GraphObjectType.Connection,
      )) {
        const strokeWidth = connection.type === this.connectionType.Branch ? 2 : 1.5
        const color = connection.type === this.connectionType.Branch ? COLOR_ANCHOR : COLOR_PICKUP
        const count = this.displayedObjects.push({
          ...connection,
          elementDisplayIndex: this.currentDisplayIndex,
          parentName: null,
          stroke: color,
          initialStroke: color,
          lineCap: 'round',
          dash: connection.unidirectional ? [8, 4] : [1, 0],
          strokeWidth,
          initialStrokeWidth: strokeWidth,
          hitStrokeWidth: strokeWidth * 2,
        })
        this.currentDisplayIndex += 1
        if (connection.unidirectional) {
          this.addConnectionDirectionIndicators(count - 1)
        }
      }

      this.updateSelection()
    },

    addConnectionDirectionIndicators(connectionDisplayIndex) {
      const connection = this.displayedObjects[connectionDisplayIndex]

      // no arrow needed for pickups
      if (connection.type === this.connectionType.Leaf) {
        return
      }

      // convert into vector
      const midVector = new Vector2(connection.midPoint[0], connection.midPoint[1])
      const deltaVector = new Vector2(connection.delta[0], connection.delta[1])

      // calc endpoints of arrows
      const arrowEndVectors = []
      arrowEndVectors.push(
        midVector
          .clone()
          .add(
            new Vector2(5 * connection.strokeWidth, 0).transformByMatrix3(
              new Matrix3().rotate(-deltaVector.verticalAngle() + Math.PI * 1.7),
            ),
          ),
      )
      arrowEndVectors.push(
        midVector
          .clone()
          .add(
            new Vector2(5 * connection.strokeWidth, 0).transformByMatrix3(
              new Matrix3().rotate(-deltaVector.verticalAngle() + Math.PI * 1.3),
            ),
          ),
      )

      // add line to each arrow end point
      for (let vectorIndex = 0; vectorIndex < arrowEndVectors.length; vectorIndex++) {
        this.displayedObjects.push({
          name: `${connection.name}_arrowSegment${vectorIndex + 1}}`,
          parentName: connection.name,
          elementDisplayIndex: this.currentDisplayIndex,
          graphObjectType: GraphObjectType.Connection,
          logicalType: LogicalType.Connection,
          points: [arrowEndVectors[vectorIndex].x, arrowEndVectors[vectorIndex].y, midVector.x, midVector.y],
          stroke: connection.stroke,
          initialStroke: connection.stroke,
          strokeWidth: connection.strokeWidth,
          initialStrokeWidth: connection.strokeWidth,
          hitStrokeWidth: connection.hitStrokeWidth,
          lineCap: 'round',
        })
        this.currentDisplayIndex += 1
      }
    },

    updateSelection() {
      if (this.selectedObject) {
        if (!this.getDisplayedObject(this.selectedObject.name)) {
          this.deselectDisplayedObject()
        } else {
          this.selectDisplayedObject(this.selectedObject.name)
        }
      }
    },

    selectDisplayedObject(objectName) {
      if(!this.cursorSelectionMode) { return }

      // get selected object
      let object = this.displayedObjects.find((obj) => obj.name === objectName)
      if (!object) {
        console.warn(`Object ${objectName} not found`)
        return
      }
      if (object.parentName) {
        object = this.getDisplayedObject(object.parentName)
      }

      // deselect/unmark previous object
      if (this.selectedObject) {
        this.setDisplayObjectSelectionColor(this.selectedObject.name, false)
        this.setDisplayObjectSelectionWidth(this.selectedObject.name, false)
      }

      // set the new object as selected object
      this.selectedObject = object

      // get connections of a node
      let nodeConnections = []
      if (this.selectedObject.graphObjectType === GraphObjectType.Node) {
        nodeConnections = this.getNodeConnections(object.name, object.logicalType)
      }

      // set different informations depending on the type
      switch (this.selectedObject.graphObjectType) {
        case GraphObjectType.Node:
          this.selectionInfo = {
            typeDescription: LogicalType[this.selectedObject.logicalType],
            completeName: object.name,
            nodeConnections,
          }
          break
        case GraphObjectType.Connection:
          this.selectionInfo = {
            typeDescription: 'connection',
            completeName: object.name,
            anchorFrom: object.start,
            anchorStart: object.end,
            nodeConnections,
          }
          break
        default:
          this.selectionInfo = []
          break
      }

      // mark object
      this.setDisplayObjectSelectionColor(this.selectedObject.name, true)

      // show selection info if hidden
      if (!this.selectionInfoOpen) {
        this.selectionInfoOpen = true
      }
    },

    deselectDisplayedObject() {
      this.selectionInfoOpen = false
      this.selectedObject = null
      this.selectionInfo = null
    },

    getNodeConnections(objectName, logicalType) {
      const nodeConnections = []
      for (const connection of this.graphObjects.filter(
        (connection) => connection.end === objectName || connection.start === objectName,
      )) {
        const nodeLogicalType =
          logicalType === LogicalType.Anchor && connection.type === this.connectionType.Leaf
            ? LogicalType.Pickup
            : LogicalType.Anchor
        nodeConnections.push({
          ...connection,
          logicalType: nodeLogicalType,
          typeDescription: LogicalType[nodeLogicalType],
          connectionName: connection.name,
          nodeName: connection.end === objectName ? connection.start : connection.end,
          toNode: connection.unidirectional && connection.end === objectName,
        })
      }
      return nodeConnections
    },

    setDisplayObjectSelectionColor(graphObjectName, isSelected) {
      const lines = this.displayedLines.filter(
        (line) => line.name === graphObjectName || line.parentName === graphObjectName,
      )
      lines.forEach((line) => {
        line.stroke = isSelected ? COLOR_SELECTION : line.initialStroke
      })
      const circles = this.displayedCircles.filter((circle) => circle.name === graphObjectName)
      circles.forEach((circle) => {
        circle.fill = isSelected ? COLOR_SELECTION : circle.initialFill
      })
    },

    setDisplayObjectSelectionWidth(displayObjectName, isMouseOver) {
      const displayedObject = this.getDisplayedObject(displayObjectName)
      if (!displayedObject) {
        console.warn(`Object ${displayObjectName} not found`)
        return
      }

      const lines = this.displayedLines.filter(
        (line) =>
          line.name === displayedObject.name ||
          line.parentName === displayedObject.name ||
          line.name === displayedObject?.parentName ||
          (line.parentName === displayedObject?.parentName && displayedObject.parentName),
      )
      lines.forEach((line) => {
        line.strokeWidth = isMouseOver ? line.strokeWidth * 2 : line.initialStrokeWidth
      })
      const circles = this.displayedCircles.filter((circle) => circle.name === displayedObject.name)
      circles.forEach((circle) => {
        circle.radius = isMouseOver ? circle.radius * 1.25 : circle.initialRadius
      })
    },

    removeDisplayedObject(displayObjectName) {

      this.displayedObjects = this.displayedObjects.filter((obj) => obj.name !== displayObjectName && obj.parentName !== displayObjectName)

    },

    updateMousePosition(_event, position){
      if(this.coordinatesFrozen) { return }
      this.cursorPosition = position
    },

    mapClicked(event, position){
      if(!this.cursorSelectionMode){

        this.coordinatesFrozen = false
        this.updateMousePosition(event, position)
        this.coordinatesFrozen = true
      }
    },

    toggleSelectionCursor(selectionModeActive) {
      this.coordinatesFrozen = false
      if(selectionModeActive){
        document.body.style.cursor = 'default'
      } else {
        document.body.style.cursor = 'crosshair'
      }
    },

    displayElementMouseOver(displayElementName) {
      if (!this.cursorSelectionMode) { return }
      this.setDisplayObjectSelectionWidth(displayElementName, true)
      document.body.style.cursor = 'pointer'
    },

    displayElementMouseOut(displayElementName) {
      if (!this.cursorSelectionMode) { return }
      this.setDisplayObjectSelectionWidth(displayElementName, false)
      document.body.style.cursor = 'default'
    },

  },
}
</script>

<style lang="scss" scoped>
.relative {
  position: relative;
}

.cursor-coordinates {
  position: absolute;
  left: 1em;
  bottom: 1em;
}

.selection-info-right {
  position: absolute;
  top: 4.5em;
  right: 1em;
  min-width: 25em;
  max-width: calc(100% - 2em);
}

.selection-info-right-toggle {
  position: absolute;
  top: 1em;
  right: 1em;
}

.selection-info-table {
  border-collapse: collapse;
}

.selection-info-table-copyable {
  width: 100%;
}

.selection-info-table td {
  padding-right: 0.5em;
}

.table-coordinates {
  border-collapse: collapse;
}

.selection-info-table-copyable td:last-child,
.table-coordinates td:last-child {
  text-align: end;
}

.indirect-connection {
  font-style: italic;
  filter: brightness(0.75);
}

.selection-button {
  filter: brightness(0.85);
}
</style>
