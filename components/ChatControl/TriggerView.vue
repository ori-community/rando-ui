<template>
  <div>
    <span v-if='trigger.type === "command"'>
      Command: "!{{ trigger.action }}"
    </span>
    <span v-else-if='trigger.type === "reward"'>
      Channel reward: {{ getRewardDisplayName(trigger.rewardId) }}
    </span>
  </div>
</template>

<script>
  export default {
    name: 'MessageView',
    props: {
      trigger: {
        type: Object,
        required: true,
      },
      availableRewards: {
        type: Array,
        default: () => ([]),
      },
    },
    methods: {
      getRewardDisplayName(id) {
        const reward = this.availableRewards.find(r => r.id === id)
        if (reward) {
          return `${reward.title} (${reward.cost})`
        }

        return `Unknown reward (${id})`
      },
    }
  }
</script>

<style scoped>

</style>
