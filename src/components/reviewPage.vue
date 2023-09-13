<template>
	<div class="reviewPage">		
		<!-- Use the 'form-select' class to style the select dropdown with Bootstrap -->
		<div>"Gee wouldn't wanna tap me in the face"</div>
		<div class="spinning-image-container">
			<img :src="require('@/assets/tinoFlick.png')" @click="playClickSound" class="image-resizing spin-in"
				alt="Didnt load">
		</div>


		<audio ref="clickAudio" :src="require('@/assets/moaningSound.mp3')" preload="auto"></audio>

		<div v-if="allowReviews && signedInUser" class="reviewSection">
			<div class="form-group">
				<label for="userSelect" class="col-form-label labels">You are:</label>
				<div class="input-container memberSelectionAndImage">
					<select v-model="selectedMember" class="form-select inputs">
						<option value="" disabled>Select a member</option>
						<option v-for="member in nonHostMembers" :key="member.id" :value="member.name">{{ member.name }}</option>
					</select>
					<div>{{ signedInUser }}</div>
					<div v-if="selectedMember" class="image-container">
						<img :src="require(`@/assets/${imgName}.jpeg`)" alt="Didnt load" class="miniImage">
					</div>
				</div>
			</div>
			<div v-if="selectedMember && signedInUser" class="form-group">
				<label for="revieweeSelect" class="col-form-label labels">Who hosted tonight?:</label>
				<div class="input-container memberSelectionAndImage">
					<select v-model="selectedReviewee" class="form-select inputs">
						<option value="" disabled>Select a member</option>
						<option v-for="member in availableReviewees" :key="member.id" :value="member.name">{{ member.name }}</option>
					</select>
					<div v-if="selectedReviewee" class="image-container">
						<img :src="require(`@/assets/${imgNameReviewee}.jpeg`)" alt="Didnt load" class="miniImage">
					</div>
				</div>
			</div>

			<!-- div here for warning people / telling them they cant vote again since they have already voted -->

			<div v-if="selectedReviewee" class="form-group">
				<label for="numberRating" class="col-form-label labels longer">What do you rate tonight? (1-10):</label>
				<div class="input-container">
					<div class="labelAndNumberInput">
						<label for="entreeVal" class="col-form-label labels">Entree rating:</label>
						<input v-model="entreeVal" type="number" class="form-control inputs numberInputs" id="entreeVal" placeholder="Enter a number">
					</div>
					<div class="warning-message" v-if="!isEntreeRatingSatisfactory">Enter a valid number</div>
					<label for="mainVal" class="col-form-label labels">Main rating:</label>
					<input v-model="mainVal" type="number" class="form-control inputs numberInputs" id="mainVal" placeholder="Enter a number">
					<div class="warning-message" v-if="!isMainRatingSatisfactory">Enter a valid number</div>
					<label for="dessertVal" class="col-form-label labels">Dessert rating:</label>
					<input v-model="dessertVal" type="number" class="form-control inputs numberInputs" id="dessertVal" placeholder="Enter a number">
					<div class="warning-message" v-if="!isDessertRatingSatisfactory">Enter a valid number</div>
					<div class="warning-message" v-if="!areRatingsSatisfactory">No bs will be allowed. numbers 1-10 only and no more than 2 DP's</div>
				</div>
			</div>
			<button v-show="false" @click="tester" class="btn btn-secondary mt-3 adminCheckField"> Tester</button>
			<!-- Use the 'btn btn-primary' classes for a Bootstrap-styled button -->
			<button @click="submitReview" class="btn btn-primary mt-3" :disabled="!allowSubmit">Submit</button>
			<audio ref="submitClick" :src="require('@/assets/notGoodSound.mp3')" preload="auto"></audio>
		</div>

		

		<!-- <button @click="testerFunction" class="btn btn-secondary mt-3">tester button</button> -->
		<!-- <button @click="testerFunction">Tester function</button> -->


		
		<div v-if="oneHostedDinner">
			<h5 class="constraints" :class="{ 'show': showH4 }" v-if="!allowReviews">The details for the next upcoming dinner is:</h5>
			<UpcomingScheduleCards :dinner="allHostedDinners[0]" />
		</div>
		<div v-else>
			<h5 class="constraints" :class="{ 'show': showH4 }" v-if="!allowReviews">The details for the next upcoming dinners are:</h5>
			<div v-for="dinners in allHostedDinners" :key="dinners.id">
					<UpcomingScheduleCards :dinner="dinners" />
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
		query, where, Timestamp, limit, orderBy } from "firebase/firestore";
