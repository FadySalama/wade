import Vue, { VNode } from 'vue';
import { PossibleInteractionOpsEnum, ProtocolEnum, VtStatus } from './util/enums';


declare global {
  namespace JSX {
    // tslint:disable no-empty-interface
    interface Element extends VNode { }
    // tslint:disable no-empty-interface
    interface ElementClass extends Vue { }
    interface IntrinsicElements {
      [elem: string]: any;
    }
  }

  namespace WADE {

// =============================================================================
// ----------------------------------- Enums -----------------------------------
// =============================================================================
    enum ConfidenceLevel {
      EIGHTY_PERCENT = 80,
      EIGHTY_FIVE_PERCENT = 85,
      NINETY_PERCENT = 90,
      NINETY_FIVE_PERCENT = 95,
      NINETY_NINE_PERCENT = 99,
      NINETY_NINE_POINT_FIVE_PERCENT = 99.5,
      NINETY_NINE_POINT_NINE_PERCENT = 99.9
    }

    enum ConfidenceFactor {
      EIGHTY_PERCENT = 1.282,
      EIGHTY_FIVE_PERCENT = 1.440,
      NINETY_PERCENT = 1.645,
      NINETY_FIVE_PERCENT = 1.960,
      NINETY_NINE_PERCENT = 2.576,
      NINETY_NINE_POINT_FIVE_PERCENT = 2.807,
      NINETY_NINE_POINT_NINE_PERCENT = 3.291
    }

    enum DelayTypeEnum {
      NO_DELAY = 'No Delay',
      BEFORE_EACH = 'Delay before each',
      BEFORE_BEGIN = 'Delay before beginning'
    }

    enum MeasurementTypeEnum {
      NUM_RUNS = 'Iteration',
      DURATION_RUN = 'Duration',
      NUM_CLIENTS_NUM_RUN = 'Multiple Clients with iterations',
      NUM_CLIENTS_DURATION_RUN = 'Multiple Clients with duration',
    }

    enum AvailablePropertyDataTypesEnum {
      STRING = 'string',
      NUMBER = 'number',
      BOOLEAN = 'boolean'
    }

    enum ElementTypeEnum {
      FOLDER = 'folder',
      TD = 'td',
      MASHUP = 'mashup'
    }

    enum InteractionAffordancesTypes {
      PROP = 'property',
      ACTION = 'action',
      EVENT = 'event',
    }

    enum PossibleInteractionTypesEnum {
      PROP_READ = 'property-read',
      PROP_WRITE = 'property-write',
      PROP_OBSERVE_READ = 'property-observe-read',
      PROP_OBSERVE_WRITE = 'property-observe-write',
      ACTION = 'action-invoke',
      EVENT_SUB = 'event-subscribe',
      EVENT_UNSUB = 'event-unsubscribe'
    }

    enum DataSchemaTypes {
      ARRAY = 'array',
      BOOL = 'boolean',
      INT = 'integer',
      NUM = 'number',
      OBJ = 'object',
      STRING = 'string',
      NULL = 'null',
      UNDEF = 'undefined'
    }

// =============================================================================
// ------------------ Interaction-Timing-Vocabulary interfaces -----------------
// =============================================================================

    interface InteractionTimingMeasurementContextElement {
      repetitions: number;
      duration: number;
      measurement: {
          type: WADE.MeasurementTypeEnum,
          amount: number
      };
      delay: {
          type: WADE.DelayTypeEnum,
          duration: number | null
      };
      input?: {
          size: string,
          value: any
      };
      output?: Array<{size: string, value: any, amount: number}>;
  }

  interface InteractionTimingAET {
      AET: number | undefined;
      confidenceIntervalMin: number;
      confidenceIntervalMax: number;
  }

  interface InteractionTimingConfidence {
      level: WADE.ConfidenceLevel;
      factor: WADE.ConfidenceFactor;
      numMeasurments: {
        realistic: number,
        possible: number
      };
  }

  interface InteractionTimingTimeBounds {
      firstMeasured: number;
      BCET: number | undefined;
      WCET: number | undefined;
      AET: InteractionTimingAET;
  }


  interface InteractionTimingStaticTiming {
      measurementContext: Array<InteractionTimingMeasurementContextElement | string>;

  }

  interface InteractionTimingDynamicTiming {
      type?: string; // only for properties to differentiate between read/write
      measurementContext: InteractionTimingMeasurementContextElement | string;
      possible: InteractionTimingTimeBounds;
      realistic: InteractionTimingTimeBounds;
      confidence: InteractionTimingConfidence;
  }

  // =============================================================================
  // ---------------------- Front-end objects and interfaces ---------------------
  // =============================================================================

    interface MonacoDiagnosticOptions {
      modelUri: string
      schema: "td-schema" | object
    }

    interface VueInteractionConfig {
      name: string,
      type: "properties" | "actions" | "events",
      protocol: ProtocolEnum,
      op: PossibleInteractionOpsEnum,
      uriVariables?: {[key: string]: any},
      input?: any,
      repetitionType?: "iterations" | "duration",
      delayType?: "once" | "beforeEach",
      delay?: number //in ms
    }
    interface TdDataSchemaInterface {
      type: DataSchemaTypes;
      enum?: any[];
      const?: any;
      oneof?: TdDataSchemaInterface[];
      format?: string
      readOnly: boolean;
      writeOnly: boolean;
      [key: string]: any;
    }
    interface TdArraySchemaInterface extends TdDataSchemaInterface {
      type: DataSchemaTypes.ARRAY;
      items?: TdDataSchemaInterface | TdDataSchemaInterface[];
      minItems?: number;
      maxItems?: number;
    }

    interface TdBooleanSchemaInterface extends TdDataSchemaInterface {
      type: DataSchemaTypes.BOOL;
    }

    interface TdNumberSchemaInterface extends TdDataSchemaInterface {
      type: DataSchemaTypes.NUM;
      minimum?: number;
      exclusiveMinimum?: number;
      maximum?: number;
      exclusiveMaximum?: number;
      multipleOf?: number;
    }

    interface TdIntegerSchemaInterface extends TdDataSchemaInterface {
      type: DataSchemaTypes.INT;
      minimum?: number;
      exclusiveMinimum?: number;
      maximum?: number;
      exclusiveMaximum?: number;
      multipleOf?: number;

    }

    interface TdObjectSchemaInterface extends TdDataSchemaInterface {
      type: DataSchemaTypes.OBJ;
      properties?: {[key: string]: TdDataSchemaInterface};
      required?: string[];
    }

    interface TdStringSchemaInterface extends TdDataSchemaInterface {
      type: DataSchemaTypes.STRING;
      minLength?: number;
      maxLength?: number;
      pattern?: string
    }

    interface TdNullSchemaInterface extends TdDataSchemaInterface {
      type: DataSchemaTypes.NULL;
    }
    interface TdFormInterface {
      op: string | string[];
      href: string;
      [key: string]: any;
    }
    interface TdInteractionInterface {
      interactionName: string;
      description?: string;
      interactionType: InteractionAffordancesTypes;
      forms: TdFormInterface[];
      uriVariables?: {[key: string]: TdDataSchemaInterface};
      base?: string;
    }

    interface TdPropertyInteractionInterface extends TdInteractionInterface, TdDataSchemaInterface {
      observable?: boolean;
    }

    interface TdActionInteractionInterface extends TdInteractionInterface {
      input?: TdDataSchemaInterface;
      output?: TdDataSchemaInterface;
      safe: boolean;
      idempotent: boolean;
    }

    interface TdEventInteractionInterface extends TdInteractionInterface {
      subscription?: TdDataSchemaInterface;
      data?: TdDataSchemaInterface;
      cancellation?: TdDataSchemaInterface;
    }

    interface MqttConfigInterface {
      broker: string;
      username: string | undefined;
      password: string | undefined;
      clientId: string | undefined;
    }

    interface ModalAddElementInterface {
      type: string;
      src: string;
      title: string;
      forms: ModalAddElementFormItem[];
      parentId?: string | null;
    }

    interface ModalAddElementFormItem {
      key: string;
      title: string;
      placeholder: string;
      value: string;
      required: boolean;
    }
  /**
   * Element that was added via modal and is now stored to sidebar store.
   */
    interface NewStoreElementInterface {
      type: ElementTypeEnum;
      title: string;
      description?: string;
      id: string;
      parentId: string;
    }
    interface ChildlessElementInterface extends NewStoreElementInterface {
      readonly hasChildren: false;
    }
    interface ParentElementInterface extends NewStoreElementInterface {
      readonly hasChildren: true;
      description: string;
      children: Array<ChildlessElementInterface|ParentElementInterface>;
    }
    interface TDElementInterface extends ChildlessElementInterface {
      type: ElementTypeEnum.TD;
      content: string;
      config: object;
      vconfig: object;
      virtualthing: {
        status: VtStatus
        outMsg: [],
        vt: undefined // not necessary, but used to remember that property is used
      };
    }
    interface MashupElementInterface extends ParentElementInterface {
      type: ElementTypeEnum.MASHUP;
      systemDescription: string | undefined;
      mashupCode: string | undefined;
      children: Array<TDElementInterface | MashupElementInterface>;
    }
    interface FolderElementInterface extends ParentElementInterface {
      type: ElementTypeEnum.FOLDER;
      children: Array<TDElementInterface | MashupElementInterface | FolderElementInterface>;
    }
    /**
     * The outcome fields of a basic formfield
     */
    interface BasicFormFieldOutputInterface {
      // Key which indicates the meaning of formfield
      key: string;
      // The value of the user's input
      input: string;
      // Is true when the input is empty or violates the rules of the formfield which has the type BasicFormField
      hasError: boolean;
      hasDuplicateError: boolean;
    }
    interface BasicFormFieldInterface {
      key: string;
      title: string;
      placeholder: string;
      value: string;
      isRequired: boolean;
      mustBeUnique?: boolean;
      rules?: {
        minChars: number,
        maxChars: number,
        exludedChars?: string[],
        errorMessage?: string,
        errorMessageDuplicate?: string
      };
    }

    interface AIconButtonInterface {
      // Path of icon source to be displayed
      iconBtnSrcPath: string;
      // Defines button action
      iconBtnOnClick: string;
      // Optional label below icon
      iconBtnLabel?: string;
      // Show button only when hovered
      iconBtnShowOnlyOnHover?: boolean;
    }

    interface ADropdowButtonInterface {
      // Optional label of the button to be displayed
      btnLabel?: string;
      // The key should explain the main purpose of the button.
      // Use kebap-case. E.g. "property-invoke" or "td-upload"
      btnKey: string;
      // Source path for the button's icon.
      btnSrc?: string;
      // A list of all options for the dropdown.
      btnDropdownOptions: DropdownOptionInterface[];
    }

    interface DropdownOptionInterface {
      title: string;
      key: string;
      // Image path for icon
      icon?: string;
      style?: string;
      selectable?: boolean;
      editable?: boolean;
      type?: AvailablePropertyDataTypesEnum;
      inputValue?: undefined | null | string | number; // TODO: get all available input
    }
    /**
     * A interface for a list
     * @property header
     * @property items
     */
    interface ListInterface {
      header: string;
      items: Array<{label: string; payload?: any; }>;

    }
    /**
     * A interface for tables
     * @property columns
     */
    interface TableInterface {
      columns: ListInterface[];
    }

    interface SidebarElement {
      // Title to be shown in the sidebar
      title: string;
      // Id to identify the associated data
      id: string;
      // Type of the element
      type: ElementTypeEnum;
      // Icon path
      iconSrcPath: string | any;
      // Has this element any children
      hasChildren?: boolean;
      // Array of Elements. A TD can't have any children.
      children?: SidebarElement[];
      // If element is td
      td?: object;
      // If element is folder
      folder?: object;
      // If element is mashup
      mashup?: object;
      // Optional string for element style
      styleCss?: string;
      // Shows how deeply an element is nested for displaying purposes
      numOfParents: number;
      // Should the children be visible in UI
      showChildren: boolean;
    }

    interface TabbarElementInterface {
      // To reference tab when clicked.
      tabId: string;
      // Label for tab.
      tabTitle?: string;
      // When tab needs special styling.
      tabStyle?: string;
      // When tab should display a icon button.
      tabIconButton?: AIconButtonInterface;
      // When tab should display a icon button.
      tabDropdownButton?: ADropdowButtonInterface;
      // When button should be left or right.
      tabButtonStyle?: string;
      // If tab is router link.
      tabLink?: string;
      // If tab is active / should have indication to be active.
      tabIsActive?: boolean;
      iconSrcPath?: string;
    }

    interface PerformanceInteraction {
      // Name of interaction, e.g. 'bool:Read'
      name: string;
      // Type of interaction (Read, Write, ...)
      type: PossibleInteractionTypesEnum;
      // Input set by user (if applicable)
      input: any;
      // Actual interaction that can be interacted on a Thing
      interaction: any;
    }

    interface PerformanceInput {
      // Size of input preferably in byte (see class SizeCalculator)
      size: number | string;
      // Input value: E.g. 'espresso', 22, true, ...
      value: any;
    }

    interface PerformanceOutput {
      // Size of output preferably in byte (see class SizeCalculator)
      size: number | string;
      // Output value: E.g. 'espresso', 22, true, ...
      value: any;
      // How often was this output received
      amount: number;
    }

    interface PerformanceResult {
      settingsMeasurementType: MeasurementTypeEnum;
      settingsConfidenceLevel: number;
      settingsIterations: number;
      settingsDuration: number;
      settingsDelayType: DelayTypeEnum;
      settingsDelayDuration: number;
      settingsNumMeasurements: number;
      settingsNumClients: number;
      name: string;
      input: PerformanceInput;
      output: PerformanceOutput[];
      type: any; // PossibleInteractionTypesEnum
      numClients: number;
      firstMeasured: number;
      delayFirst: number | boolean;
      delayBeforeEach: number | boolean;
      realistic: PerformanceResultDetailData | null;
      possible: PerformanceResultDetailData | null;
      measuredExecutions: number[] | null;
      iterations?: number;
      duration?: number;
      overallDuration?: number; // Overall measured duration
      overallIterations?: number; // Overall iteration executed
      measurementNum: number; // Number of measurement rounds
    }

    /**
     * WCET: Worst Case Execution Time
     * BCET: Best Case Execution Time
     * AET: Average Execution Time
     * all: All measurements uses for the calculation of the above
     */
    interface PerformanceResultDetailData {
      WCET: number;
      BCET: number;
      AET: number;
      all: number[];
      confidenceResults: ConfidenceLevelResults | null;
    }

    /**
     * The result object of the confidence level calculation
     */
    interface ConfidenceLevelResults {
      confidenceFactor: number;
      mean: number;
      standardDeviation: number;
      standardError: number;
      errorMargin: number;
      confidenceIntervalMin: number;
      confidenceIntervalMax: number;
      confidenceInterval: string;
      precisionFactor: number;
      precisionMinVal: number;
      precisionMaxVal: number;
      precisionRange: string;
      resultsWithinRange: boolean | null;
      resultsWithinRangeMin: boolean | null;
      resultsWithinRangeMax: boolean | null;
    }

    interface PerformanceMeasurementSettings {
      settingsMeasurementType: MeasurementTypeEnum;
      settingsConfidenceLevel: number;
      settingsIterations?: number;
      settingsDuration?: number;
      settingsDelayType: DelayTypeEnum;
      settingsDelayDuration?: number;
      settingsNumMeasurements: number;
      settingsNumClients?: number; // TODO: for later
    }
  }

  namespace MAGE {
    // =============================================================================
    // ----------------------------------- Enums -----------------------------------
    // =============================================================================
    enum templatesEnum {
      EVENT = 'use-event-template',
      ACTION = 'use-action-template',
      SUBSCRIBTION = 'use-sub-template'
    }

    enum acceptedTypesEnum {
      VOID = 'void',
      BOOLEAN = 'boolean',
      INTEGER = 'integer',
      NUMBER = 'number',
      ARRAY = 'array',
      OBJECT = 'object'
    }

    // =============================================================================
    // --------------------------------- Interfaces --------------------------------
    // =============================================================================
    /**
     * @typedef {object} GenerationFormInterface
     * @property {string} mashupName
     */
    interface GenerationFormInterface  {
      /**
       * @property {string} mashupName
       */
      mashupName: string;
      things: {
        inputs: WADE.TDElementInterface[]
        outputs: WADE.TDElementInterface[]
      };
      minInputs: number;
      maxInputs: number;
      minOutputs: number;
      maxOutputs: number;
      maxThings: number | null;
      templates: {
        'use-event-template': boolean;
        'use-action-template': boolean;
        'use-read-template': boolean;
      };
      filters: FiltersInterface;
      generation: {
          generateCode: boolean,
          includeFunctionSkeletons: boolean
      };
    }

    interface FiltersInterface {
        acceptedTypes: string[];
        acceptedOutputInteractionTypes: string[];
        allowMixedTemplates: boolean;
        onlySameType: boolean;
        onlySimilarNames: boolean;
        onlySimilarDescriptions: boolean;
        similarityThresholdNames: number | null;
        similarityThresholdDescriptions: number | null;
        semanticMatch: boolean;
        mustHaveInteractions?: VueInteractionInterface[];
        forbiddenInteractions?: VueInteractionInterface[];
        mustHaveAnnotations?: VueAnnotationInterface[];
        forbiddenAnnotations?: VueAnnotationInterface[];
        mustHaveTdAnnotations?: VueAnnotationInterface[];
        forbiddenTdAnnotations?: VueAnnotationInterface[];
    }

    /**
     * @typedef {object} InteractionInterface
     */
    interface InteractionInterface {
      interactionType: string;
      name: string;
      object: object;
      from: string;
      to: string;
      thingId: string;
      id: string;
    }

    interface InputInteractionInterface extends InteractionInterface {
      interactionType: 'event-subscribe' | 'property-read' | 'action-read' | 'property-observe';
      matchingOutputCombinations?: MAGE.InteractionInterface[][];
    }

    interface VueInteractionInterface {
      title: string;
      thingId: string;
      name: string;
      description: string;
      annotations: string[];
      dataType: 'null' | 'string' | 'integer' | 'number' | 'boolean' | 'array' | 'object';
      type: 'property-read' | 'event-subscribe' | 'property-write' | 'action-read' | 'action-invoke' | 'property-observe';
      restriction: 'none' | 'forbidden' | 'mustHave';
    }

    interface VueAnnotationInterface {
      annotation: string;
      type: 'property-read' | 'event-subscribe' | 'property-write' | 'action-read' | 'action-invoke' |  'property-observe' | 'input' | 'output' | 'io';
      numberOfAccurance: number;
      description: string | null;
      restriction: 'none' | 'forbidden' | 'mustHave';
    }

    interface storedVocabInterface {
      vocabUrl: string;
      numberOfAccurances: number;
    }

    interface MashupGenerationResult {
      designSpaceSize: number;
      mashupsGenerated: number;
      imagesMDs: string[];
      plantUmls: string[];
      mashups: MAGE.InteractionInterface[][];
    }
  }

  namespace SDSQ {
    enum interactionType {
      subscribeEvent = 'subscribeEvent',
      invokeAction = 'invokeAction',
      readProperty = 'readProperty',
      writeProperty = 'writeProperty',
      observeProperty = 'observeProperty'
    }

    enum interactionTypeOfReceive {
      subscribeEvent = 'subscribeEvent',
      invokeAction = 'invokeAction',
      readProperty = 'readProperty',
      observeProperty = 'observeProperty'
    }

    enum interactionTypeOfSend {
      invokeAction = 'invokeAction',
      writeProperty = 'writeProperty',
    }

    enum structureType {
      interact = 'interact',
      loop = 'loop',
      wait = 'wait',
      case = 'case',
      get = 'get',
      set = 'set',
      ref = 'ref'
    }

    enum loopType {
      timed = 'timed',
      logic = 'logical'
    }

    enum interactionDir {
      receive = 'receive',
      send = 'send'
    }

    interface mashupLogic {
      name: string;
      root: structureEl[] | undefined;
      actions: {
          [k: string]: structureEl[]
      };
      functions: {
          [k: string]: structureEl[]
      };
      properties: {
          [k: string]: structureEl[]
      };
    }

    type interactionAll = interactionReceive | interactionSend;

    type interactionReceive = interactionProto & {
        direction: interactionDir.receive,
        type: interactionType.observeProperty | interactionType.invokeAction | interactionType.readProperty | interactionType.subscribeEvent,
        set?: {
            type: 'variable' | 'property',
            name: string
        }
    };

    type interactionSend = interactionProto & {
        direction: interactionDir.send,
        type: interactionType.invokeAction | interactionType.writeProperty,
        get?: {
            type: 'variable' | 'property',
            name: string
        },
        defaultInput?: typeDefaultInput
    };

    interface interactionProto {
        to: string;
        name: string;
        formRef?: number;
    }

    type loopOptions = {
        type: loopType.timed,
        period: number
    } | {
        type: loopType.logic,
        exCount: number | 'forever'
    };

    type structureEl = structElWait | structElLoop | structElCondition | structElAtomic | structElGet | structElSet | structElRef;

    interface structElRef {
        type: structureType.ref;
        ref: {
            type: 'action' | 'function',
            name: string
        };
    }

    interface structElGet {
        type: structureType.get;
        get: typeGetSet;
    }

    interface structElSet {
        type: structureType.set;
        set: typeGetSet;
        get?: typeGetSet;
        defaultInput?: any;
    }

    interface structElWait {
        type: structureType.wait;
        waitTime: number;
    }

    interface structElLoop {
        type: structureType.loop;
        content: structureEl[];
        loopOpts: loopOptions;
    }

    interface structElCondition {
        type: structureType.case;
        content: structureEl[];
        elseContent?: structureEl[];
        condition: comparison;
    }

    type comparison = {
        type: 'var',
        variable: typeGetSet,
        value?: string | number | typeGetSet
    } | {
        type: 'not',
        not: comparison
    } | {
        type: 'all',
        allOf: comparison[]
    } | {
        type: 'any',
        anyOf: comparison[]
    } | {
        type: 'one',
        oneOf: comparison[]
    };

    interface structElAtomic {
        type: structureType.interact;
        receiveIntrcts: interactionReceive[];
        sendIntrcts: interactionSend[];
        breakOnDataPushed: boolean;
    }

    interface typeGetSet {
        type: 'variable' | 'property';
        name: string;
    }

    // type newtdTemplate = WoTTDSchema16October2019
    // type newsdTemplate = SDValidationSchema

    interface tdTemplate {
        id: string;
        '@context': any[];
        '@type': string;
        title: string;
        description: string;
        securityDefinitions: {};
        security: string;
        properties: {
            [k: string]: {
                readOnly?: boolean,
                [k: string]: any
            }
        };
        actions: {
            [k: string]: {
                forms?: any,
                [k: string]: any
            }
        };
        events: {[k: string]: any};
        base?: string;
    }

    interface sdTemplate extends tdTemplate {
        things: {
            [k: string]: subthing
        };
        variables: {
            [k: string]: {
                path?: pathEl[],
                readOnly?: boolean,
                defaultInput?: any,
                [k: string]: any
            }
        };
        properties: {
            [k: string]: {
                path?: pathEl[],
                defaultInput?: any
            }
        };
        functions: {
            [k: string]: {
                path: pathEl[],
                [k: string]: any
            }
        };
        actions: {
            [k: string]: {
                forms: any,
                path: pathEl[],
                description?: string
            }
        };
        path: pathEl[];
    }

    interface subthing {
            '$id': string;
            base: string;
            id?;
            '@context'?;
            '@type'?;
            title?;
            description?;
            properties: {
                [k: string]: {
                    forms?: Array<{
                        href: string, op
                    }>,
                    [k: string]: any
                }
            };
            actions: {
                [k: string]: {
                    forms?: Array<{
                        href: string, op
                    }>,
                    [k: string]: any
                }
            };
            events: {
                [k: string]: {
                    forms?: Array<{
                        href: string, op
                    }>,
                    [k: string]: any
                }
            };
    }
    // type newtdForms = WoTTDSchema16October2019["forms"]

    interface tdForms {
        op: string | string[];
        href: string;
        contentType: string;
        contentCoding?: string;
        subprotocol?: string;
        security?: string | string[];
        scopes?: string | string[];
        response?: {
            contentType: string
        };
        [k: string]: any;
    }

    interface validProtocols {
        http: number;
        https: number;
        coap: number;
        coaps: number;
        mqtt: number;
        null: number;
    }

    // type newpathEl = PathElement
    type pathEl = pathWait | pathLoop | pathCase | pathInteract | pathSet | pathGet | pathRef;

    interface pathWait {
        wait: number;
    }

    // type pathLoop = Loop
    // TODO could also use get?
    interface pathLoop {
        loop: {
            type: 'logical' | 'timed',
            defaultInput: number | true,
            path: pathEl[]
        };
    }

    //    type pathCondition = Case
    interface pathCase {
        case: {
            if: ifWord,
            then: {
                path: pathEl[]
            },
            else: {
                path?: pathEl[]
            }
        };
    }

    type ofWord = {allOf: ifWord[]} | {oneOf: ifWord[]} | {anyOf: ifWord[]};
    type ifWord = ofWord |
                    {not: ifWord} |
                    {get: { $ref: string},
                    output?: typeOutput};


    interface pathInteract {
        receive: pathInteractReceive[];
        send: pathInteractSend[];
        breakOnDataPushed?: boolean;
    }

    interface pathInteractReceive {
            form: {
                $ref: string
            };
            set?: {$ref: string};
            op: 'subscribeevent' | 'observeproperty' | 'readproperty' | 'invokeaction';
    }

    interface pathInteractSend {
            form: {
                $ref: string
            };
            get?: {$ref: string};
            defaultInput?: any;
            op: 'writeproperty'| 'invokeaction';
    }

    interface pathRef {
        $ref: string;
    }

    interface pathSet {
        set: {$ref: string};
        defaultInput?: typeDefaultInput;
        get?: {$ref: string};
    }

    interface pathGet {
        get: {$ref: string};
    }

    type typeDefaultInput = boolean | number | string;
    type typeOutput = number | string | {$ref: string};

    }
}
