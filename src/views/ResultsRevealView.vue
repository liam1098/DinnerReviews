<template>
	<div class="resultsReveal">
		<!-- <div>Big fat photo of tino as the background of the front page before reviewing</div> -->
		<div>Consider a component that show the results week by week with some fun aspects involved. Assume it is a fullscreen view too.</div>
        <div>Week by week and a button to go to the next page to show the next weeks results. Still able to </div>
        <div>Mcleod staring at 18 year olds meme</div>
        <div v-for="hosts in hostedDinners" :key="hosts.id">
            <!-- <reviewCards @delete-review="deleteRating(review.id)" :review="review"/> -->
            <div class="container">
                <div class="generalStyling">Timestamp: {{ hosts.date }}</div>
                <div class="generalStyling">Host Name: {{ hosts.hostName }}</div>
                <div class="generalStyling">Week Number: {{ hosts.weekNumber }}</div>
            </div>            
        </div>
	</div>

<!-- <router-link to="/about">Go to About Page</router-link> -->


</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed } from 'vue';
import { collection, onSnapshot,
        query, limit, where, Timestamp } from "firebase/firestore";
import { db } from '@/firebase'


import HostedDinners from '@/types/interface/hostedDinners';
const hostedDinnerRef = collection(db, 'hostedDinners')


export default defineComponent({
  name: 'ResultsRevealPage',
  components: {
    
  },

  setup() {
    const hostedDinners = ref<HostedDinners[]>([])
    const allowReviews = ref<boolean>(false)

    

    const hostedDinnerRefQuery = computed(() => {
        const today = new Date(); // Get the current date
        today.setHours(0, 0, 0, 0); // Set time to midnight for accurate comparison
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return query(hostedDinnerRef, where('date', '>=', Timestamp.fromDate(today)), where ('date', '<=', Timestamp.fromDate(tomorrow)),limit(1)); 
    });

    onMounted(() => {
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
            if (hostedDinners.value == null) {
                allowReviews.value = false
            } else return true
        })
    })

    return {
        hostedDinners,
        allowReviews
    }
  }

});
</script>

<style>
.generalStyling {
    margin: 10px 10px;
}

.container {
    border: 1px solid rgb(199, 199, 199);
    border-radius: 10px;
    width: 65%;
    margin-top: 10px;
}

</style>