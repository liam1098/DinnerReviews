<template>
    <!-- All the HTML/subcomponents you need to display your list -->

    <div>hello there</div>
    <button @click="googleSignIn">sign in to google</button>
    <button
    :style="{'margin-top': '20px'}" @click="testLoadFromStorage">Test local storage</button>

    <div class="onScreenMessage">{{ onScreenMessage }}</div>
    
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db, auth, GoogleAuthProvider, signInWithPopup } from '@/firebase'

import { useStore } from 'vuex';
import { saveUserInfoToLocalStorage , loadUserInfoFromLocalStorage } from '@/store/localStorageFunctions'
import { UserState } from '@/types/interface/storeInterfaces';
import { User } from 'firebase/auth';

const store = useStore()

const userName = ref<string | null >(null)
const userEmail = ref<string | null >(null)

const onScreenMessage = ref('')

const saveUserInfo = (userInformation : UserState) => {
    // Update store
    store.commit('user/SET_USER_INFO', userInformation);
    console.log('Printing out the details saved to the store here: ', store.state.user.name)
}

const googleSignIn = async () => {
    const provider = await new GoogleAuthProvider();
    signInWithPopup(auth, provider)
    .then((result) => {
        const user = result.user
        userName.value = user.displayName
        userEmail.value = user.email

        // console.log('user:', userName.value)
        // console.log('user email:', userEmail.value)
        if (userName.value && userEmail.value) {
            console.log('Sign in has worked')
            const userInfo : UserState = {
                name: userName.value,
                email: userEmail.value,
                isAdmin: false
            }
            saveUserInfo(userInfo)

            // Now to save this data to local storage
            // Save to local storage
            saveUserInfoToLocalStorage(userInfo);

        } else {
            console.log('seems like sign in worked but you have no name or no email')
        }

    }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code
        const errorMessage = error.message;
        console.error(errorCode)
        console.error(errorMessage)
    })
}

// Load user info from local storage on component mount
const testLoadFromStorage = () => {
    // console.log('this button is working')
    try {
        const userInfo = loadUserInfoFromLocalStorage();
    if (userInfo) {
        console.log('User info loaded from local storage:', userInfo);
        onScreenMessage.value = `${userInfo.name}  ${userInfo.email}`
    } else {
        console.log('No user info found in local storage.');
        onScreenMessage.value = 'No user info found in local storage'
    }
    } catch (error) {
        console.error('Error loading user info from local storage:', error);
        onScreenMessage.value = 'There was an error'
    }
};

</script>

<style>
.onScreenMessage {
    margin: 40px auto;

}
</style>
  