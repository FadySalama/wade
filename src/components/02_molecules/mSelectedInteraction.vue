<template>
    <div class = "selected-interaction">
        <div class="selected-interaction-label" :title="selectedInteraction.description ? selectedInteraction.description : null">
            <div class="label-area">
                <div>
                    <label>{{interactionLabel}} {{selectedInteraction.name}}</label>
                </div>
                <div class="info-area" v-if="isInfoMode && !isEditMode">
                    <div>
                        <span>Protocol: {{selectedInteraction.protocol}}</span>
                    </div>
                    <div v-if="Object.values(selectedInteraction.uriVariables.schemas).length > 0">
                        <h5>Uri-Variables</h5>
                        <div v-for="(uriVariable, name) in selectedInteraction.uriVariables.schemas" :key="'selected-'+name+index">
                            {{name}}: {{selectedInteraction.uriVariables.value[name]}}
                        </div>
                    </div>
                    <div v-if="inputSchema=selectedInteraction.input.schema">
                        <h5>Input</h5>
                        {{selectedInteraction.input.value}}
                    </div>
                </div>
            </div>
            <aIconButton v-if="!isEditMode"
                iconBtnSrcPath="arrow_down"
                iconBtnOnClick="view"
                class="icon"
                @icon-btn-clicked="toggleInfoMode()"
            />
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
            <label for="selected-interaction-protocol">Protocol: </label>
            <select name="selected-interaction-protocol" id="selected-interaction-protocol-select" v-model="selectedInteraction.protocol">
                <option v-for="(protocol) in currentProtocols" :key="protocol" :value="protocol"> {{protocol}} </option>
            </select>
            <div class="uri-variables-area" v-if="Object.values(selectedInteraction.uriVariables.schemas).length > 0">
                <h5>Uri-Variables</h5>
                <div v-for="(uriVariable, name) in selectedInteraction.uriVariables.schemas" :key="'selected-'+name+index" class="uri-variables-element">
                    <div>
                    {{ name }}
                    </div>
                    <aInputSchemaElement :inputName="'selected-'+name+index" :inputSchema="uriVariable" v-model="selectedInteraction.uriVariables.value[name]"/>
                </div>
            </div>
            <div class="interaction-input-area" v-if="inputSchema=selectedInteraction.input.schema">
                <h5>Input</h5>
                <div class="interaction-input">
                    <aInputSchemaElement :inputName="selectedInteraction.name + '-input'" :inputSchema="selectedInteraction.input.schema" v-model="selectedInteraction.input.value"/>
                </div>  
            </div>
            <aButtonBasic
            btnLabel="Save changes"
            btnOnClick="save-changes"
            btnClass="btn-basic"
            @save-changes="saveChanges()"
            />
        </div>
    </div>
    
  
</template>

<script lang="ts">
import Vue from 'vue';
import aIconButton from '@/components/01_atoms/aIconButton.vue';
import aButtonBasic from '@/components/01_atoms/aButtonBasic.vue';
import aDropdownButton from '@/components/01_atoms/aDropdownButton.vue';
import aInputSchemaElement from '@/components/01_atoms/aInputSchemaElement.vue';
import { mapActions, mapGetters } from 'vuex';
import { parsedAction, parsedEvent, parsedProperty } from '@/backend/TdParser';
export default Vue.extend({
    components: {
        aButtonBasic,
        aIconButton,
        aDropdownButton,
        aInputSchemaElement
    },
    props: {
        selectedInteractionProp: {
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
            selectedInteraction: JSON.parse(JSON.stringify(this.selectedInteractionProp)),
            isEditMode: false,
            isInfoMode: false,
        }
    },

    methods: {
        ...mapActions('TdStore',['removeFromSelectedInteractions', 'updateSelectedInteraction']),
        toggleEditMode() {
            this.isEditMode = !this.isEditMode;
            if(this.isEditMode) this.isInfoMode = false;
        },
        toggleInfoMode() {
            this.isInfoMode = !this.isInfoMode;
        },
        saveChanges() {
            (this as any).updateSelectedInteraction({index: this.index, interaction: this.selectedInteraction});
            this.toggleEditMode();
        }
    },

    computed: {
        ...mapGetters('TdStore',['getParsedTdPropertiesList', 'getParsedTdActionsList', 'getParsedTdEventsList']),
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
        },
        currentProtocols() {
            let result: string[] = [];
            switch(this.selectedInteraction.type) {
                case "properties":
                    let properties: parsedProperty[] = (this as any).getParsedTdPropertiesList;
                    let neededProp = properties.find((prop) => prop.interactionName === (this as any).selectedInteraction.name);
                    if(neededProp) result = neededProp.availableProtocols;
                    break;
                case "actions":
                    let actions: parsedAction[] = (this as any).getParsedTdActionsList;
                    let neededAction = actions.find((action) => action.interactionName === (this as any).selectedInteraction.name);
                    if(neededAction) result = neededAction.availableProtocols;
                    break;
                case "events":
                    let events: parsedEvent[] = (this as any).getParsedTdEventsList;
                    let neededEvents = events.find((event) => event.interactionName === (this as any).selectedInteraction.name);
                    if(neededEvents) result = neededEvents.availableProtocols;
                    break;
            }
            return result;
        },
    },
    
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

.selected-interaction-label div.label-area {
    flex: 2;
}

.selected-interaction-label .icon {
    height: 50%;
    width: 10%;
    margin: 1pt
}
</style>