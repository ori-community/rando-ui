<template>
  <h4>{{ group.name }}</h4>
</template>

<script>
  export default {
    props: {
      group: {
        type: Object,
        required: true,
      },
    },
    data: () => ({}),
  }
</script>

<style scoped></style>
