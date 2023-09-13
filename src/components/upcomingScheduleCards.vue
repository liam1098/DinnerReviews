<template>
    <div class="container">
        <div class="upcomingDinnerCard">
            <div class="info">
                <span class="label">Host:</span>
                <span class="data">{{ dinner.hostName }}</span>
            </div>
            <div class="info">
                <span class="label">Date:</span>
                <span class="data">{{ dinner.date.toLocaleDateString() }}</span>
            </div>
            <div class="info">
                <span class="label">Week number:</span>
                <span class="data">{{ dinner.weekNumber }}</span>
            </div>
        </div>
    </div>
    

</template>



<script lang="ts">
import { defineComponent, ref, onMounted, computed, PropType } from "vue";
import HostedDinners from "@/types/interface/hostedDinners";

export default defineComponent ({
	name: 'reviewPage',
	components: {

	},
    props: {
        dinner: {
            type: Object as PropType<HostedDinners>,
            required: true,
        },
    },

})


</script>

<style>

.container {
    display: flex;
    justify-content: center;
}

.upcomingDinnerCard {
    /* Background color with a subtle gradient */
    background: linear-gradient(to bottom, #ffffff, #f0f0f0);
    width: 80%;
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


</style>