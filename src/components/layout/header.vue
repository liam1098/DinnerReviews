<template>
    <header>
        <div class="headerClass">
            <div class="content">

                
                <div class="links">
                    <router-link class="routerLinks" to="/">Home</router-link>

                    <router-link v-if="isAdmin" class="routerLinks" to="/admin">Admin</router-link>

                </div>
                <div class="buttonOrMessage">
                    <div v-if="signedInUser">
                        <div class="dropdown">
                            <button class="dropdown-toggle custom-nav-button" type="button" data-bs-toggle="dropdown" aria-expanded="false" data-bs-animation="fade">
                                {{ signedInUser }}
                            </button>
                            <ul class="dropdown-menu dropdown-changes" id="myDropdown">
                                <h4 class="dropdown-item">Previous reviews:</h4>
                                <div v-for="review in userReviews" :key="review.id" class="reviews">
                                    <div class="text">Cook:  {{ review.cook }}</div>
                                    <div class="text">Entree:  {{ review.entreeRating }}</div>
                                    <div class="text">Main:  {{ review.mainRating }}</div>
                                    <div class="text">Dessert:  {{ review.dessertRating }}</div>

                                </div>
                            </ul>
                        </div>
                    </div>
                    <div v-else>
                        <button :style="{'max-height': '50px'}" @click="googleSignIn"
                        class="btn btn-secondary mt-3 adminCheckField sizeAdjust">Sign-in
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </header>
    
</template>

<script lang="ts">

import { defineComponent, ref, onMounted, computed } from "vue";
import { useStore } from "vuex";
import { db, auth, GoogleAuthProvider, signInWithPopup } from '@/firebase'
import { UserState } from '@/types/interface/storeInterfaces';
import { saveUserInfoToLocalStorage , loadUserInfoFromLocalStorage } from '@/store/localStorageFunctions'
import { collection, onSnapshot, addDoc,
		query, where, Timestamp, limit, orderBy, Query } from "firebase/firestore";
import Admin from "@/types/interface/admin"
import Reviews from "@/types/interface/reviews";

// Firebase refs
const adminCollectionRef = collection(db, 'admins')
const reviewCollectionRef = collection(db, 'ratings')

export default defineComponent ({
    name: 'appHeader',
    setup() {
        // inititiating the store
        const store = useStore()
        const signedInUser = ref('')
        const isAdmin = ref(false)
        const adminList = ref<Admin[]>([])
        const userReviews = ref<Reviews[]>([])
        let userReviewQuery: Query;

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
                if (user.displayName && user.email) {
                    console.log('Sign in has worked')
                    // Checking if this person is an Admin
                    let isUserAdmin = adminList.value.some(admin => admin.name === signedInUser.value)
                    const userInfo : UserState = {
                        name: user.displayName,
                        email: user.email,
                        isAdmin: isUserAdmin
                    }
                    // Saving the user info to 
                    saveUserInfo(userInfo)
                    // Now to save this data to local storage
                    // Save to local storage
                    saveUserInfoToLocalStorage(userInfo);
                    isAdmin.value = isUserAdmin

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
        onMounted(() => {
            if (store.state.user.name) {
                signedInUser.value = store.state.user.name
                isAdmin.value = store.state.user.isAdmin
                userReviewQuery = query(reviewCollectionRef, where('name', '==', signedInUser.value)); 
            }  
            if (signedInUser.value) {
                onSnapshot(userReviewQuery, (querySnapshot) => {
                    let localReviews: Reviews[] = [];
                    querySnapshot.forEach((doc) => {
                        const review: Reviews = {
                        id: doc.id,
                        name: doc.data().name,
                        cook: doc.data().cook,
                        entreeRating: doc.data().entreeRating,
                        mainRating: doc.data().mainRating,
                        dessertRating: doc.data().dessertRating,
                        date: doc.data().date.toDate(),
                        weekNumber: doc.data().weekNumber
                        };
                        localReviews.push(review);
                    });
                    userReviews.value = localReviews;
                })
            }
            

            // Getting list of admins
            onSnapshot(adminCollectionRef, (querySnapshot) => {
                let localAdmin: Admin[] = []
                querySnapshot.forEach((doc) => {
                    const admin: Admin = {
                        id: doc.id,
                        name: doc.data().name,
                        email: doc.data().email,
                        adminStatus: doc.data().adminStatus,
                        password: doc.data().password
                    }
                    if (admin.adminStatus) {
                        localAdmin.push(admin)
                    }
                })
                adminList.value = localAdmin
            })	

        })

        return {
            signedInUser,
            googleSignIn,
            isAdmin,
            userReviews
        }
    }
    

})
</script>


<style scoped>
.headerClass {
    width: 100%;
    background-color: #57abf4;
}
.routerLinks {
    text-decoration: none;
    color: black;
}

.content {
    width: 90%;
    display: flex;
    justify-content: space-between;
    margin: 0 auto;
    font-size: 1.25em;
}
.links {
    display: flex;
}

.buttonOrMessage {
    color: white;
    align-items: center;
    text-align: center;
    display: flex;
}

.custom-nav-button {
    background-color: #57abf4; /* Add your desired background color */
    color: black; /* Add your desired text color */
    border: none; /* Remove the border if you want */
     /* Adjust the font size as needed */
    /* Add any other custom styles you want */
}

.dropdown-changes {
    width: 220px;
}

.reviews {
    border: 1px solid rgb(197, 197, 197);
    border-radius: 16px;
    background-color: #ffffff;
    padding: 3px 3px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
    font-size: .8em;
}

.text {
    padding: 3px 3px;
}

#myDropdown {
  opacity: 0;
  transform-origin: top;
  transform: scaleY(0);
  transition: opacity 0.2s, transform 0.2s;
}

#myDropdown.show {
  opacity: 1;
  transform: scaleY(1);
  transition: opacity 0.4s, transform 0.4s;
}

#myDropdown.hide {
  opacity: 0;
  transform: scaleY(0);
  transition: opacity 0.2s, transform 0.2s;
}

</style>
  