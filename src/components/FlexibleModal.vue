<template>    
    <transition name="modal-animation">
        <div v-show="modalActive" class="modal" tabindex="-1" role="dialog">
            
                <div class="modal-dialog modal-lg" :style="{'max-width':'640px','width':'80%'}" role="document">
                    <transition name="modal-animation-inner">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h4>{{ modalTitle }}</h4>
                                <img v-if="modalActive"
                                    :src="require(`@/assets/${imgName}.jpeg`)"
                                    alt="Didnt load"
                                    class="miniImage"
                                >
                                <i @click="$emit('close-modal')" type="button" class="far fa-times-circle"></i>
                            </div>
                            <div class="modal-body">
                                <slot />
                            </div>
                            <div class="modal-footer">

                                <div v-if="isDelete" class="actionButtons">
                                    <button @click="$emit('confirm', deleteReviewID)"  type="button" class="btn btn-primary"> {{ buttonAction }} </button>
                                    <button @click="$emit('close-modal')" type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                                </div>

                                <div v-if="isScheduleNext" class="actionButtons">
                                    <button :disabled="!allowSubmit" @click="$emit('confirm-new-dinner', deleteReviewID)"  type="button" class="btn btn-primary"> {{ buttonAction }} </button>
                                    <button @click="$emit('close-modal-schedule')" type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                                </div>

                                <div v-if="isReveal">
                                    <button @click="$emit('mark-as-read', deleteReviewID)"  type="button" class="btn btn-primary"> {{ buttonAction }} </button>
                                    <button @click="$emit('close-modal')" type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                                </div>

                                
                            </div>
                        </div>
                    </transition>
                </div>
        </div>
    </transition>
    


</template>

<script lang="ts">
import { defineComponent, computed} from "vue";

export default defineComponent ({
    name: 'FlexibleModal',

    props: {
        modalActive: {
            type: Boolean,
            required: true
        },
        modalTitle: {
            type: String,
            required: true
        },
        buttonAction: {
            type: String,
            required: false
        },
        deleteReviewID: {
            type: String,
            required: false
        },
        isDelete: Boolean,
        isScheduleNext: Boolean,
        allowSubmit: Boolean,
        isReveal: Boolean,
        imgName: String
    },

    setup(props) {
        const testerFunction = () => {
            console.log(props.isScheduleNext)
        }

        return {
            testerFunction
        }
    },

})
</script>

<style scoped>

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-inner {
  background-color: #fff;
  padding: 20px;
  border: 0px !important;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  position: relative;
}

.modal-title {
  margin-top: 0;
}

.modal-close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
}

.modal-body {
    text-align: start;
}

.actionButtons {
    display: flex;
    gap: 10px;
}

.modal-dialog {
    width: 100% !important;
}

i {
    font-size: 25px;
}

i:hover {
    color: crimson;
    transition: ease-in-out .2s;
}

.modal-animation-enter-active, .modal-animation-leave-active{
    transition: opacity 0.3s cubic-bezier(.52,0.02,0.19,1.2);
}

.modal-animation-enter-from, .modal-animation-leave-to {
    opacity: 0;
}

.modal-animation-inner-enter-active{
    transition: all 0.3s cubic-bezier(.52,0.02,0.19,1.2) 0.15s;
}

.modal-animation-inner-leave-active{
    transition: all 0.3s cubic-bezier(.52,0.02,0.19,1.2);
}

.modal-animation-inner-enter-from {
    opacity: 0;
    transform: scale(.8);
}
.modal-animation-inner-leave-to {
    transform: scale(.8);
}
</style>