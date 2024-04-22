<template>
  <Player />
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import Player from "@/components/player/player.vue";

@Options({
  components: {
    Player,
  },
})
export default class HomeView extends Vue {}
</script>
