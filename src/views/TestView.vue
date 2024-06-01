<template >
  <div> 
  <CustomPlayer />
  </div>

</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import PlayerSeb from "@/components/player/playerSeb.vue"; 
import CustomPlayer from "@/components/player/CustomPlayer.vue"; 

@Options({
  components: {
    CustomPlayer,
  },
})
export default class HomeView extends Vue {}
</script>
