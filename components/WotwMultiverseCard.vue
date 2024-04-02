<template>
  <v-card
    class="multiverse-card"
    :to="{ name: 'game-multiverseId', params: { multiverseId: multiverseMetadata.id } }"
  >
    <div class="gradient-overlay"></div>

    <div class="card-content pa-4">
      <div class="multiverse-id-container">
        <div>Game</div>
        <div>
          <span class="hashtag">#</span><span class="multiverse-id">{{ multiverseMetadata.id }}</span>
        </div>
      </div>

      <div v-if="multiverseMetadata.hasBingoBoard" class="ml-2">
        <v-tooltip v-for="user in multiverseMetadata.members" :key="user.id" bottom open-delay="250">
          <template #activator="{on}">
            <v-icon large v-on="on">mdi-grid</v-icon>
          </template>
          <span>Bingo</span>
        </v-tooltip>
      </div>

      <div class="spacer"></div>

      <div class="avatars">
        <v-tooltip v-for="user in multiverseMetadata.members" :key="user.id" bottom open-delay="250">
          <template #activator="{on}">
            <div class="avatar" v-on="on">
              <discord-avatar :user="user" />
            </div>
          </template>
          <span>{{ user.name }}</span>
        </v-tooltip>
      </div>
    </div>
  </v-card>
</template>

<script>
  export default {
    name: 'WotwMultiverseCard',
    props: {
      multiverseMetadata: {
        type: Object,
        required: true,
      },
    },
  }
</script>

<style scoped lang="scss">
  .multiverse-card {
    position: relative;
    overflow: hidden;
    transition: transform 300ms;
    border: 1px solid rgba(255, 255, 255, 0.4);
    will-change: transform;

    &:hover {
      transform: scale(1.02);
    }

    .gradient-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(to right, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 100%);
    }

    .card-content {
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.5em;
      height: 100%;

      .multiverse-id-container {
        display: flex;
        flex-direction: column;
        line-height: 1;

        .hashtag {
          font-size: 1.5em;
          opacity: 0.75;
        }

        .multiverse-id {
          font-size: 2em;
          font-weight: 900;
        }
      }

      .spacer {
        flex-grow: 1;
      }

      .avatars {
        text-align: right;
        white-space: nowrap;

        .avatar {
          display: inline-block;
          margin-left: -16px;
          transition: margin 175ms;
        }

        &:hover {
          .avatar {
            margin-left: 0.2em;
          }
        }
      }
    }
  }
</style>
