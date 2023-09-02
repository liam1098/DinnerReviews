<template>
	<div class="resultsReveal">
		<!-- <div>Big fat photo of tino as the background of the front page before reviewing</div> -->
		<div>Consider a component that show the results week by week with some fun aspects involved. Assume it is a fullscreen view too.</div>
        <div>Mcleod staring at 18 year olds meme</div>
        <div v-for="hosts in hostedDinnersReveal" :key="hosts.id">
            <!-- <reviewCards @delete-review="deleteRating(review.id)" :review="review"/> -->
            <div @click="selectedDinner(hosts.id)" :class="{ 'container': true, 'read-card': hosts.isRead }">
                <div class="generalStyling">Week Number: {{ hosts.weekNumber }}</div>
                <div class="generalStyling">Host Name: {{ hosts.hostName }}</div>
                <div class="generalStyling">Date Hosted: {{ hosts.date.toLocaleDateString('en-AU') }}</div>
            </div>            
        </div>

        <FlexibleModal :modalActive="modalActive" :modalTitle="modalTitle" :isReveal="isReveal" :buttonAction="buttonAction" :weekNumber="weekNumber" :dessertAck="dessertAck"
        @close-modal="toggleRevealModal" :imgName="imgName" @mark-as-read="markWeekRead" 
        >
            <!-- <div v-for="review in spotlightReviews" :key="review.id" :value="review.weekNumber" >
                <div>{{ review.cook }}</div>
                <div>{{ review.mainRating }}</div>
            </div> -->
            
            <div class="reveals">
                <transition name="fade">
                    <div class="reveal">
                        <h4 class="minorNumber">Entree average: 
                        <span :style="{ color: mainTextColour}">
                            {{ averagedCourses?.entreeAvg.toFixed(1) }}
                        </span>
                        </h4>
                        <div class="checkbox">
                            <input class="form-check-input" v-model="entreeAck" type="checkbox" value="" id="flexCheckDefault">
                            <label class="form-check-label checkBox" for="flexCheckDefault">
                                Acknowledge
                            </label>
                        </div>
                    </div>
                </transition>
                
                <transition name="fade">
                    <div v-if="entreeAck" class="reveal">
                        <h4 class="minorNumber">Main average: 
                        <span :style="{ color: mainTextColour}">
                            {{ averagedCourses?.mainAvg.toFixed(1) }}
                        </span>
                        </h4>
                        <div class="checkbox">
                            <input class="form-check-input" v-model="mainAck" type="checkbox" value="" id="flexCheckDefault">
                            <label class="form-check-label checkBox" for="flexCheckDefault">
                                Acknowledge
                            </label>
                        </div>
                    </div>
                </transition>

                <Transition name="fade">
                    <div v-if="mainAck" class="reveal">
                        <h4 class="minorNumber">Dessert average: 
                        <span :style="{ color: mainTextColour}">
                            {{ averagedCourses?.dessertAvg.toFixed(1) }}
                        </span>
                        </h4>
                        <div class="checkbox">
                            <input class="form-check-input" v-model="dessertAck" type="checkbox" value="" id="flexCheckDefault">
                            <label class="form-check-label checkBox" for="flexCheckDefault">
                                Acknowledge
                            </label>
                        </div>
                    </div>
                </transition>

                <div v-if="dessertAck" class="weightedReveal">
                    <h2>Total Weighted Average: {{ weeksAverage.toFixed(1) }}</h2>
                    
                </div>

            </div>

        </FlexibleModal>

        <div v-if="areAllRead" class="winnerReveal">
            <h1>Someone probably won so thats cool</h1>
        </div>

	</div>

<!-- <router-link to="/about">Go to About Page</router-link> -->


</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed } from 'vue';
import { collection, onSnapshot,
        query, orderBy } from "firebase/firestore";
import { db } from '@/firebase'

import FlexibleModal from '@/components/FlexibleModal.vue';

