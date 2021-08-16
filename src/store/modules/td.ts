import * as Api from '@/backend/Api';
import { ParsedTd } from '@/backend/TdParser';
import { PossibleInteractionOpsEnum, RESULT_MESSAGES, VtStatus } from '@/util/enums';
import { InteractionStateEnum, TdStateEnum, ProtocolEnum } from '@/util/enums';

export default {
    namespaced: true,
    state: {
        // ===== DYNAMIC STORE STATES ===== //
        tdState: TdStateEnum.NO_TD,
        errorMsg: '',
        statusMessage: Api.updateStatusMessage(TdStateEnum.NO_TD, null, null),

        protocols: [] as ProtocolEnum[],

        tdEditor: {},
        tdParsed: {} as ParsedTd,

        interactionState: null,

        interactions: [],
        selections: [] as WADE.VueInteractionConfig[],
        resultProps: [],
        resultActions: [],
        resultEvents: [],

        logText: "",

        virtualThing: undefined,
        VtExists: false,
        vtOutputStd: '',
        vtOutputErr: '',
        // ===== STATIC STORE STATES ===== //
        tdTabs: [
            {
                tabId: 'editor',
                tabTitle: 'Editor',
                tabStyle: 'tab-container-in-tabbar',
                tabDropdownButton: {
                    btnKey: 'td-editor-upload',
                    btnSrc: 'upload',
                    btnDropdownOptions: [
                        {
                            title: 'Load from url',
                            key: 'td-url',
                            icon: 'url'
                        }
                    ]
                },
                tabButtonStyle: 'tab-btn-right tab-button-container',
                tabLink: '/editor',
                tabIsActive: false
            },
            {
                tabId: 'config',
                tabTitle: 'Config',
                tabStyle: 'tab-container-in-tabbar',
                tabLink: '/config',
                tabIsActive: false
            },
            {
                tabId: 'performance',
                tabTitle: 'Performance',
                tabStyle: 'tab-container-in-tabbar',
                tabLink: '/performance',
                tabIsActive: false
            },
            {
                tabId: 'virtual',
                tabTitle: 'Virtual Thing',
                tabStyle: 'tab-container-in-tabbar',
                tabLink: '/virtual',
                tabIsActive: false
            }
        ],
        tdSelectionBtn: {
            btnClass: 'btn-invoke',
            btnLabel: 'Invoke Interactions',
            btnOnClick: 'invoke-interactions'
        },
        tdResetSelectionsBtn: {
            btnClass: 'btn-reset',
            btnLabel: 'Reset Selections',
            btnOnClick: 'reset-selections'
        },
        tdResultsBtn: {
            btnClass: 'btn-results',
            btnLabel: 'Status: No interaction selected.',
            btnOnClick: '-'
        },
        tdEditorPlaceholder: 'Paste your Thing Description here or press the upload button.'
    },
    actions: {
        /** An action that fetches an TD and updates the status bar if an error occurs
         *
         * @param payload an object that includes the property uri, which is a the string of the URI for the TD resource
         */
        async fetchTD({ commit, state }, payload: {uri: string}) {
            commit('setTdState', TdStateEnum.TD_FETCHING);
            commit('setErrorMsg', null);
            commit('setInteractionState', null);
            commit('setStatusMessage');
            return Api.fetchTD(payload.uri).then(myJson => {
                const td = JSON.stringify(myJson);
                const tdState = TdStateEnum.VALID_TD_FETCHED;
                const errorMsg = null;
                const fetchedTd = {
                  td,
                  tdState,
                  errorMsg
                };
                console.log(fetchedTd);
                commit('setTdState', tdState);
                commit('setErrorMsg', null);
                commit('setInteractionState', null);
                commit('setStatusMessage');
                return fetchedTd;
            })
            .catch( (err) => {
                const tdState = TdStateEnum.INVALID_TD_FETCHED;
                commit('setTdState', tdState);
                commit('setErrorMsg', err);
                commit('setInteractionState', null);
                commit('setStatusMessage');
            });
        },
        async processChangedTd({ commit, state }, payload: any) {
            // Do not consume td when its empty or not in correct format
            if (!payload.td || payload.td.length <= 0) {
                commit('setTdState', payload.tdState ? payload.tdState : TdStateEnum.NO_TD);
                commit('setErrorMsg', payload.errorMsg ? payload.errorMsg : null);
                commit('setInteractionState', null);
                commit('setStatusMessage');
                return;
            }

            commit('setInteractions', []);
            commit('setSelections', []);
            commit('setResults', []);
            commit('setTdEditor', payload.td);

            const parsedTdPayload = await Api.consumeAndParseTd(payload.td, payload.config, payload.protocols);
            let interactionState: InteractionStateEnum | null = null;
            // Store new parsed td
            if (
                parsedTdPayload.tdState === TdStateEnum.VALID_TD
                || parsedTdPayload.tdState === TdStateEnum.VALID_CONSUMED_TD
            ) {
                commit('setTdParsed', parsedTdPayload.parsedTd);
                const hasInteractions = (state.tdParsed as ParsedTd).parsedProperties.length > 0
                    || (state.tdParsed as ParsedTd).parsedActions.length > 0
                    || (state.tdParsed as ParsedTd).parsedEvents.length > 0;
                interactionState = hasInteractions
                    ? InteractionStateEnum.NOT_SELECTED
                    : InteractionStateEnum.NO_INTERACTIONS;
            }

            // Set td status and error message
            commit('setTdState', parsedTdPayload.tdState);
            commit('setErrorMsg', parsedTdPayload.errorMsg);
            commit('setInteractionState', interactionState);
            commit('setStatusMessage');
        },
        // Scan Td for different forms
        setProtocols({ commit }, payload: any) {
            const protocols = Api.retrieveProtocols(payload.td);
            commit('setProtocols', protocols);
        },
        async resetAll({ commit }) {
            // await Api.resetAll();
            commit('setInteractions', []);
            commit('setSelections', []);
            commit('setResults', []);
            commit('setStatusMessage');
            commit('resetLog');
        },
        async resetInteractions({ commit }) {
            commit('setInteractions', []);
        },
        async resetSelections({ commit }) {
            commit('setSelections', []);
            commit('setStatusMessage');
        },
        async resetResults({ commit }) {
            commit('setResults', []);
        },

        // Add new interaction or change interaction input (without changing the order of selected interactions).
        addToSelectedInteractions({ commit, state }: any, payload: {interaction: WADE.VueInteractionConfig}) {
            const selectedInteractions: WADE.VueInteractionConfig[] = state.selections;
            selectedInteractions.push(payload.interaction);
            commit('setSelections', selectedInteractions);
            commit('setStatusMessage');
        },

        updateSelectedInteraction({ commit, state }: any, payload: {index: number, interaction: WADE.VueInteractionConfig}) {
            let selectedInteractions: WADE.VueInteractionConfig[] = state.selections;
            selectedInteractions[payload.index] = payload.interaction;
            commit('setSelections', selectedInteractions);
            commit('setStatusMessage');
        },

        updateSelectedInteractionList({ commit, state }: any, payload: {index: number, list: WADE.VueInteractionConfig[]}) {
            commit('setSelections', payload.list);
            commit('setStatusMessage');
        },
        // async addToSelectedInteractions({ commit, state }: any, payload: { changeInteraction: any; newInteraction: any; }) {
        //     if (!payload.changeInteraction && !payload.newInteraction) return;

        //     const selectedInteractions = state.selections;

        //     const interaction = payload.changeInteraction
        //         ? payload.changeInteraction
        //         : payload.newInteraction ? payload.newInteraction : null;
        //     const index = selectedInteractions.indexOf(interaction);
        //     const isNew = payload.newInteraction ? true : false;

        //     if (isNew) {
        //         // Remove interaction if it already exists
        //         if (index !== -1) selectedInteractions.splice(index, 1);
        //         // Add to selected interactions
        //         selectedInteractions.push(interaction);
        //     } else {
        //         // Replace selected interaction when input changed
        //         selectedInteractions[index] = interaction;
        //     }
        //     commit('setSelections', selectedInteractions);
        //     commit('setStatusMessage');
        //     return selectedInteractions;
        // },
        // Remove specific interaction from interactions to be invoked
        async removeFromSelectedInteractions({ commit, state }, payload: {index: number}) {
            const selectedInteractions: WADE.VueInteractionConfig[] = state.selections;
            selectedInteractions.splice(payload.index, 1);
            commit('setSelections', selectedInteractions);
            commit('setStatusMessage');
            return selectedInteractions;
        },
        // Invoke all selected interaction
        async invokeInteractions({ commit, state }) {
            const selectedInteractions: WADE.VueInteractionConfig[] = state.selections;
            const tdParsed: ParsedTd = state.tdParsed;
            for(let interactionConfig of selectedInteractions) {
                switch(interactionConfig.type) {
                    case 'properties':
                        let property = tdParsed.parsedProperties.find((prop) => prop.interactionName === interactionConfig.name);
                        if(!property) return;
                        switch(interactionConfig.op) {
                            case PossibleInteractionOpsEnum.PROP_READ:
                                commit('addToLog', `Read property ${interactionConfig.name}...`);
                                property.readProperty(interactionConfig.protocol, interactionConfig.uriVariables).then(
                                    (responseObj) => {
                                        if(responseObj.interactionSuccessful) {
                                            let result = responseObj.resultBody;
                                            if(typeof result === 'object') result = JSON.stringify(result);
                                            commit('addToLog', `Read property ${interactionConfig.name} was succesful.`);
                                            commit('addToLog', `read ${interactionConfig.name}: response body:${result}`);
                                            commit('addToLog', `read ${interactionConfig.name}: round trip duration: ${responseObj.timeS} s, ${responseObj.timeMs} ms; payload size: ${responseObj.payloadSize}`);
                                        }
                                        
                                    }
                                )
                                break;
                            case PossibleInteractionOpsEnum.PROP_WRITE:
                                property.writeProperty(interactionConfig.protocol, interactionConfig.input, interactionConfig.uriVariables).then(
                                    (responseObj) => {
                                        if(responseObj.interactionSuccessful) {
                                            commit('addToLog', `Write property ${interactionConfig.name} was succesful.`);
                                            commit('addToLog', `Write ${interactionConfig.name}: round trip duration: ${responseObj.timeS} s, ${responseObj.timeMs} ms`)
                                        }
                                    }
                                );
                                break;
                            case PossibleInteractionOpsEnum.PROP_OBSERVE:
                                property.observeProperty(interactionConfig.protocol, () => {}, interactionConfig.uriVariables)
                                break;
                            case PossibleInteractionOpsEnum.PROP_UNOBSERVE:
                                property.unobserveProperty(interactionConfig.protocol, interactionConfig.uriVariables)
                                break;
                        }
                        break;
                    case 'actions':
                        let action = tdParsed.parsedActions.find((act) => act.interactionName === interactionConfig.name);
                        if(!action) return;
                        action.invokeAction(interactionConfig.protocol, interactionConfig.input, interactionConfig.uriVariables).then(
                            (responseObj) => {
                                let result = responseObj.resultBody;
                                if(typeof result === 'object') result = JSON.stringify(result);
                                commit('addToLog', `Invoke action ${interactionConfig.name} was succesful.`);
                                if(result) commit('addToLog', `invoke ${interactionConfig.name}: response body:${result}`);
                                commit('addToLog', `invoke ${interactionConfig.name}: round trip duration: ${responseObj.timeS} s, ${responseObj.timeMs} ms; payload size: ${responseObj.payloadSize}`);
                            }
                        )
                        break;
                    case 'events':
                        let event = tdParsed.parsedEvents.find((ev) => ev.interactionName === interactionConfig.name);
                        if(!event) return;
                        switch(interactionConfig.op) {
                            case PossibleInteractionOpsEnum.EVENT_SUB:
                                event.subscribeEvent(interactionConfig.protocol, () => {} ,interactionConfig.uriVariables);
                                break;
                            case PossibleInteractionOpsEnum.EVENT_UNSUB:
                                event.unsubscribeEvent(interactionConfig.protocol, interactionConfig.uriVariables);
                                break;
                        }
                        break;
                }
            }
            commit('setInteractionState', InteractionStateEnum.INVOKED);
            commit('setStatusMessage');
            // const results = await Api.invokeInteractions(selectedInteractions);
            // commit('setResultProps', results.resultProps);
            // commit('setResultActions', results.resultActions);
            // commit('setResultEvents', results.resultEvents);
        },
        // Invoke interactions for performance prediction
        async getPerformancePrediction({ commit, state }, payload) {

            // Correct format of selected interactions for timing measurements
            const interactions: Array<{ name: string, type: string, input: any, interaction: any}> = [];

            // Add all timing measurement relevant data of selected interactions
            (state.selections).forEach(selection => {
                interactions.push({
                    name: selection.interactionName,
                    type: selection.interactionType,
                    input: selection.interactionSelectBtn.input,
                    interaction: selection.interactionSelectBtn.interaction
                });
            });

            // Invoke measurement and wait for them to be finished
            return Api.startPerformancePrediction(interactions, payload)
                .then((res) => res)
                .catch((err) => err);
        }
    },
    mutations: {
        setProtocols(state: any, payload: string) {
            state.protocols = payload;
        },
        setErrorMsg(state: any, payload: string) {
            state.errorMsg = payload;
        },
        setTdState(state: any, payload: TdStateEnum | null) {
            state.tdState = payload;
        },
        setInteractionState(state: any, payload: InteractionStateEnum | null) {
            state.interactionState = payload;
        },
        setStatusMessage(state: any) {
            state.statusMessage = Api.updateStatusMessage(state.tdState, state.errorMsg, state.interactionState);
        },

        setTdEditor(state: any, payload: string) {
            if (payload) state.tdEditor = payload;
        },
        setTdParsed(state: any, payload: string) {
            if (payload) state.tdParsed = payload;
        },

        setResults(state: any, payload: any) {
            state.resultProps = payload;
            state.resultActions = payload;
            state.resultEvents = payload;
        },
        setInteractions(state: any, payload: any) {
            state.interactions = payload;
        },
        setSelections(state: any, payload: any) {
            state.selections = payload;
            state.interactionState = Object.entries(payload).length > 0
                ? InteractionStateEnum.NOT_INVOKED
                : InteractionStateEnum.NOT_SELECTED;
        },
        pushToSelections(state: any, payload: any[]) {
            state.selections.push(...payload);
            state.interactionState = Object.entries(payload).length > 0
                ? InteractionStateEnum.NOT_INVOKED
                : InteractionStateEnum.NOT_SELECTED;
        },
        setResultProps(state: any, payload: any) {
            state.resultProps = payload;
        },
        setResultActions(state: any, payload: any) {
            state.resultActions = payload;
        },
        setResultEvents(state: any, payload: any) {
            state.resultEvents = payload;
        },
        setValidTd(state: any, payload: boolean) {
            state.isValidTd = payload;
        },
        setActiveTab(state: any, payload: { tabbarKey: string, activeTab: string}) {
            for (const tab of Object.keys(state[payload.tabbarKey])) {
                const currentTab = state[payload.tabbarKey][tab];
                currentTab.tabIsActive = currentTab.tabId === payload.activeTab;
            }
        },
        addToLog(state: any, statusString: string) {
            let logTemp: string = state.logText;
            state.logText = logTemp.concat('* ', statusString, '\n');;
        },
        resetLog(state: any) {
            state.logText = "";
        }
    },
    getters: {
        getProtocols(state: any) {
            return (id: string) => {
                // TODO: get correct protocol for correct td
                return state.protocols;
            };
        },
        getSelections(state: any) {
            return state.selections;
        },
        getInteractionState(state: any) {
            return state.interactionState;
        },
        isValidTd(state: any) {
            return state.tdState === TdStateEnum.VALID_TD || state.tdState === TdStateEnum.VALID_CONSUMED_TD;
        },
        getStatusMessage(state: any) {
            return state.statusMessage;
        },
        getTdState(state: any) {
            return state.tdState;
        },
        getTdEditor(state: any) {
            return state.jsonTd;
        },
        getTdParsed(state: any) {
            return state.tdParsed;
        },
        areInteractionsInvoked(state: any) {
            return state.areInteractionsInvoked;
        },
        getTdTabbar(state: any) {
            return state.tdTabs;
        },
        getSelectionBtn(state: any) {
            return state.tdSelectionBtn;
        },
        getSelectionResetBtn(state: any) {
            return state.tdResetSelectionsBtn;
        },
        getResultsBtn(state: any) {
            return state.tdResultsBtn;
        },
        getEditorPlaceholder(state: any) {
            return state.tdEditorPlaceholder;
        },
        getSelectedInteractions(state: any) {
            return state.selectedInteractions;
        },
        getResultProps(state: any) {
            return state.resultProps;
        },
        getResultActions(state: any) {
            return state.resultActions;
        },
        getResultEvents(state: any) {
            return state.resultEvents;
        },
        getResultText(state: any) {
            if (!state.isValidTd) {
                return '';
            }
            if (!state.areInteractionsSelected) {
                return RESULT_MESSAGES.NO_INTERACTIONS_SELECTED;
            }
            if (!state.areInteractionsInvoked) {
                return RESULT_MESSAGES.NO_INTERACTIONS_INVOKED;
            }
        },
        getParsedTdPropertiesList(state: any) {
            return (state.tdParsed as ParsedTd).parsedProperties;
        },
        getParsedTdActionsList(state: any) {
            return (state.tdParsed as ParsedTd).parsedActions;
        },
        getParsedTdEventsList(state: any) {
            return (state.tdParsed as ParsedTd).parsedEvents;
        },
        getParsedTdProtocols(state: any) {
            return (state.tdParsed as ParsedTd).availableProtocols;
        },
        getParsedTdOperations(state: any) {
            return (state.tdParsed as ParsedTd).availableOperations;
        },
    }
};
