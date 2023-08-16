<template>
	<div class="reviewPage">
		<!-- <div>Big fat photo of tino as the background of the front page before reviewing</div> -->

		<!-- Use the 'form-select' class to style the select dropdown with Bootstrap -->
		<div class="form-group">
			<label for="userSelect" class="col-form-label labels">You are:</label>
			<div class="input-container">
				<select v-model="selectedMember" class="form-select inputs">
					<option value="" disabled>Select a member</option>
					<option v-for="member in members" :key="member.id" :value="member.name">
						{{ member.name }}
					</option>
				</select>
			</div>
		</div>
		<div v-if="selectedMember" class="form-group">
			<label for="revieweeSelect" class="col-form-label labels">Who hosted tonight?:</label>
			<div class="input-container">
				<select v-model="selectedReviewee" class="form-select inputs">
					<option value="" disabled>Select a member</option>
					<option v-for="member in availableReviewees" :key="member.id" :value="member.name">
						{{ member.name }}
					</option>
				</select>
			</div>
		</div>

		<!-- div here for warning people / telling them they cant vote again since they have already voted -->

		<div v-if="selectedReviewee" class="form-group">
			<label for="numberRating" class="col-form-label labels longer">What do you rate tonight? (1-10):</label>
			<div class="input-container">
				<input v-model="entreeVal" type="number" class="form-control inputs" id="entreeVal" placeholder="Enter a number">
				<div class="warning-message" v-if="!isEntreeRatingSatisfactory">Enter a valid number</div>
				<input v-model="mainVal" type="number" class="form-control inputs" id="mainVal" placeholder="Enter a number">
				<div class="warning-message" v-if="!isMainRatingSatisfactory">Enter a valid number</div>
				<input v-model="dessertVal" type="number" class="form-control inputs" id="dessertVal" placeholder="Enter a number">
				<div class="warning-message" v-if="!isDessertRatingSatisfactory">Enter a valid number</div>

				<div class="warning-message" v-if="!areRatingsSatisfactory">No bs will be allowed. numbers 1-10 only and no more than 2 DP's</div>
			</div>
		</div>
		<button v-show="false" @click="tester"
			class="btn btn-secondary mt-3 adminCheckField"> Tester</button>
		<!-- Use the 'btn btn-primary' classes for a Bootstrap-styled button -->
		<button @click="submitReview" class="btn btn-primary mt-3" :disabled="!areRatingsSatisfactory">Submit</button>

		<div class="adminSignInChecks" v-if="isTyler">
			<button v-if="!isAdmin"  @click="googleSignIn"
			class="btn btn-secondary mt-3 adminCheckField">Admin sign in</button>

			<input class="adminCheckField" v-model="passwordInput" type="password">
			

			<div v-if="!isAdmin">
				<router-link to="/admin">
					<button
					class="btn btn-success mt-3 adminCheckField">Go to admin page</button>
				</router-link>
			</div>
		</div>
	</div>
</template>



<script lang="ts">
import { defineComponent, ref, onMounted, computed } from "vue";
import Members from "@/types/interface/members"
import Admin from "@/types/interface/admin"
import HostedDinners from "@/types/interface/hostedDinners"
import { collection, onSnapshot, addDoc,
		query, where, Timestamp, limit } from "firebase/firestore";
import { db, auth, GoogleAuthProvider, signInWithPopup } from '@/firebase'

// Firebase ref
const membersCollectionRef = collection(db, 'members')
const membersReviewRef = collection(db, 'ratings')
const adminCollectionRef = collection(db, 'admins')

const hostedDinnerRef = collection(db, 'hostedDinners')

