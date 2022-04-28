export const holdControl = propertyName => ({
  mounted() {
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
    window.addEventListener('blur', this.onWindowBlur)
    window.addEventListener('mousemove', this.onMouseMove)
    window.addEventListener('mouseout', this.onMouseLeave)
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    window.removeEventListener('blur', this.onWindowBlur)
    window.removeEventListener('mousemove', this.onMouseMove)
    window.removeEventListener('mouseout', this.onMouseLeave)
  },
  methods: {
    onKeyDown(event) {
      if (event.key === 'Control') {
        this[propertyName] = true
      }
    },
    onKeyUp(event) {
      if (event.key === 'Control') {
        this[propertyName] = false
      }
    },
    onMouseMove(event) {
      this[propertyName] = event.ctrlKey
    },
    onMouseLeave() {
      this[propertyName] = false
    },
    onWindowBlur() {
      this[propertyName] = false
    },
  }
})
