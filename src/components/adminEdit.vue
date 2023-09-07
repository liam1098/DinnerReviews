<template>
    <router-link class="routerLinks" to="/">Home</router-link>

    <div class="firebaseTest">
        <div class="widthModifier top-buttons">
            <button @click="toggleScheduleModal" class="btn btn-success">Schedule Next Dinner</button>

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

        <h5 :style="{'margin-top':'20px'}">Upcoming schedule page or something maybe</h5>

        <FlexibleModal :modalActive="modalActive" @close-modal="toggleModal" :buttonAction="modalButtonAction" :modalTitle="modalTitle"
            :deleteReviewID="deleteReviewID" :isDelete="isDelete"
            @confirm="deleteRating">
            <div class="modal-configurable">
            </div>
        </FlexibleModal>

        <!-- Modal devoted to inputting the date and cook for the next dinner. As well as the week number -->
        <FlexibleModal :modalActive="scheduleActive" @close-modal-schedule="toggleScheduleModal" @confirm-new-dinner="confirmNextDinner"
        :buttonAction="scheduleButtonConfirm" :modalTitle="modalTitleSchedule" :isScheduleNext="isScheduleNext" :allowSubmit="allowSubmit"
        >
            <div class="modal-configurable">
                <label for="userSelect" class="col-form-label labels">The chef will be:</label>
                <div class="input-container memberSelectionAndImage">
                    <select v-model="selectedMember" class="form-select inputs photoInput">
                        <option value="" disabled>Select a member</option>
                        <option v-for="member in members" :key="member.id" :value="member.name">
                            {{ member.name }}
                        </option>
                    </select>
                    <div v-if="selectedMember" class="image-container">
                        <img :src="require(`@/assets/${imgName}.jpeg`)" alt="Didnt load" class="miniImage">
                    </div>
                </div>

                <div class="col-form-label labels seasonDiv">
                    Season: <span class="seasonStyling">{{ activeSeason }}</span>
                </div>

                <div v-if="selectedMember" class="weekNumber">
                    <div class="input-container weekInput">
                        <label for="weekNumberInput" class="col-form-label labels">Select a week number:</label>
                        <input v-model.number="selectedWeekNumber" type="number" class="form-control numInputs" id="weekNumberInput">
                    </div>
                </div>

                <div v-if="selectedWeekNumber" class="dateInput">
                    <label for="dateInput" class="col-form-label labels">Select a date:</label>
                    <div class="input-container dateInput">
                        <input v-model="selectedDate" type="date" class="form-control inputs" id="dateInput">
                    </div>
                </div>
                <div v-if="errorOccurred">Something probably went wrong with the date on this submission attempt</div>
                <div v-if="showScheduleMsg">{{ scheduleMsg }}</div> 
            </div>
        </FlexibleModal>

        <div v-for="review in reviews" :key="review.id">
            <!-- <reviewCards @delete-review="deleteRating(review.id)" :review="review"/> -->
            <reviewCards @delete-review="toggleModal(review.id)" :review="review"/>
        </div>

        <div class="addDeleteMembersCard">
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
    Timestamp } from "firebase/firestore";
import { db } from '@/firebase'
import reviewCards from "./reviewCards.vue";
import FlexibleModal from "./FlexibleModal.vue";
import Season from "@/types/interface/season";
import HostedDinnersReveal from "@/types/interface/hostedDinnersReveal";
import HostedDinners from "@/types/interface/hostedDinners";
// Firebase ref
const membersCollectionRef = collection(db, 'members')
const membersReviewRef = collection(db, 'ratings')
const hostedDinnersRef = collection(db, 'hostedDinners')
const seasonsRef = collection(db, 'seasons')

// Queries
// let reviewCollectionQuery = query(membersReviewRef, orderBy('date', 'desc'), limit(6))


