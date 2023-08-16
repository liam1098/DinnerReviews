<template>
	<div class="home">
		<!-- <div>Big fat photo of tino as the background of the front page before reviewing</div> -->
		<reviewPage />
	</div>

<!-- <router-link to="/about">Go to About Page</router-link> -->


</template>

<script lang="ts">
import { defineComponent } from 'vue';
import reviewPage from '@/components/reviewPage.vue';

export default defineComponent({
  name: 'HomeView',
  components: {
    reviewPage
  }

});
</script>

<style>


</style>
