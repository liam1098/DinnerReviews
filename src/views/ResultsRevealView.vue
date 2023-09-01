<template>
	<div class="resultsReveal">
		<!-- <div>Big fat photo of tino as the background of the front page before reviewing</div> -->
		<div>Consider a component that show the results week by week with some fun aspects involved. Assume it is a fullscreen view too.</div>
        <div>Mcleod staring at 18 year olds meme</div>
        <div v-for="hosts in hostedDinnersReveal" :key="hosts.id">
            <!-- <reviewCards @delete-review="deleteRating(review.id)" :review="review"/> -->
            <div @click="selectedDinner(hosts.id)" class="container">
                <div class="generalStyling">Week Number: {{ hosts.weekNumber }}</div>
                <div class="generalStyling">Host Name: {{ hosts.hostName }}</div>
                <div class="generalStyling">Timestamp: {{ hosts.date.toLocaleString('en-AU') }}</div>
            </div>            
        </div>

        <FlexibleModal :modalActive="modalActive" :modalTitle="modalTitle" :isReveal="isReveal" :buttonAction="buttonAction"
        @close-modal="toggleRevealModal" :imgName="imgName"
        >
            <!-- <div v-for="review in spotlightReviews" :key="review.id" :value="review.weekNumber" >
                <div>{{ review.cook }}</div>
                <div>{{ review.mainRating }}</div>
            </div> -->
            <div class="reveals">
                <h3 class="minorNumber">This weeks average rating for entrees is: 
                    <span :style="{ color: mainTextColour}">
                        {{ averagedCourses?.entreeAvg.toFixed(1) }}
                    </span>
                </h3>
                <h3 class="minorNumber">This weeks average rating for mains is: 
                    <span :style="{ color: mainTextColour}">
                        {{ averagedCourses?.mainAvg.toFixed(1) }}
                    </span>
                </h3>
                <h3 class="minorNumber">This weeks average rating for desserts is: 
                    <span :style="{ color: dessertTextColour}">
                        {{ averagedCourses?.dessertAvg.toFixed(1) }}
                    </span>
                </h3>                
                <h3 class="majorNumber">This weeks average rating after weighting is: {{ weeksAverage?.toFixed(1) }}</h3>
            </div>

        </FlexibleModal>

	</div>

<!-- <router-link to="/about">Go to About Page</router-link> -->


</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed } from 'vue';
import { collection, onSnapshot,
        query, limit, where, Timestamp, orderBy } from "firebase/firestore";
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

        let averagedReviews: AveragedReviews[]  = averagingIndiviualReviews(spotlightReviews.value, weightingVals.value! as ReviewWeighting)
        weeksAverage.value = averagingAveraged(averagedReviews)
        averagedCourses.value = averageCourses(spotlightReviews.value)

        entreeTextColour.value = mapRatingToColor(averagedCourses.value.entreeAvg)
        mainTextColour.value = mapRatingToColor(averagedCourses.value.mainAvg)
        dessertTextColour.value = mapRatingToColor(averagedCourses.value.dessertAvg)

        imgName.value = members.value.find((member) => spotlightHosted.value?.hostName == member.name)?.imgName
    }

    
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
                    read: false
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
        imgName
    }
  }

});
</script>

<style>
.generalStyling {
    margin: 10px 10px;
}

.minorNumber {
    color: rgb(172, 172, 172);
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

.container:hover {
    cursor: pointer;
    background-color: rgb(223, 223, 223);
    border: 1px solid rgb(40, 40, 40);
}

.reveals {
    display: flex;
    flex-direction: column;
    text-align: center;
    gap: 10px;
}

</style>