<template >
  <div> 
  <PlayerSeb />
  </div>

</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import PlayerSeb from "@/components/player/playerSeb.vue"; 

@Options({
  components: {
    PlayerSeb,
  },
})
export default class HomeView extends Vue {}
</script>
