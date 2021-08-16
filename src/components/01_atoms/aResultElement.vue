<template>
    <div class="overall-result-container">
        <div class="result-container">
            <div class="result-outcome" :class="{ 'is-subscription' : isSubscription }">
                <div class="result-title"><label>{{ resultTitle }}</label></div>
                <div class="result-values" :class="{ 'error' : resultError }">
                    <label> 
                        {{ isSubscription ? resultValText : resultValue }}
                    </label>
                </div>
            </div>
            <div v-if="isSubscription" class="result-unsubscribe">
                <aButtonBasic
                    v-on:unsubscribe="unsubscribe()"
                    :btnClass="unsubscribed ? unsubscribedBtn.btnClass : unsubscribeBtn.btnClass "
                    :btnLabel="unsubscribed ? unsubscribedBtn.btnLabel : unsubscribeBtn.btnLabel"
                    :btnOnClick="unsubscribeBtn.btnOnClick"
                />
            </div>
        </div>
        <div class="result-timing"> 
            <label>Time: {{ resultTime }}, Size: {{resultSize }}</label>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { PossibleInteractionTypesEnum } from '@/util/enums';
import aButtonBasic from '@/components/01_atoms/aButtonBasic.vue';

export default Vue.extend({
    name: 'aResultElement',
    components: {
        aButtonBasic
    },
    props: {
        resultType: {
            type: String,
            required: true,
        },
        resultTitle: {
            type: String,
            required: true
        },
        resultValue: {
            required: false
        },
        resultError: {
            type: Boolean,
            required: false,
            default: false
        },
        resultTime: {
            type: String,
            required: false,
            default: ''
        },
        resultSize: {
            required: false
        }
    },
    created() {
        
    },
    beforeDestroy() {
        // this.$eventHub.$off('unsubscribe');
        },
    data() {
        return {
            isSubscription: this.resultType === PossibleInteractionTypesEnum.EVENT_SUB,
            resultValText: 'Waiting...',
            resultBuffer: '',
            subscription: null as any,
            unsubscribed: false,
            unsubscribeBtn: {
                btnClass: 'unsubscribe-btn',
                btnLabel: 'Unsubscribe',
                btnOnClick: 'unsubscribe'
            },
            unsubscribedBtn: {
                btnClass: 'unsubscribed-btn',
                btnLabel: 'Unsubscribed'
            }
        };
    },
    methods: {
    }
});
</script>

<style scoped>
.result-container {
    display: flex;
    width: 100%;
    padding-top: 5px;
}

.result-outcome {
    display: flex;
    height: 35px;
    border: 1px solid #393B3A;
    border-radius: 3px;
    background: #939C9E;
    width: 100%;
}

.result-unsubscribe {
    width: 30%;
    height: 35px;
    padding-left: 5px;
}

.is-subscription {
    width: 70%;
}

.result-title {
    width: 50%;
    height: 100%;
    display: flex;
    align-items: center;
    padding-left: 7px;
}

.result-values {
    width: 50%;
    display: flex;
    align-items: center;
    border-left: 1px solid #393B3A;
    padding-left: 7px;
    overflow: auto;
}

.result-values label {
    overflow: auto;
    max-height: 100%;
}

.result-timing label{
    font-size: 12px;
}
</style>