import { db, auth, GoogleAuthProvider, signInWithPopup } from '@/firebase'
import { useToast, POSITION  } from "vue-toastification";

import { useStore } from "vuex";

import UpcomingScheduleCards from "./upcomingScheduleCards.vue";


// Firebase ref
const membersCollectionRef = collection(db, 'members')
const membersReviewRef = collection(db, 'ratings')
const adminCollectionRef = collection(db, 'admins')

const hostedDinnerRef = collection(db, 'hostedDinners')



export default defineComponent ({
	name: 'reviewPage',
	components: {
		UpcomingScheduleCards
	},
	setup() {
    const members = ref<Members[]>([])
    const nonHostMembers = ref<Members[]>([])
	const hostedDinners = ref<HostedDinners[]>([])
    const selectedMember = ref<string | null>(null); // Change the type to string | null
    const selectedReviewee = ref<string | null>(null);

	const allHostedDinners = ref<HostedDinners[]>([])
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
	const showH4 = ref(false);


	const clickAudio = ref<HTMLAudioElement | null>(null);
	const submitClick = ref<HTMLAudioElement | null>(null);

	// Temporary div with the persons name to test auth again
	const helloPerson = ref<string>('')

	// Toasts
	let toast = useToast();

	// Store
	const store = useStore()
	const signedInUser = ref('')


    // Play the click sound
    const playClickSound = () => {
		if (clickAudio.value) {
			clickAudio.value.play();
		}
    };

	const playSubmitSound = () => {
		if (submitClick.value) {
			submitClick.value.play();
		}
	}
	const successToast = (message : string) => {
		toast.success(message, {
			position: POSITION.TOP_CENTER,
			timeout: 5000,
			closeOnClick: true,
			pauseOnFocusLoss: true,
			pauseOnHover: true,
			draggable: true,
			draggablePercent: 0.5,
			showCloseButtonOnHover: true,
			hideProgressBar: true,
			closeButton: "button",
			icon: true,
			rtl: false
		});
	}

	// Logic is easier to follow even with these extra steps
	const allowSubmit = computed(() => {
		if (allowReviews.value == true && areRatingsSatisfactory.value == true) {
			return true
		} else {
			return false
		}
	})

	

    const hostedDinnerRefQuery = computed(() => {
        const today = new Date(); // Get the current date
        today.setHours(0, 0, 0, 0); // Set time to midnight for accurate comparison
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return query(hostedDinnerRef, where('date', '>=', Timestamp.fromDate(today)), where ('date', '<=', Timestamp.fromDate(tomorrow)),limit(1)); 
    });
    const allHostedDinnersRefQuery = computed(() => {
		const today = new Date(); // Get the current date
        today.setHours(0, 0, 0, 0); // Set time to midnight for accurate comparison
        return query(hostedDinnerRef, where('date', '>=', Timestamp.fromDate(today)), orderBy("date")); 
    });

	const imgName = computed(() => {
		if (selectedMember.value) {
			let memberObject = members.value.find((member) => member.name == selectedMember.value)
			if (memberObject) {
				return memberObject.imgName
			}
			else {
				return null
			}
		} else return null
	})
	const imgNameReviewee = computed(() => {
		if (selectedReviewee.value) {
			let memberObject = members.value.find((member) => member.name == selectedReviewee.value)
			if (memberObject) {
				return memberObject.imgName
			}
			else {
				return null
			}
		} else return null
	})

    const submitReview = () => {
		// firebase method to add a doc
		addDoc(membersReviewRef, {
            name: selectedMember.value,
			cook: selectedReviewee.value, 
			entreeRating: entreeVal.value,
			mainRating: mainVal.value,
			dessertRating: dessertVal.value,
			date: new Date(),
			weekNumber: hostedDinners.value[0].weekNumber
        })
		playSubmitSound();
		successToast('Review successfully submitted');

        selectedReviewee.value = ''
        entreeVal.value = 0
		mainVal.value = 0
		dessertVal.value = 0

    };

    const availableReviewees = computed(() => {
		// Filter the members array to exclude the host. If no hosted dinner today then exlucde the selected member
		// const filteredMembers = ref<Members[]>([])
		if (hostedDinners.value[0]) {
			return members.value
			.filter((member) => member.name === hostedDinners.value[0].hostName)
			.filter((member) => member.name !== selectedMember.value);
		} else {
			return members.value.filter((member) => member.name !== selectedMember.value);
		}

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

	

	// currently for testing toasts
	const tester = (() => {
		console.log('New hosted dinners all: ', allHostedDinners.value)
	})
	const testerFunction = (() => {
		toast.success("This is a tester function button", {
			position: POSITION.TOP_CENTER,
			timeout: 5000,
			closeOnClick: true,
			pauseOnFocusLoss: true,
			pauseOnHover: true,
			draggable: true,
			draggablePercent: 0.5,
			showCloseButtonOnHover: true,
			hideProgressBar: true,
			closeButton: "button",
			icon: true,
			rtl: false
		});
	})

	const oneHostedDinner = computed(() => {
		return allHostedDinners.value.length == 1
	})

	
	
	const logTesting = (() => {
		console.log(googleUser.value)
		tempBool.value = true
	})


    onMounted(() => {
		// Testing outsourcing hosted dinners API call to other files
		// Will come back to this at a later time and date. The on snapshot functionality is more difficult to keep
		// Saving new docs should be easily outsourced however

		onSnapshot(allHostedDinnersRefQuery.value, (querySnapshot) => {
            let localHostedDinners: HostedDinners[] = []
            querySnapshot.forEach((doc) => {
                const hostedDinner: HostedDinners = {
                    id: doc.id,
					date: doc.data().date.toDate(),
					hostName: doc.data().hostName,
					weekNumber: doc.data().weekNumber,
					season: doc.data().season
                }
                localHostedDinners.push(hostedDinner)
            })
            allHostedDinners.value = localHostedDinners
        })
		onSnapshot(hostedDinnerRefQuery.value, (querySnapshot) => {
            let localHostedDinners: HostedDinners[] = []
            querySnapshot.forEach((doc) => {
                const hostedDinner: HostedDinners = {
                    id: doc.id,
					date: doc.data().date.toDate(),
					hostName: doc.data().hostName,
					weekNumber: doc.data().weekNumber,
					season: doc.data().season
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

		onSnapshot(membersCollectionRef, (querySnapshot) => {
            let localMembers: Members[] = []
            querySnapshot.forEach((doc) => {
                const member: Members = {
                    id: doc.id,
                    name: doc.data().name,
					imgName: doc.data().imgName
                }
                localMembers.push(member)
            })
            members.value = localMembers
			if (hostedDinners.value[0]) {
				nonHostMembers.value = members.value.filter((member) => member.name !== hostedDinners.value[0].hostName)
			} else {
				nonHostMembers.value = members.value
			}

        })

		if (store.state.user.name) {
			signedInUser.value = store.state.user.name
		}

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
		setTimeout(() => {
			showH4.value = true;
		}, 2000); 

    })

	return {
        members,
		hostedDinners,
        selectedMember,
        selectedReviewee,
        submitReview,
        availableReviewees,
		nonHostMembers,
        entreeVal,
		mainVal,
		dessertVal,
        ratingsSubmitted,
		isTyler,
		logTesting,
		tempBool,
		passwordInput,
		tester,
		areRatingsSatisfactory,
		isEntreeRatingSatisfactory,
		isMainRatingSatisfactory,
		isDessertRatingSatisfactory,
		allowReviews,
		playClickSound,
		clickAudio,
		imgName,
		imgNameReviewee,
		submitClick,
		playSubmitSound,
		testerFunction,
		allowSubmit,
		toast,
		showH4,
		helloPerson,
		allHostedDinners,
		signedInUser,
		oneHostedDinner
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

.constraints {
	max-width: 70%;
	margin-top: 30px;
	opacity: 0;
	transition: opacity 0.5s ease-in-out;
	margin: 0px auto;
	margin-top: 26px;
}

.show {
  opacity: 1;
}
.image-resizing {
	max-height: 120px;
	/* max-width: 100%; Ensure the image doesn't exceed its container */
	display: block; /* Remove any extra space below the image */
	margin: 0 auto; /* Center the image horizontally */
	border-radius: 8px; /* Apply rounded corners to the image */
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Add a subtle shadow */
}


.spinning-image-container {
  position: relative;
  z-index: 2;
}

.spin-in {
  /* Delay the spinning animation by 1 second */
  animation: spin-in 1.5s ease-out forwards 1s;
}

.numberInputs {
	max-width: 20%;
	margin: 0 auto;
	text-align: center;
}

/* .labelAndNumberInput {
	display: flex;
	justify-content: space-around;
} */


@keyframes spin-in {
  0% {
    transform: rotate(-180deg) scale(8); /* Start larger */
    opacity: .25;
  }
  100% {
    transform: rotate(0) scale(1);
    opacity: 1;
  }
}

.memberSelectionAndImage {
	display: flex;
	align-items: center;
	gap: 10px;
}

.image-container {
	display: flex;
	align-items: center; /* Align items vertically in the center */
}

.miniImage {
	height: 80px;
	width: auto;
	display: block; /* Prevents extra space below the image */
	margin: 0 auto; /* Center the image horizontally */
	border-radius: 20px; /* Apply rounded corners to the image */
	transform: translateY(-10px);
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Add a subtle shadow */
}

/* Apply the animation to the image */
.spinning-animation {
  animation: spin-in 1.5s ease-out forwards;
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

/* .upcomingDinnerCard {
	display: flex;
    flex-direction: column;
    border: 2px solid rgb(197, 197, 197);
    border-radius: 12px;
    background-color: #ffffff;
    border-radius: 10px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
    padding: 20px 20px;
    margin-top: 20px;
    margin-bottom: 20px;
    background: linear-gradient(to bottom, #f5f5f5, #eaeaea);
	transition: background-color 0.3s, box-shadow 0.3s;
}

.upcomingDinnerCard:hover {
    background-color: #ffe6e6;
    box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.3);
	cursor: pointer;
} */

.upcomingDinnerCard {
    /* Background color with a subtle gradient */
    background: linear-gradient(to bottom, #ffffff, #f0f0f0);
    /* Soft border color */
    border: 2px solid rgb(219, 219, 219);
    border-radius: 12px;
	min-width: 240px;
    /* Padding and margin adjustments for mobile devices */
    padding: 15px 10px; /* Smaller padding for mobile */
    margin: 10px 0; /* Reduced margin for mobile */
    /* Text styles */
    color: #333; /* Dark gray text color */
    /* font-family: "Arial", sans-serif; */
	font-weight: 400;
    font-size: 20px; /* Smaller font size for mobile */
    /* Box shadow for subtle depth */
    box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.2);
    /* Transition for hover effect */
    transition: background-color 0.3s, box-shadow 0.3s;
}

.info {
    display: flex;
    justify-content: space-between;
    align-items: center; /* Align labels at the start (left) */
    padding: 5px 0;
	
}

.label {
    font-weight: bold;
    color: #888;
    width: 30%; /* Adjust label width as needed */
	text-align: start;
}

.data {
    width: 70%; /* Adjust data width as needed */
    text-align: right; /* Right-align the reference data */
}



.upcomingDinnerCard:hover {
    background-color: #f0f0f0; /* Lighter background on hover */
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.3);
}



@keyframes wiggle {
  0% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(10deg);
  }
  50% {
    transform: rotate(-10deg);
  }
  75% {
    transform: rotate(10deg);
  }
  100% {
    transform: rotate(0deg);
  }
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
  /*
  .doesntWorkOnMobile {
	display: none !important;
  }  */

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