<template>
  <v-btn small @click="copyToClipboard()" icon>
    <v-icon>{{ isCopied ? 'mdi-clipboard-check-outline' : 'mdi-clipboard-outline' }}</v-icon>
  </v-btn>
</template>

<script>
  export default {
    name: 'CopyToClipboardButton',
    props: {
      value: {
        type: String,
        required: true,
      },
    },
    data: () => ({
      isCopied: false,
    }),
    methods: {
      async copyToClipboard() {
        await window.navigator.clipboard.writeText(this.value)
        this.isCopied = true

        setTimeout(() => {
          this.isCopied = false
        }, 500)
      },
    },
  }
</script>