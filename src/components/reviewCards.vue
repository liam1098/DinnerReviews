<template>
    <div class="firebaseTest">
        <div class="reviews">
                <div class="reviewCards" :style="{ borderColor: cardBackgroundColour}">
                    <!-- <div class="emptySpace"></div> -->
                    <i class="material-icons deleteButton" @click="deleteTask"  style="font-size:36px;color:red">delete</i>
                    <div class="reviewInfo">
                        <div v-if="review.name" class="memberNames"><span :style="{'font-weight':'bolder'}">Reviewer: </span>{{review.name}}</div>
                        <div v-if="review.cook" class="memberNames"><span :style="{'font-weight':'bolder'}">Cook: </span>{{review.cook}}</div>
                        <div v-if="review.entreeRating" class="memberNames" :style="{ color: entreeTextColour}"><span :style="{'font-weight':'bolder'}">Entree rating (X/10): </span>{{review.entreeRating}}</div>
                        <div v-if="review.mainRating" class="memberNames" :style="{ color: mainTextColour}"><span :style="{'font-weight':'bolder'}">Main (X/10): </span>{{review.mainRating}}</div>
                        <div v-if="review.dessertRating" class="memberNames" :style="{ color: dessertTextColour}"><span :style="{'font-weight':'bolder'}">Dessert (X/10): </span>{{review.dessertRating}}</div>
                        <div v-if="review.date" class="memberNames"><span :style="{'font-weight':'bolder'}">Date reviewed: </span>{{review.date.toLocaleString('en-AU')}}</div>
                        <div v-if="review.weekNumber" class="memberNames"><span :style="{'font-weight':'bolder'}">Week Number: </span>{{review.weekNumber}}</div>
                    </div>
                    
                </div> 
        </div>
    </div>
</template>


<script lang="ts">
import { defineComponent, ref, onMounted, computed, PropType } from "vue";

import Members from "@/types/interface/members"
import Reviews from "@/types/interface/reviews"
import { collection } from "firebase/firestore";
import { db } from '@/firebase'

// Firebase ref
// const membersCollectionRef = collection(db, 'members')
// const membersReviewRef = collection(db, 'ratings')


export default defineComponent ({
	name: 'reviewCards',
	components: {

	},
    props: {
        review: {
            type: Object as PropType<Reviews>,
            required: true,
        },
    },
	setup(props, context) {
    let members = ref<Members[]>([])
    
    const cardBackgroundColour = computed<string>(() => {
        const ratingTotal = props.review.entreeRating + props.review.mainRating + props.review.dessertRating;
        return mapRatingToColor(ratingTotal);
    });

    const entreeTextColour = computed<string>(() => {
        return mapRatingToColor(props.review.entreeRating);
    });

    const mainTextColour = computed<string>(() => {
        return mapRatingToColor(props.review.mainRating);
    });

    const dessertTextColour = computed<string>(() => {
        return mapRatingToColor(props.review.dessertRating);
    });

    function mapRatingToColor(rating: number): string {
        if (rating >= 1 && rating <= 3) {
            return 'red';
        } else if (rating >= 4 && rating <= 6) {
            return 'orange';
        } else if (rating >= 7 && rating <= 10) {
            return 'green';
        } else {
            return 'white';
        }
    }

    function deleteTask() {
        context.emit('delete-review')
    }


    const deleteReview = () => {
        console.log("yeah button is working just fine")
    }

    return {
        cardBackgroundColour,
        deleteReview,
        deleteTask,
        entreeTextColour,
        mainTextColour,
        dessertTextColour,
        mapRatingToColor
    }

	
	}

})


</script>

<style>


.reviews {
    max-width: 85%;
    margin: 0 auto;
    margin-top: 20px;
    
}
.reviewCards {
    display: flex;
    flex-direction: column;
    border: 1px solid rgb(197, 197, 197);
    border-radius: 16px;
    background-color: #ffffff;
    border-radius: 10px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
    padding: 10px 10px;
    margin-top: 20px;
    margin-bottom: 20px;
}

.deleteButton {
    margin-left: auto;
    z-index: 1;
}

.reviewInfo {
    margin-top: -30px;
}

.deleteButton:hover {
    cursor: pointer;
}
</style>
