<template>
    <div class = "selected-interaction">
        <div class="selected-interaction-label" :title="selectedInteraction.description ? selectedInteraction.description : null">
        <label>{{interactionLabel}} {{selectedInteraction.name}}</label>
        <aIconButton
            iconBtnSrcPath="edit_icon"
            iconBtnOnClick="edit"
            class="icon"
            @icon-btn-clicked="toggleEditMode()"
        />
        <aIconButton
            iconBtnSrcPath="delete"
            iconBtnOnClick="delete"
            class="icon"
            @icon-btn-clicked="removeFromSelectedInteractions({index: index})"
        />
    </div>
    <div v-if="isEditMode">
        <div class="uri-variables-area" v-if="Object.values(selectedInteraction.uriVariables.schemas).length > 0">
            <h6>Uri-Variables</h6>
            <div v-for="(uriVariable, name) in selectedInteraction.uriVariables.schemas" :key="'selected-'+name+index" class="uri-variables-element">
                <div>
                   {{ name }}
                </div>
                <aInputSchemaElement :inputName="'selected-'+name+index" :inputSchema="uriVariable" v-model="selectedInteraction.uriVariables.value[name]"/>
            </div>
        </div>
            <div class="interaction-input-area" v-if="inputSchema=selectedInteraction.input.schema">
                <h3>Inputs</h3>
                <div class="interaction-input">
                    <aInputSchemaElement :inputName="selectedInteraction.name + '-input'" :inputSchema="selectedInteraction.input.schema" v-model="selectedInteraction.input.value"/>
                </div>  
            </div>
        </div>
    </div>
    
  
</template>

<script lang="ts">
import Vue from 'vue';
import AIconButton from '@/components/01_atoms/aIconButton.vue';
import aDropdownButton from '@/components/01_atoms/aDropdownButton.vue';
import aInputSchemaElement from '@/components/01_atoms/aInputSchemaElement.vue';
import { mapActions } from 'vuex';
export default Vue.extend({
    components: {
        AIconButton,
        aDropdownButton,
        aInputSchemaElement
    },
    props: {
        selectedInteraction: {
            type: Object as () => WADE.VueInteractionConfig,
            required: true
        },
        index: {
            type: Number,
            required: true,
        }
    },
    data() {
        return {
            isEditMode: false,
        }
    },

    methods: {
        ...mapActions('TdStore',['removeFromSelectedInteractions']),
        toggleEditMode() {
            this.isEditMode = !this.isEditMode;
        }
    },

    computed: {
        interactionLabel() {
            let result: string = "";
            switch(this.selectedInteraction.op) {
                case "readproperty":
                    result = "Read";
                    break;
                case "writeproperty":
                    result = "Write to"
                    break;
                case "observeproperty":
                    result = "Observe";
                    break;
                case "unobserveproperty":
                    result = "Unobserve";
                    break;
                case "invokeaction":
                    result = "Invoke";
                    break;
                case "subscribeevent":
                    result = "Subscribe to";
                    break;
                case "unsubscribeevent":
                    result = "Unsubscribe from";
                    break;
            }
            return result;
        }
    }
})
</script>

<style>
.selected-interaction-label {
    width: 100%;
    height: 5%;
    display: flex;
    flex-flow: row, nowrap;
    align-content: center;
}

.selected-interaction-label label {
    flex: 2;
}

.selected-interaction-label .icon {
    height: 50%;
    width: 10%;
    margin: 1pt
}
</style>