// Importing functions
import { averagingIndiviualReviews, averagingAveraged, averageCourses } from '../functions/resultsRevealOps'


import HostedDinnersReveal from '@/types/interface/hostedDinnersReveal';
import Reviews from '@/types/interface/reviews';
import ReviewWeighting from "@/types/interface/reviewWeighting";
import AveragedReviews from "@/types/interface/averagedReviews";
import AveragedCourses from "@/types/interface/averagedCourses";
import Members from '@/types/interface/members';


const hostedDinnerRef = collection(db, 'hostedDinners')
const membersReviewRef = collection(db, 'ratings')
const reviewWeightingRef = collection(db, 'weighting')
const memberRef = collection(db, 'members')



export default defineComponent({
  name: 'ResultsRevealPage',
  components: {
    FlexibleModal
  },

  setup() {
    const hostedDinnersReveal = ref<HostedDinnersReveal[]>([])
    const reviews = ref<Reviews[]>([])
    let members = ref<Members[]>([])


    const spotlightHosted = ref<HostedDinnersReveal>()
    const spotlightReviews = ref<Reviews[]>([])
    const weekNumber = ref<number>()
    const weightingVals = ref<ReviewWeighting>()

    const modalActive = ref<boolean>(false)
    const isReveal = ref<boolean>(true)
    const buttonAction = ref<string>('Mark as read')

    const modalTitle = ref<string>('')
    const weeksAverage = ref<number>()
    const averagedCourses = ref<AveragedCourses>()

    const entreeCheck = ref<boolean>(false)
    const mainCheck = ref<boolean>(false)
    const dessertCheck = ref<boolean>(false)

    const entreeTextColour = ref<string>()
    const mainTextColour = ref<string>()
    const dessertTextColour = ref<string>()
    const imgName = ref<string>()

    // Acknoweledgements
    const entreeAck = ref<boolean>(false)
    const mainAck = ref<boolean>(false)
    const dessertAck = ref<boolean>(false)

    

    const hostedDinnerRefQuery = computed(() => {
        return query(hostedDinnerRef, orderBy('weekNumber', 'asc')); 
    });

    const toggleRevealModal = () => {
        modalActive.value = !modalActive.value

    }

    const selectedDinner = (id : string) => {
        // console.log('id of the selected card is: ', id)
        spotlightHosted.value = hostedDinnersReveal.value.find((dinner) => dinner.id == id) 
        // console.log('Spotlight hosted now equals: ', spotlightHosted.value)
        modalActive.value = true
        modalTitle.value = `Highlights of week ${spotlightHosted.value?.weekNumber} hosted by ${spotlightHosted.value?.hostName}`

        spotlightReviews.value = reviews.value.filter((review) => review.weekNumber == spotlightHosted.value?.weekNumber)
        // Setting the week number on the modal so it can pass it back up when marked as read is clicked
        weekNumber.value = spotlightHosted.value?.weekNumber

        let averagedReviews: AveragedReviews[]  = averagingIndiviualReviews(spotlightReviews.value, weightingVals.value! as ReviewWeighting)
        weeksAverage.value = averagingAveraged(averagedReviews)
        averagedCourses.value = averageCourses(spotlightReviews.value)

        entreeTextColour.value = mapRatingToColor(averagedCourses.value.entreeAvg)
        mainTextColour.value = mapRatingToColor(averagedCourses.value.mainAvg)
        dessertTextColour.value = mapRatingToColor(averagedCourses.value.dessertAvg)


        try {
            let correspondingMember = members.value.find((member) => spotlightHosted.value?.hostName == member.name)
            if (correspondingMember?.imgName) {
                imgName.value = correspondingMember.imgName
            } else {
                imgName.value = 'noImg'
            }

        } catch (err) {
            console.log('Something went wrong with the image retrieval')
        }
    }

    const areAllRead = computed(() => {
        return hostedDinnersReveal.value.every((host) => host.isRead);
    })

    
    // const mainTextColour = computed<string>(() => {
    //     return mapRatingToColor(props.review.mainRating);
    // });

    // const dessertTextColour = computed<string>(() => {
    //     return mapRatingToColor(props.review.dessertRating);
    // });

    function mapRatingToColor(rating: number): string {
        if (rating >= 1 && rating <= 3) {
            return 'red';
        } else if (rating >= 4 && rating <= 6) {
            return 'orange';
        } else if (rating >= 7 && rating <= 10) {
            return 'green';
        } else {
            return 'yellow';
        }
    }

    const markWeekRead = (weekNumber : number) => {
        hostedDinnersReveal.value.forEach((dinner) => {
        if (dinner.weekNumber === weekNumber) {
            // Update the boolean variable (e.g., isRead) to the new value
            dinner.isRead = true; // Replace with the desired new value
            }
        });

        toggleRevealModal();
        entreeAck.value = false
        mainAck.value = false
        dessertAck.value = false
    }



    onMounted(() => {
        onSnapshot(hostedDinnerRefQuery.value, (querySnapshot) => {
            let localHostedDinnersReveal: HostedDinnersReveal[] = []
            querySnapshot.forEach((doc) => {
                const hostedDinner: HostedDinnersReveal = {
                    id: doc.id,
					date: doc.data().date.toDate(),
                    hostID: doc.data().hostID,
					hostName: doc.data().hostName,
					weekNumber: doc.data().weekNumber,
                    read: false,
                    isRead: false
                }
                localHostedDinnersReveal.push(hostedDinner)
            })
            hostedDinnersReveal.value = localHostedDinnersReveal
        })

        onSnapshot(membersReviewRef, (querySnapshot) => {
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
            reviews.value = localReviews;
        });

        onSnapshot(reviewWeightingRef, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const weighting: ReviewWeighting = {
                id: doc.id,
                entreeWeighting: doc.data().entreeWeighting,
                mainWeighting: doc.data().mainWeighting,
                dessertWeighting: doc.data().dessertWeighting,
                
                };
                weightingVals.value = weighting;
            });
        });

        onSnapshot(memberRef, (querySnapshot) => {
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
        })

    })

    return {
        hostedDinnersReveal,
        modalActive,
        modalTitle,
        selectedDinner,
        isReveal,
        buttonAction,
        toggleRevealModal,
        spotlightReviews,
        weeksAverage,
        averagedCourses,
        entreeCheck,
        mainCheck,
        dessertCheck,
        entreeTextColour,
        mainTextColour,
        dessertTextColour,
        imgName,
        entreeAck,
        mainAck,
        dessertAck,
        weekNumber,
        markWeekRead,
        areAllRead
    }
  }

});
</script>

<style>
.generalStyling {
    margin: 10px 10px;
}



.majorNumber {
    color: black;
    font-weight: 900;
}

.container {
    border: 1px solid rgb(199, 199, 199);
    border-radius: 10px;
    width: 65%;
    margin-top: 10px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
}

.read-card {
  border: 1px solid green; /* Change this to your desired border style */
}

.container:hover {
    cursor: pointer;
    background-color: rgb(223, 223, 223);
    border: 1px solid rgb(40, 40, 40);
}

.minorNumber {
    color: rgb(172, 172, 172);
    text-align: left !important;
    width: 250px;
}

.reveals {
    display: flex;
    flex-direction: column;
    text-align: center;
    gap: 10px;
}

/* Updated styling for .reveal */
.reveal {
    display: flex;
    justify-content: space-around;
    align-items: center; /* Align items vertically in each reveal */
    gap: 10px; /* Add some spacing between h4 and checkbox/label */
}

/* Style for your checkboxes and labels */
.checkbox {
    display: flex;
    align-items: center; /* Center checkbox and label vertically */
    flex-wrap: nowrap; /* Ensure that the items stay on the same line */
}

/* Add some margin to labels for better spacing */
.checkBox {
    margin-left: 5px; /* Adjust as needed */
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 2s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>