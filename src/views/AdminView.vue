<template>
  <div class="admin">
    <adminEdit />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import adminEdit from '@/components/adminEdit.vue';

export default defineComponent({
	name: 'AdminView',
	components: {
	adminEdit
	},

	setup() {
		onMounted(() => {
			console.log('Is it even reaching this at all?')
		})
	}
  


});
</script>

<style>


</style>
