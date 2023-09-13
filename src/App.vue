<template>
	<AppHeader />

	<!-- <router-view v-slot="{ Component }">
		<transition name="route" mode="out-in">
			<component  :is="Component"/>
		</transition>
	</router-view> -->

	<RouterView />
	


	<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
	<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</template>

<script lang="ts">
import AppHeader from '@/components/layout/header.vue'

export default {
  components: {
    AppHeader, // Register the header component
  },

};


</script>


<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;

}


div a {
  font-weight: bold;
  color: #2c3e50;
}

div a.router-link-exact-active {
  color: #42b983;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
main {
  flex: 1;
  padding: 10px;
}

.routerLinks {
  margin: 10px 10px;
}

/* Route transitions */
/* Update the CSS class prefix to match the 'name' attribute */
.route-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.route-enter-active {
  transition: all 0.3s ease-out;
}

.route-leave-to {
  opacity: 0;
  transform: translateX(-100px);
}

.route-leave-active {
  transition: all 0.3s ease-in;
}


</style>
