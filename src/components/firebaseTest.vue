<template>
    <div class="firebaseTest">
        <div class="d-flex justify-content-end widthModifier">
            <div>
                <div class="btn-group">
                    <button type="button" class="btn btn-info dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                        {{ selectedOption }}
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li v-for="option in Object.values(sortOptions)" :key="option">
                            <a class="dropdown-item" @click="selectOption(option)">{{ option }}</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <FlexibleModal :modalActive="modalActive" @close-modal="toggleModal" :buttonAction="modalButtonAction" :modalTitle="modalTitle"
            :deleteReviewID="deleteReviewID"
            @confirm="deleteRating">
            <div class="modal-configurable">

            </div>
        </FlexibleModal>

        <div v-for="review in reviews" :key="review.id">
            <!-- <reviewCards @delete-review="deleteRating(review.id)" :review="review"/> -->
            <reviewCards @delete-review="toggleModal(review.id)" :review="review"/>
        </div>

        <div class="form">
            <form @submit.prevent id="myForm">
                <div class="form-group">
                    <label for="name">Add a member:</label>
                    <input v-model="nameInput" type="text" :style="{'max-width': '80%'}" class="form-control" id="name" name="name" required>
                </div>
                <!-- add an are you sure as well as some sort of disabled check to prevent adding nothing -->
                <button @click="addMember()" type="submit" class="btn btn-primary"
                :disabled="isNewMemberFieldEmpty">
                Submit</button>
            </form>
        </div>
        <div class="members">
            <div v-for="member in members" :key="member.id">
                <div class="nameandbutton">
                    <div class="emptySpace"></div>
                    <div class="memberNames">{{member.name}}</div>
                    <button @click="deleteMembers(member.id)" type="button" class="btn btn-danger">
                        Delete
                    </button>
                </div>
                
            </div>
        </div>
    </div>
</template>


<script lang="ts">
import { defineComponent, ref, onMounted, computed, watch } from "vue";

import Members from "@/types/interface/members"
import Reviews from "@/types/interface/reviews"
import { SortOptions } from '@/types/interface/enums'; // Import the enum
import { QuerySnapshot, collection, 
    getDocs, onSnapshot, addDoc, 
    deleteDoc, doc, 
    orderBy, query, limit, where,
    serverTimestamp,
Timestamp} from "firebase/firestore";
import { db } from '@/firebase'
import reviewCards from "./reviewCards.vue";
import FlexibleModal from "./FlexibleModal.vue";
// Firebase ref
const membersCollectionRef = collection(db, 'members')
const membersReviewRef = collection(db, 'ratings')

// Queries
// let reviewCollectionQuery = query(membersReviewRef, orderBy('date', 'desc'), limit(6))


export default defineComponent ({
	name: 'firebaseTest',
	components: {
        reviewCards,
        FlexibleModal
	},
	setup() {
    let members = ref<Members[]>([])
    let reviews = ref<Reviews[]>([])

    const modalActive = ref<boolean>(false)

    const nameInput = ref('')
    const modalTitle = 'Are you sure you want to delete this review?'
    const modalButtonAction = 'Confirm deletion'
    const deleteReviewID = ref('')
    


    const sortOptions = Object.values(SortOptions); // Use the imported enum here

    const selectedOption = ref(SortOptions.MostRecent);

    const selectOption = (option: SortOptions) => {
        selectedOption.value = option;
        console.log(selectedOption.value)
    }

    const reviewCollectionQuery = computed(() => {
        const today = new Date(); // Get the current date
        today.setHours(0, 0, 0, 0); // Set time to midnight for accurate comparison
        switch (selectedOption.value) {
            case SortOptions.MostRecent:
                return query(membersReviewRef, orderBy('date', 'desc'), limit(6));
            case SortOptions.Today:
                return query(membersReviewRef, where('date', '>=', Timestamp.fromDate(today)), limit(6));
            case SortOptions.Cook:
                // Modify the query for Cook sorting
                return query(membersReviewRef, orderBy('cook', 'desc'), limit(3)); // For example, sort by 'cook' in ascending order
            case SortOptions.Rating:
                // Modify the query for Rating sorting
                return query(membersReviewRef, orderBy('rating', 'desc'), limit(6)); // Sort by 'rating' in descending order
            default:
                return query(membersReviewRef, orderBy('date', 'desc'), limit(6)); // Fallback option

        }
    });

    const fetchReviews = () => {
        onSnapshot(reviewCollectionQuery.value, (querySnapshot) => {
            let localReviews: Reviews[] = [];
            querySnapshot.forEach((doc) => {
                const review: Reviews = {
                id: doc.id,
                name: doc.data().name,
                cook: doc.data().cook,
                entreeRating: doc.data().entreeRating,
                mainRating: doc.data().mainRating,
                dessertRating: doc.data().dessertRating,
                date: doc.data().date
                };
                localReviews.push(review);
            });
            reviews.value = localReviews;
        });
    };

    const addMember = () => {
        addDoc(membersCollectionRef, {
            name: nameInput.value
        })
        nameInput.value = ''
    }

    const deleteMembers = (id : string) => {
        deleteDoc(doc(membersCollectionRef, id))
    }

    const deleteRating = (id : string) => {
        deleteDoc(doc(membersReviewRef, id))
        toggleModal('')
        
    }

    const toggleModal = (id : string) => {
        modalActive.value = !modalActive.value;
        if (modalActive.value) {
            deleteReviewID.value = id
        }
    }

    
    const isNewMemberFieldEmpty = computed<boolean>(() => {
    // Check if nameInput is empty
    if (nameInput.value.trim() === '') {
        return true;
    }else {
        return false;
    }
    });

    

    
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

        // onSnapshot(reviewCollectionQuery.value, (querySnapshot) => {
        //     let localReviews: Reviews[] = []
        //     querySnapshot.forEach((doc) => {
        //         const review: Reviews = {
        //             id: doc.id,
        //             name: doc.data().name,
        //             cook: doc.data().cook,
        //             rating: doc.data().rating,
        //             date: doc.data().date
        //         }
        //         // Convert the timestamp to something more helpful
        //         // review.date = new Date(review.date.seconds*1000)
        //         localReviews.push(review)
        //     })
        //     reviews.value = localReviews
        // })
        fetchReviews();

    })
    watch(selectedOption, () => {
        fetchReviews();
    })

	return {
        members,
        nameInput,
        addMember,
        deleteMembers,
        reviews,
        isNewMemberFieldEmpty,
        selectedOption,
        selectOption,
        sortOptions,
        deleteRating,
        modalActive,
        modalTitle,
        toggleModal,
        modalButtonAction,
        deleteReviewID

	}
	}

})


</script>

<style>

.firebaseTest {
    max-width: 384px;
    margin: 0 auto;
    margin-top: 20px;
    margin-bottom: 20px;
}
.widthModifier {
    max-width: 90%;
}


.nameandbutton {
    display: flex;
    justify-content: space-between;
    margin: 10px auto;
    max-width: 80%;
}


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
</style>