export default defineComponent ({
	name: 'adminEdit',
	components: {
        reviewCards,
        FlexibleModal
	},
	setup() {
    let members = ref<Members[]>([])
    let reviews = ref<Reviews[]>([])
    let seasons = ref<Season[]>([])
    let hostedDinners = ref<HostedDinners[]>([])

    const modalActive = ref<boolean>(false)
    const scheduleActive = ref<boolean>(false)
    const showScheduleMsg = ref<boolean>(false)
    const scheduleMsg = ref<string>('')

    const isDelete = ref<boolean>(false)

    const nameInput = ref('')
    const modalTitle = 'Are you sure you want to delete this review?'
    const modalTitleSchedule = 'Enter the dates and chef for the next dinner'
    const modalButtonAction = 'Confirm deletion'

    const scheduleButtonConfirm = 'Confirm Dinner'
    const deleteReviewID = ref('')

    const selectedMember = ref<string | null>(null);
    
    const selectedDate = ref<Date | null>()
    const selectedWeekNumber = ref<number | null>(null);

    const errorOccurred = ref<boolean>(false)


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
    // Returns the imgName of the selected host as changes are made so its reactive
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
    const activeSeason = computed(() => {
        let active = seasons.value.find((season) => season.active == true)
        if (active) {
            return active.seasonNumber
        } else {
            return 0
        }
		
	})

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
                date: doc.data().date.toDate(),
                weekNumber: doc.data().weekNumber
                };
                localReviews.push(review);
            });
            reviews.value = localReviews;
        });
    };
    const fetchSeasons = () => {
        onSnapshot(seasonsRef, (querySnapshot) => {
            let localSeason: Season[] = [];
            querySnapshot.forEach((doc) => {
                const season: Season = {
                id: doc.id,
                seasonNumber: doc.data().seasonNumber,
                active: doc.data().active
                };
                localSeason.push(season);
            });
            seasons.value = localSeason;
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
            isDelete.value = true
        } else {
            isDelete.value = false
        }
    }
    const toggleScheduleModal = () => {
        scheduleActive.value = !scheduleActive.value;
        if (scheduleActive.value) {
            fetchSeasons();
        } else {
            // should reset all of the inputs contained within this modal
            selectedMember.value = null;
            selectedDate.value = null
            selectedWeekNumber.value = null;
        }
    }

    const isScheduleNext = computed(() => {
        if (scheduleActive.value) {
            return true
        } else {
            return false
        }
    })

    const testerFunction = () => {
        console.log(isScheduleNext.value)
    }

    
    const isNewMemberFieldEmpty = computed<boolean>(() => {
    // Check if nameInput is empty
    if (nameInput.value.trim() === '') {
        return true;
    }else {
        return false;
    }
    });

    const allowSubmit = computed(() => {
        if (selectedDate.value) {
            return true
        } else return false
    })

    const crossCheckSchedule = (scheduleNext : HostedDinners) => {
        console.log(scheduleNext)
        // Make sure there arent any duplicate week numbers used mostly. Or incase someone has already had a host this season.
        let duplicate = hostedDinners.value.find((dinner) => dinner.weekNumber == scheduleNext.weekNumber)
        let hostDoubleUp = hostedDinners.value.find((dinner) => dinner.hostName == scheduleNext.hostName)
        // if the variables above are undefined then there are no week duplicates or houst double ups
        if (duplicate !== undefined) {
            // This means that week has already been scheduled
            return {
                alreadyTaken: false,
                message: `Week has alread been scheduled by ${duplicate?.hostName}`
            } 
        } else if (hostDoubleUp !== undefined){
            return {
                alreadyTaken: false,
                message: `${hostDoubleUp?.hostName} has already had a turn this season `
            } 
        } else {
            return {
                alreadyTaken: true,
                message: `This week is valid to schedule`
            } 
        }
    }

    const  confirmNextDinner = async () => {
        const toTimestamp = (dueDateString : Date) => {
			const backToDate = new Date(dueDateString)
			return Timestamp.fromDate(backToDate)
		}
        let confirmationCheckStatus = {
            alreadyTaken: true,
            message: ''
        }
        // Call function to cross check existing entries
        if (selectedMember.value !== null && selectedWeekNumber.value !== null && selectedDate.value !== undefined && selectedDate.value !== null) {
            let hostedObject : HostedDinners = {
                id: '5',
                hostName: selectedMember.value,
                weekNumber: selectedWeekNumber.value,
                date: selectedDate.value as Date,
                season: activeSeason.value
            }
            confirmationCheckStatus = crossCheckSchedule(hostedObject)
            console.log('confirmationCheckStatus:', confirmationCheckStatus)
        } else {
            console.log('Input have not been filled out properly')

        }

        
        if (confirmationCheckStatus.alreadyTaken) {
            try {
                addDoc(hostedDinnersRef, {
                hostName: selectedMember.value,
                weekNumber: selectedWeekNumber.value,
                date: toTimestamp(selectedDate.value!)
                })
                toggleScheduleModal()

            } catch (err) {
                console.error('Something went wrong with the submission',err)
            }
        } else {
            console.log("Not able to schedule this dinner as this week was already taken")
            showScheduleMsg.value = true
            scheduleMsg.value = confirmationCheckStatus.message
        }
        

        
    }

    onMounted(() => {
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
        })
        onSnapshot(hostedDinnersRef, (querySnapshot) => {
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
        })

        fetchReviews();

    })
    watch(selectedOption, () => {
        fetchReviews();
    })

	return {
        members,
        seasons,
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
        deleteReviewID,
        scheduleActive,
        toggleScheduleModal,
        scheduleButtonConfirm,
        modalTitleSchedule,
        selectedMember,
        selectedDate,
        selectedWeekNumber,
        isDelete,
        isScheduleNext,
        testerFunction,
        allowSubmit,
        errorOccurred,
        confirmNextDinner,
        imgName,
        activeSeason,
        showScheduleMsg,
        scheduleMsg

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
.top-buttons {
    display: flex;
    justify-content: space-between;
    max-width: 85%;
    margin: 0 auto;
}


.nameandbutton {
    display: flex;
    justify-content: space-between;
    margin: 10px auto;
    max-width: 80%;
}

.addDeleteMembersCard {
    max-width: 85%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 0 auto;
    border: 1px solid rgb(197, 197, 197);
    border-radius: 16px;
    background-color: #ffffff;
    border-radius: 10px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
    padding: 10px 10px;
    margin-bottom: 20px;
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

.photoInput{
    max-width: 240px;
}

.miniImage {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.seasonDiv {
    width: 240px;
    display: flex;
    justify-content: space-between;
}
.seasonStyling{
    color: black;
    border: 1px solid #dee2e6;
    padding: 0.375rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.weekInput {
    max-width: 240px;
    display: flex;
    justify-content: flex-end; /* Move content to the right */
    align-items: center; /* Center content vertically */
}
.numInputs {
    width: 15%;
    text-align: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.dateInput {
    max-width: 240px;
}
</style>
