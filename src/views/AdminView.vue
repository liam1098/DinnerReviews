<template>
  <div class="admin">
    <adminEdit />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import adminEdit from '@/components/adminEdit.vue';

export default defineComponent({
  name: 'AdminView',
  components: {
    adminEdit
  }

});
</script>

<style>


</style>
