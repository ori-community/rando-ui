<template>
  <div>
    <div ref="timelineStageContainer" class="timeline-stage-container">
      <k-stage :config="stageConfig">
        <k-layer :config="{ x: viewportConfig.marginX + viewportConfig.offset, y: viewportConfig.marginY + viewportConfig.timelineCursorHeight + viewportConfig.timelineCursorMargin }">
          <template v-for="row in Object.keys(entryIndexesByRow)">
            <k-rect
              v-for="entryIndex in entryIndexesByRow[row]"
              :key="`${row}-${entryIndex}`"
              :config="{
                fill: getEntryColor(model[entryIndex], 'fill'),
                cornerRadius: 3,
                stroke: getEntryColor(model[entryIndex], 'stroke'),
                strokeWidth: 1,
                shadowEnabled: false,
                dashEnabled: false,
                x: viewportConfig.frameWidth * model[entryIndex].frame,
                y: viewportConfig.entryHeight * row,
                width: viewportConfig.frameWidth * (model[entryIndex].duration ?? 1),
                height: viewportConfig.entryHeight,
              }"
            />
          </template>

          <k-line :config="timelineCursorConfig" />
        </k-layer>
      </k-stage>
    </div>
  </div>
</template>

<script>
  import { hasModelObject } from '~/assets/lib/hasModelObject'

  const ENTRY_COLORS = {
    Action: {
      fill: '#9C27B0',
      stroke: '#d473e4',
    },
    Angle: {
      fill: '#00796B',
      stroke: '#46d4c3',
    },
    Axis: {
      fill: '#1976D2',
      stroke: '#85bbf0',
    },
    GameReload: {
      fill: '#7f0000',
      stroke: '#f05545',
    },
    MouseAngle: {
      fill: '#2E7D32',
      stroke: '#9ddda1',
    },
    MousePosition: {
      fill: '#BF360C',
      stroke: '#f1a189',
    },
    Position: {
      fill: '#524c00',
      stroke: '#b4a647',
    },
    RNGState: {
      fill: '#f57f17',
      stroke: '#ffc67e',
    },
  }

  export default {
    name: 'Timeline',
    mixins: [hasModelObject],
    props: {
      frame: {
        type: Number,
        required: true
      }
    },
    data: () => ({
      stageConfig: {
        width: 1,
        height: 1,
      },
      viewportConfig: {
        offset: 0.0,
        frameWidth: 6,
        entryHeight: 32,
        marginX: 20,
        marginY: 8,
        timelineCursorWidth: 6,
        timelineCursorHeight: 12,
        timelineCursorMargin: 8,
      },
    }),
    computed: {
      entryIndexesByRow() {
        let rowCount = 0
        const entryIndexesByRow = {}

        entryLoop:
        for (let entryIndex = 0; entryIndex < this.model.length; entryIndex++) {
          const entry = this.model[entryIndex]
          const start = entry.frame
          const end = entry.frame + (entry.duration ?? 1) - 1

          for (let row = 0; row < rowCount; row++) {
            let currentRowHasConflictingEntries = false

            for (const entryIndexInRow of entryIndexesByRow[row]) {
              const otherEntry = this.model[entryIndexInRow]
              const otherStart = otherEntry.frame
              const otherEnd = otherEntry.frame + (otherEntry.duration ?? 1) - 1

              if (
                (start >= otherStart && start <= otherEnd) ||
                (end >= otherStart && end <= otherEnd) ||
                (otherStart >= start && otherEnd <= end)
              ) {
                currentRowHasConflictingEntries = true
                break
              }
            }

            if (!currentRowHasConflictingEntries) {
              entryIndexesByRow[row].push(entryIndex)
              continue entryLoop
            }
          }

          // There's no space in any existing row
          entryIndexesByRow[rowCount] = [entryIndex]
          rowCount++
        }

        return entryIndexesByRow
      },
      timelineCursorConfig() {
        return {
          x: this.frame * this.viewportConfig.frameWidth,
          y: 0,
          points: [
            0, -this.viewportConfig.timelineCursorMargin,
            0, this.stageConfig.height,
            this.viewportConfig.frameWidth, this.stageConfig.height,
            this.viewportConfig.frameWidth, -this.viewportConfig.timelineCursorMargin,
            this.viewportConfig.frameWidth + this.viewportConfig.timelineCursorWidth, -this.viewportConfig.timelineCursorMargin - this.viewportConfig.timelineCursorHeight,
            -this.viewportConfig.timelineCursorWidth, -this.viewportConfig.timelineCursorMargin - this.viewportConfig.timelineCursorHeight,
          ],
          fill: 'rgba(255, 0, 0, 0.4)',
          closed: true,
        }
      }
    },
    watch: {
      'stageConfig.width'() {
        this.centerTimelineCursor()
      },
      frame() {
        this.centerTimelineCursor()
      }
    },
    mounted() {
      const observer = new ResizeObserver(() => this.updateStageSize())
      observer.observe(this.$refs.timelineStageContainer)
    },
    methods: {
      centerTimelineCursor() {
        const frameX = this.frame * this.viewportConfig.frameWidth
        this.viewportConfig.offset = -frameX + this.stageConfig.width * 0.5 - this.viewportConfig.marginX - this.viewportConfig.frameWidth * 0.5
      },
      updateStageSize() {
        this.stageConfig.width = this.$refs.timelineStageContainer.clientWidth
        this.stageConfig.height = this.$refs.timelineStageContainer.clientHeight
      },
      getEntryRow(index) {
        let row = 0

        const entry = this.model[index]
        const start = entry.frame
        const end = entry.frame + (entry.duration ?? 1) - 1

        for (let i = 0; i < index; i++) {
          if (i === index) {
            continue
          }

          const otherEntry = this.model[i]
          const oStart = otherEntry.frame
          const oEnd = otherEntry.frame + (otherEntry.duration ?? 1) - 1

          if (
            (start >= oStart && start <= oEnd) ||
            (end >= oStart && end <= oEnd) ||
            (oStart >= start && oEnd <= end)
          ) {
            row++
          }
        }

        return row
      },
      getEntryColor(entry, colorType) {
        return ENTRY_COLORS[entry.type]?.[colorType] ?? '#757575'
      },
    },
  }
</script>

<style lang="scss" scoped>
  .timeline-stage-container {
    min-height: 300px;
    margin-left: -20px;
    margin-right: -20px;
  }
</style>
