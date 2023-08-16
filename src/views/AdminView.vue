<template>
  <div class="admin">
    <firebaseTest />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import firebaseTest from '@/components/firebaseTest.vue';

export default defineComponent({
  name: 'AdminView',
  components: {
    firebaseTest
  }

});
</script>

<style>


</style>
