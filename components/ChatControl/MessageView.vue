<template>
  <div>
    <span v-if='message.type === "message"'>
      <b>{{ message.user }}:</b>
      {{ message.text }}
    </span>
    <span v-else-if='message.type === "reward"'>
      <b>{{ message.user }}</b>
      redeemed
      <b>{{ message.reward.title }}</b>
    </span>

    <v-icon v-if='message.commandIds.length > 0' small right color='yellow'>
      mdi-lightning-bolt
    </v-icon>
  </div>
</template>

<script>
  export default {
    name: 'ChatControlMessageView',
    props: {
      message: {
        type: Object,
        required: true,
      },
    },
  }
</script>

<style scoped>

</style>
