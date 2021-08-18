<template>
    <div class="results-container">
        <div class="label">
            <h2>Results</h2>
        </div>
        <div v-if="showResultsArea" class="results-area">
            <div class="properties border-bottom-bold selection-area-el">
                <div class="selection-label-container border-bottom"><label>Result Properties</label></div>
                <div class="interaction-container-all">
                    <aResultElement
                        v-for="(element, index) in getResultProps"
                        :key=index
                        :resultType="element.resultType"
                        :resultTitle="element.resultTitle"
                        :resultValue="element.resultValue"
                        :resultError="element.resultError"
                        :resultTime="element.resultTime"
                        :resultSize="element.resultSize"
                    />
                </div>
            </div>

            <div class="actions border-bottom-bold selection-area-el">
                <div class="selection-label-container border-bottom"><label>Actions</label></div>
                <div class="interaction-container-all">
                    <aResultElement
                        v-for="(element, index) in getResultActions"
                        :key=index
                        :resultType="element.resultType"
                        :resultTitle="element.resultTitle"
                        :resultValue="element.resultValue"
                        :resultError="element.resultError"
                        :resultTime="element.resultTime"
                        :resultSize="element.resultSize"
                    />
                </div>
            </div>

            <div class="events selection-area-el">
                <div class="selection-label-container border-bottom"><label>Events</label></div>
                <div class="interaction-container-all">
                    <aResultElement
                        v-for="(element, index) in getResultEvents"
                        :key=index
                        :resultType="element.resultType"
                        :resultTitle="element.resultTitle"
                        :resultValue="element.resultValue"
                        :resultError="element.resultError"
                    />
                </div>
            </div>

        </div>
        <div v-else class="result-messages">
           <p>{{ getResultText }}</p>
        </div>
        <h3>Results log</h3>
        <textarea name="interactionsLog" id="interactionsLog-text-area" rows="25" readonly v-model="logText">
        </textarea>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapActions, mapState } from 'vuex';
import { TdStateEnum, InteractionStateEnum } from '@/util/enums';
import aResultElement from '@/components/01_atoms/aResultElement.vue';

export default Vue.extend({
    name: 'oResults',
    components: {
        aResultElement
    },
    beforeDestroy() {
        (this as any).resetResults();
    },
    computed: {
        ...mapGetters('TdStore', ['getResultsBtn', 'getResultProps',
         'getResultActions', 'getResultEvents', 'getResultText', 'getInteractionState']),
         ...mapState('TdStore', ['logText']),
         showResultsArea() {
            return (this as any).getInteractionState === InteractionStateEnum.INVOKED;
        }
    },
    methods: {
        ...mapActions('TdStore', ['resetResults']),
        scrollDownTextarea() {
            let textarea = document.getElementById("interactionsLog-text-area");
            if(textarea) textarea.scrollTop = textarea.scrollHeight;
        }
    },
    watch: {
        '$route.params.id'(id) {
            (this as any).resetResults();
        },
        'logText' (oldText) {
            let textarea = document.getElementById("interactionsLog-text-area");
            if(textarea) textarea.scrollTop = textarea.scrollHeight;
        }
    },
});
</script>

<style scoped>
#interactionsLog-text-area {
    width: 100%;
    resize: none;
}

div.label {
    height: fit-content;
    background-color: rgb(99, 99, 99);
    box-shadow: 0pt 3pt 3pt -1pt gray;
    margin-bottom: 1%;
}

.results-container {
    height: 100%;
}

.results-area {
    width: 100%;
    height: 84%;
    border: 1px solid #393B3A;
    border-radius: 3px;
}

.selection-area-el {
    width: 100%;
    height: 33.33%;
    padding: 5px 7px 5px 7px;
    overflow: auto;
}

.selection-label-container {
    max-height: 20px;
}

.interaction-container-all {
    width: 100%;
    overflow: auto;
}

.result-messages {
    height: 12%;
}

.result-messages p {
    font-size: 14px;
}

</style>
