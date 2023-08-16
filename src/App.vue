<template>
  <nav>
    <router-link class="routerLinks" to="/">Home</router-link>
    <router-link class="routerLinks" to="/resultsReveal">Results Reveal</router-link>
  </nav>
  <router-view/>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
</template>

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
</style>