export default defineComponent ({
	name: 'reviewPage',
	components: {

	},
	setup() {
    const members = ref<Members[]>([])
	const hostedDinners = ref<HostedDinners[]>([])
    const selectedMember = ref<string | null>(null); // Change the type to string | null
    const selectedReviewee = ref<string | null>(null);
	// Ratings
    const entreeVal = ref<number>(0)
    const mainVal = ref<number>(0)
    const dessertVal = ref<number>(0)

    const ratingsSubmitted = ref<boolean>(false);

	const adminList = ref<Admin[]>([])
	const passwordInput = ref<string | null>(null)

	let googleUser = ref<string | null>(null)

	let tempBool = ref<boolean>(false)
	// Bool value to determine if the user is currently allowed to add new reviews to the DB
    const allowReviews = ref<boolean>(false)

    

    const hostedDinnerRefQuery = computed(() => {
        const today = new Date(); // Get the current date
        today.setHours(0, 0, 0, 0); // Set time to midnight for accurate comparison
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return query(hostedDinnerRef, where('date', '>=', Timestamp.fromDate(today)), where ('date', '<=', Timestamp.fromDate(tomorrow)),limit(1)); 
    });

    const submitReview = () => {
		addDoc(membersReviewRef, {
            name: selectedMember.value,
			cook: selectedReviewee.value, 
			entreeRating: entreeVal.value,
			mainRating: mainVal.value,
			dessertRating: dessertVal.value,
			date: new Date()
        })
        selectedReviewee.value = ''
        entreeVal.value = 0
		mainVal.value = 0
		dessertVal.value = 0

    };

    const availableReviewees = computed(() => {
      // Filter the members array to exclude the selectedMember
      return members.value.filter((member) => member.id !== selectedMember.value);
    });


	// Need to think about a good way to do this for all three different rating sections
    function isRatingSatisfactory(ratingVal: number): boolean {
		// Check if ratingVal is a valid rating (between 0 and 10, inclusive)
		if (ratingVal > 0 && ratingVal <= 10) {
			// Check if the number has more than 2 decimal places
			const decimalPart = ratingVal - Math.floor(ratingVal);
			if (decimalPart.toFixed(2).split('.')[1]?.length > 2) {
				return false;
			} else {
				return true;
			}
		} else {
			return false;
		}
	}

	const isEntreeRatingSatisfactory = computed(() => {
		return isRatingSatisfactory(entreeVal.value);
	});

	const isMainRatingSatisfactory = computed(() => {
		return isRatingSatisfactory(mainVal.value);
	});
	const isDessertRatingSatisfactory = computed(() => {
		return isRatingSatisfactory(dessertVal.value);
	});

	const areRatingsSatisfactory = computed(() => {
		return (
			isEntreeRatingSatisfactory.value &&
			isMainRatingSatisfactory.value &&
			isDessertRatingSatisfactory.value
		);
	});

	const isTyler = computed<boolean>(() => {
		if (selectedMember.value == "Tyler Best") {
			return true
		} else return false
	})

	const isAdmin = computed<boolean>(() => {
		// Some sort of simple password check here
		return adminList.value.some(admin => admin.name === selectedMember.value && admin.password === passwordInput.value);

	})

	const tester = (() => {
		console.log(entreeVal.value, isEntreeRatingSatisfactory.value)
		console.log(mainVal.value, isMainRatingSatisfactory.value)
		console.log(dessertVal.value, isDessertRatingSatisfactory.value)
	})
	
	const logTesting = (() => {
		console.log(googleUser.value)
		tempBool.value = true
	})


	const googleSignIn = async () => {
		const provider = await new GoogleAuthProvider();
		signInWithPopup(auth, provider)
		.then((result) => {
			const user = result.user
			googleUser.value = user.displayName
			console.log('user:', googleUser)
		}).catch((error) => {
			// Handle Errors here.
			const errorCode = error.code;
			const errorMessage = error.message;
			console.error(errorCode)
			console.error(errorMessage)
		})
	}

	// alternate to work on mobile devices

    onMounted(() => {
        onSnapshot(membersCollectionRef, (querySnapshot) => {
            let localMembers: Members[] = []
            querySnapshot.forEach((doc) => {
                const member: Members = {
                    id: doc.id,
                    name: doc.data().name
                }
                localMembers.push(member)
            })
            members.value = localMembers
        })

		onSnapshot(hostedDinnerRefQuery.value, (querySnapshot) => {
            let localHostedDinners: HostedDinners[] = []
            querySnapshot.forEach((doc) => {
                const hostedDinner: HostedDinners = {
                    id: doc.id,
					date: doc.data().date.toDate(),
                    hostID: doc.data().hostID,
					hostName: doc.data().hostName,
					weekNumber: doc.data().weekNumber
                }
                localHostedDinners.push(hostedDinner)
            })
            hostedDinners.value = localHostedDinners
            if (hostedDinners.value.length == 0) {
                allowReviews.value = false
            } else {
				allowReviews.value = true
			}
        })

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
        members,
		hostedDinners,
        selectedMember,
        selectedReviewee,
        submitReview,
        availableReviewees,
        entreeVal,
		mainVal,
		dessertVal,
        ratingsSubmitted,
		isTyler,
		googleSignIn,
		isAdmin,
		logTesting,
		tempBool,
		passwordInput,
		tester,
		areRatingsSatisfactory,
		isEntreeRatingSatisfactory,
		isMainRatingSatisfactory,
		isDessertRatingSatisfactory,
		allowReviews

	}
	}

})


</script>

<style>
ul {
  list-style-type: none;
}

.reviewPage {
  max-width: 384px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 50px auto;
}

.form-group {
  display: flex; /* Use flexbox to align labels and inputs horizontally */
  align-items: center; /* Center elements vertically */
  margin-bottom: 10px; /* Add some spacing between form groups */
}

.col-form-label {
  flex: 1; /* Allow the label to grow to occupy available space */
  text-align: left;
}

.labels {
  font-weight: bolder;
  color: #b0b0b0;
}

.input-container {
  flex: 2; /* Allow the input/select to grow to occupy available space */
}

.inputs {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Adjust the values as per your preference */
  margin-bottom: 16px;
}

.warning-message {
    margin-top: 8px;
	margin-bottom: 6px;
    font-size: .75em;
    color: red;
}

.adminSignInChecks {
	display: flex;
	flex-direction: column;
}

.adminCheckField {
	margin: 10px 0px;
}

@media screen and (max-width: 767px) {
  .form-group {
    flex-direction: column; /* Stack labels and inputs on top of each other */
  }
  .labels.longer {
    max-width: 300px;
    text-align: center;
  }
  .input-container {
    width: 300px; /* Make inputs take full width on mobile */
  }

}

/* Adjust label and input sizes for larger screens */
@media screen and (min-width: 768px) {
  .form-group {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    
  }
  
  .col-form-label {
    width: auto; /* Allow label to take the necessary space for its content */
    margin-right: 10px; /* Add some spacing between label and input */
  }
  
  .input-container {
    flex: 1; /* Allow input to take up the remaining available space */
  }
}

</style>