// Parses a consumed Td to Vue 'Interaction' Component readable data

import * as WoT from 'wot-typescript-definitions';
import { DataSchemaTypes, InteractionAffordancesTypes, PossibleInteractionTypesEnum, ProtocolEnum } from '@/util/enums';
import SizeCalculator from '@/backend/SizeCalculator';

export default class TdParser {
  private consumedTd: WoT.ConsumedThing | null;
  private parsedTd: any;
  private protocols: ProtocolEnum[];
  private SizeCalculator: any;

  constructor(
    consumedTd: WoT.ConsumedThing | null,
    protocols: ProtocolEnum[] | any = []
  ) {
    this.consumedTd = consumedTd;
    this.parsedTd = {
      propertyInteractions: [],
      actionInteractions: [],
      eventInteractions: []
    };
    this.protocols = protocols;

    this.SizeCalculator = new SizeCalculator();

    this.parseProperties();
    this.parseActions();
    this.parseEvents();
  }

  public getParsedTd() {
    return this.parsedTd;
  }

  private parseProperties() {
    if (!this.consumedTd) return;

    for (const property in this.consumedTd.getThingDescription().properties) {
      if (
        !this.consumedTd
          .getThingDescription()
          .properties.hasOwnProperty(property)
      ) {
        continue;
      }

      // If it's MQTT you cannot write or read a property
      // You can only subscribe
      if (this.protocols.indexOf(ProtocolEnum.MQTT) !== -1) {
        this.parsedTd.propertyInteractions.push({
          interactionName: property,
          interactionTitle: `${property} (o)`,
          interactionType: PossibleInteractionTypesEnum.PROP_OBSERVE_READ,
          interactionSelectBtn: {
            btnInputType: this.getCorrectInputType(
              this.consumedTd.getThingDescription().properties[property]
            ),
            btnKey: `property-${property}-observe`,
            btnGeneralStyle: 'btn-event-interaction',
            btnSelectedStyle: 'btn-event-interaction-selected',
            interaction: async () => {
              if (!this.consumedTd)
                return { error: 'No consumed Thing available.' };
              const response = await // TODO check if correct, has been properties[property].subscribe
              this.consumedTd.observeProperty(property, async res => {
                return await res;
              });
              return response;
            }
          }
        });
        continue;
      }

      // Readable properties
      if (
        !this.consumedTd.getThingDescription().properties[property].writeOnly
      ) {
        this.parsedTd.propertyInteractions.push({
          interactionName: property,
          interactionTitle: `${property} (r)`,
          interactionType: PossibleInteractionTypesEnum.PROP_READ,
          interactionSelectBtn: {
            btnKey: `property-${property}-read`,
            btnGeneralStyle: 'btn-event-interaction',
            btnSelectedStyle: 'btn-event-interaction-selected',
            interaction: async () => {
              return getReadResponseWithTiming(
                this.consumedTd,
                this.SizeCalculator
              );
            }
          }
        });
      }

      async function getReadResponseWithTiming(
        consumedTd: WoT.ConsumedThing | null,
        sizeCalculator: SizeCalculator
      ) {
        if (!consumedTd) return { error: 'No consumed Thing available.' };
        const startTime = process.hrtime();
        const response = await consumedTd
          .readProperty(property)
          .then(async res => {
            await res;
            const endTime = process.hrtime(startTime);
            return {
              res,
              s: endTime[0],
              ms: endTime[1] / 1000000,
              size: 'n.A.'
            };
          })
          .catch(async err => {
            await err;
            const endTime = process.hrtime(startTime);
            return {
              res: undefined,
              error: err,
              s: endTime[0],
              ms: endTime[1] / 1000000,
              size: 'n.A.'
            };
          });
        if (response.res !== undefined && response.res !== null) {
          response.size = sizeCalculator.getSize(response.res);
        }
        return response;
      }

      // Writeable properties (have input)
      if (
        !this.consumedTd.getThingDescription().properties[property].readOnly
      ) {
        this.parsedTd.propertyInteractions.push({
          interactionName: property,
          interactionTitle: `${property} (w)`,
          interactionType: PossibleInteractionTypesEnum.PROP_WRITE,
          interactionSelectBtn: {
            btnInputType: this.getCorrectInputType(
              this.consumedTd.getThingDescription().properties[property]
            ),
            btnKey: `property-${property}-write`,
            btnGeneralStyle: 'btn-event-interaction',
            btnSelectedStyle: 'btn-event-interaction-selected',
            interaction: async (val: any, options?: any) => {
              return getWriteResponseWithTiming(
                this.consumedTd,
                val,
                this.SizeCalculator,
                options
              );
            }
          }
        });
      }

      async function getWriteResponseWithTiming(
        consumedTd: WoT.ConsumedThing | null,
        val: any,
        sizeCalculator: SizeCalculator,
        options?: any
      ) {
        if (!consumedTd) return { error: 'No consumed Thing available.' };
        const startTime = process.hrtime();
        const response = await consumedTd
          .writeProperty(property, val, options)
          .then(async res => {
            const endTime = process.hrtime(startTime);
            return {
              res: 'Success',
              s: endTime[0],
              ms: endTime[1] / 1000000,
              size: 'n.A.'
            };
          })
          .catch(async err => {
            await err;
            const endTime = process.hrtime(startTime);
            return {
              res: undefined,
              error: err,
              s: endTime[0],
              ms: endTime[1] / 1000000,
              size: 'n.A.'
            };
          });
        if (response.res) {
          response.size =
            options !== undefined
              ? sizeCalculator.getSize(val) + sizeCalculator.getSize(options)
              : sizeCalculator.getSize(val);
        }
        return response;
      }
    }
  }

  private parseActions() {
    if (!this.consumedTd) return;
    for (const action in this.consumedTd.getThingDescription().actions) {
      if (
        !this.consumedTd.getThingDescription().actions.hasOwnProperty(action)
      ) {
        continue;
      }

      this.parsedTd.actionInteractions.push({
        interactionName: action,
        interactionTitle: `${action} (i)`,
        interactionType: PossibleInteractionTypesEnum.ACTION,
        interactionSelectBtn: {
          btnInputType: this.getCorrectInputTypeActions(
            this.consumedTd.getThingDescription().actions[action]
          ),
          btnKey: `action-${action}`,
          btnGeneralStyle: 'btn-event-interaction',
          btnSelectedStyle: 'btn-event-interaction-selected',
          interaction: async (input?: any) => {
            return getActionsWithTiming(
              this.consumedTd,
              this.SizeCalculator,
              input
            );
          }
        }
      });

      async function getActionsWithTiming(
        consumedTd: WoT.ConsumedThing | null,
        sizeCalculator: SizeCalculator,
        input?: any
      ) {
        if (!consumedTd) return { error: 'No consumed Thing available.' };
        const startTime = process.hrtime();
        const response = await consumedTd
          .invokeAction(action, input)
          .then(async res => {
            await res;
            const endTime = process.hrtime(startTime);
            return {
              res: res || 'Success',
              s: endTime[0],
              ms: endTime[1] / 1000000,
              size: 'n.A.'
            };
          })
          .catch(async err => {
            await err;
            const endTime = process.hrtime(startTime);
            return {
              error: err,
              s: endTime[0],
              ms: endTime[1] / 1000000,
              size: 'n.A.'
            };
          });
        // Measure size of input, if there is an input
        if (input) response.size = `Input ${sizeCalculator.getSize(input)}`;
        return response;
      }
    }
  }

  private parseEvents() {
    if (!this.consumedTd) return;
    for (const event in this.consumedTd.getThingDescription().events) {
      if (!this.consumedTd.getThingDescription().events.hasOwnProperty(event)) {
        continue;
      }
      const eventInteraction = {
        interactionName: event,
        interactionTitle: `${event} (s)`,
        interactionType: PossibleInteractionTypesEnum.EVENT_SUB,
        interactionSelectBtn: {
          btnKey: `select-${event}`,
          btnGeneralStyle: 'btn-event-interaction',
          btnSelectedStyle: 'btn-event-interaction-selected',
          interaction: () => {
            return {
              subscribe: async (cbFunc: (data: any) => void) => {
                if (!this.consumedTd)
                  return { error: 'No consumed Thing available.' };
                const response = await this.consumedTd.subscribeEvent(
                  event,
                  async res => {
                    await res;
                    cbFunc(res);
                  }
                );
                return response;
              },
              unsubscribe: async () => {
                if (this.consumedTd) {
                  const response = await this.consumedTd.unsubscribeEvent(
                    event
                  );
                  return response;
                }
              }
            };
          }
        }
      };
      this.parsedTd.eventInteractions.push(eventInteraction);
    }
  }

  // Get possible input types from property for interactions
  private getCorrectInputType(property: any) {
    const propEnum = property.enum
      ? property.enum
      : property.input
      ? property.input.enum
        ? property.input.enum
        : null
      : null;
    const propType = property.type
      ? property.type
      : property.input && property.input.type
      ? property.input.type
      : null;
    const propMin =
      property.minimum || property.minimum === 0 ? property.minimum : null;
    const propMax = property.maximum ? property.maximum : null;
    const propMinLength = property.minLength ? property.minLength : null;
    const propMaxLength = property.maxLength ? property.maxLength : null;

    return {
      propType,
      propEnum,
      propMin,
      propMax,
      propMinLength,
      propMaxLength
    };
  }

  // Get possible action input types from property for interactions
  private getCorrectInputTypeActions(action: any) {
    const propType = action.input
      ? action.input.type
        ? action.input.type
        : null
      : null;
    const propEnum = action.enum
      ? action.enum
      : action.input && action.input.enum
      ? action.input.enum
      : null;
    const propRequired = action.input
      ? action.input.required
        ? action.input.required
        : null
      : null;
    const propProperties = action.input
      ? action.input.properties
        ? action.input.properties
        : null
      : null;

    return {
      propType,
      propEnum,
      propRequired,
      propProperties
    };
  }
}

class ParsedTd {
  public parsedProperties: parsedProperty[] = [];
  public parsedActions: parsedAction[] = [];
  public parseEvents: parsedEvent[] = [];
  public sizeCalculator: SizeCalculator;

  constructor(consumedThing: WoT.ConsumedThing) {
    let properties = consumedThing.getThingDescription().properties;
    let actions = consumedThing.getThingDescription().actions;
    let events = consumedThing.getThingDescription().events;
    this.sizeCalculator = new SizeCalculator();

    for(const prop of properties) {
      let parsedProp = parsedInteractionFactory.produceParsedInteraction(consumedThing, this.sizeCalculator, prop, InteractionAffordancesTypes.PROP);
      if(parsedProp instanceof parsedProperty) this.parsedProperties.push(parsedProp);
    }
    for(const action of actions) {
      let parsedAct = parsedInteractionFactory.produceParsedInteraction(consumedThing, this.sizeCalculator, action, InteractionAffordancesTypes.ACTION);
      if(parsedAct instanceof parsedAction) this.parsedActions.push(parsedAct);
    }
    for(const event of events) {
      let parsedEvnt = parsedInteractionFactory.produceParsedInteraction(consumedThing, this.sizeCalculator, event, InteractionAffordancesTypes.EVENT);
      if(parsedEvnt instanceof parsedEvent) this.parseEvents.push(parsedEvnt);
    }
  }
}

class parsedInteractionFactory {
  public static produceParsedInteraction(consumedThing: WoT.ConsumedThing, sizeCalculator: SizeCalculator, interactionObj: WADE.TdInteractionInterface | string, interactionType: InteractionAffordancesTypes) {
    switch(interactionType) {
      case InteractionAffordancesTypes.PROP:
        return new parsedProperty(consumedThing, sizeCalculator, interactionObj as WADE.TdPropertyInteractionInterface);
      case InteractionAffordancesTypes.ACTION:
        return new parsedAction(consumedThing, sizeCalculator, interactionObj as WADE.TdActionInteractionInterface);
      case InteractionAffordancesTypes.EVENT:
        return new parsedEvent(consumedThing, sizeCalculator, interactionObj as WADE.TdEventInteractionInterface);
    }
  }
}

class parsedInteraction implements WADE.TdInteractionInterface {
  public title: string;
  public interactionType: InteractionAffordancesTypes;
  public forms: WADE.TdFormInterface[];
  public uriVariables: {[key: string]: WADE.TdDataSchemaInterface} | undefined;
  public description: string | undefined;
  public consumedThing: WoT.ThingDescription;
  public base: string | undefined;
  public availableProtocols: string[] = [];
  protected sizeCalculator: SizeCalculator;

  constructor(consumedThing: WoT.ThingDescription, sizeCalculator: SizeCalculator, interactionObj: WADE.TdInteractionInterface | string, interactionType: InteractionAffordancesTypes) {
    this.consumedThing = consumedThing;
    this.base = consumedThing.getThingDescription().base;
    this.sizeCalculator = sizeCalculator;
    let internalObj: WADE.TdInteractionInterface;
    internalObj = typeof interactionObj === 'string' ? JSON.parse(interactionObj) : interactionObj;
    this.title = internalObj.title;
    this.forms = internalObj.forms;
    this.interactionType = interactionType;
    if(internalObj.description) this.description = internalObj.description;
    if(internalObj.uriVariables) this.uriVariables = internalObj.uriVariables;
    if(this.base) {
      this.availableProtocols.push(this.base.split(':')[0])
    }
  }

  protected static getDataSchema(dataSchema: WADE.TdDataSchemaInterface) {
    switch(dataSchema.type) {
      case DataSchemaTypes.ARRAY: 
          let schemaArray: WADE.TdArraySchemaInterface = {
            type: DataSchemaTypes.ARRAY,
            readOnly: dataSchema.readOnly,
            writeOnly: dataSchema.writeOnly,
            items: dataSchema.items,
            enum: dataSchema.enum,
            minItems: dataSchema.minItems,
            maxItems: dataSchema.maxItem,
          }
          return schemaArray;
      case DataSchemaTypes.BOOL: 
        let schemaBool: WADE.TdBooleanSchemaInterface = {
          type: DataSchemaTypes.BOOL,
          readOnly: dataSchema.readOnly,
          writeOnly: dataSchema.writeOnly,
        }
        return schemaBool;
      case DataSchemaTypes.INT: 
        let schemaInt: WADE.TdIntegerSchemaInterface = {
          type: DataSchemaTypes.INT,
          readOnly: dataSchema.readOnly,
          writeOnly: dataSchema.writeOnly,
          enum: dataSchema.enum,
          minimum: dataSchema.minimum,
          maximum: dataSchema.max,
        }
        return schemaInt;
      case DataSchemaTypes.NULL: 
        let schemaNull: WADE.TdNullSchemaInterface = {
          type: DataSchemaTypes.NULL,
          readOnly: dataSchema.readOnly,
          writeOnly: dataSchema.writeOnly,
        }
        return schemaNull;
      case DataSchemaTypes.NUM: 
        let schemaNum: WADE.TdNumberSchemaInterface = {
          type: DataSchemaTypes.NUM,
          readOnly: dataSchema.readOnly,
          writeOnly: dataSchema.writeOnly,
          enum: dataSchema.enum,
          minimum: dataSchema.minimum,
          maximum: dataSchema.maximum
        }
        return schemaNum;
      case DataSchemaTypes.OBJ: 
        let schemaObj: WADE.TdObjectSchemaInterface = {
          type: DataSchemaTypes.OBJ,
          readOnly: dataSchema.readOnly,
          writeOnly: dataSchema.writeOnly,
          enum: dataSchema.enum,
          properties: dataSchema.properties,
          required: dataSchema.required
        }
        return schemaObj;
      case DataSchemaTypes.STRING: 
        let schemaStr: WADE.TdStringSchemaInterface = {
          type: DataSchemaTypes.STRING,
          readOnly: dataSchema.readOnly,
          writeOnly: dataSchema.writeOnly,
          enum: dataSchema.enum,
        }
        return schemaStr;
      case DataSchemaTypes.UNDEF:
        return dataSchema;
    }

    return dataSchema;
  }
}

class parsedProperty extends parsedInteraction implements WADE.TdPropertyInteractionInterface {
  public readOnly: boolean;
  public writeOnly: boolean;
  public observable: boolean | undefined;
  public type: WADE.DataSchemaTypes;
  public dataSchema: WADE.TdDataSchemaInterface = {
    type: DataSchemaTypes.UNDEF,
    readOnly: false,
    writeOnly: false
  }
  
  constructor(consumedThing: WoT.ThingDescription, sizeCalculator: SizeCalculator, interactionObj: WADE.TdPropertyInteractionInterface | string) {
    super(consumedThing, sizeCalculator, interactionObj, InteractionAffordancesTypes.PROP);
    let internalObj: WADE.TdPropertyInteractionInterface;
    internalObj = typeof interactionObj === 'string' ? JSON.parse(interactionObj) : interactionObj;
    this.readOnly = internalObj.readOnly ? internalObj.readOnly : false;
    this.writeOnly = internalObj.writeOnly ? internalObj.writeOnly : false;
    this.type = internalObj.type ? internalObj.type : DataSchemaTypes.UNDEF;
    this.dataSchema = parsedInteraction.getDataSchema(internalObj);
  }

  /**
   * 
   * @param protocol 
   * @param uriVariables 
   * @returns 
   */
  public async readProperty(protocol: ProtocolEnum, uriVariables?: object) {
    let result: { interactionSuccessful: boolean, resultBody: any, errorMsg?: string,
      timeS: number | undefined, timeMs: number | undefined, payloadSize: string | undefined} = {
        interactionSuccessful: false,
        resultBody: undefined,
        errorMsg: undefined,
        timeS: undefined,
        timeMs: undefined,
        payloadSize: undefined
    }
    // disregard if protocol is mqtt
    if(protocol === ProtocolEnum.MQTT) {
      result.errorMsg = "Cannot read property in MQTT";
      return result;
    }
    // disregard if read-only
    if(this.writeOnly) {
      result.errorMsg = "Cannot read a write-only property";
      return result;
    }

    if(this.base) {
      let baseProtocol = this.base.split(':')[0]
      if(baseProtocol !== protocol) {
        result.errorMsg = "Could not find corresponding form";
        return result;
      }
    }

    // search the forms
    for(let [formIndex, form] of this.forms.entries()) {
      let hrefProtocol = form.href.split(':')[0];
      let operations: string[];
      let timeStart;
      // add protocol in available protocols
      if(!this.base && !this.availableProtocols.includes(hrefProtocol)) this.availableProtocols.push(hrefProtocol); 
      // if form op is undefined, treat as readproperty and writeproperty according to standard
      if(typeof form.op === 'undefined') operations = ['readproperty', 'writeproperty'];
      // convert operations to array
      if(typeof form.op === 'string') operations = [form.op]; else operations = form.op;
      // check if base has same protocol and form has the operation
      if((this.base || hrefProtocol === protocol)  && operations.includes('readproperty')) {
        // choose this form
        let interactionOptions = {formIndex: formIndex};
        // add uriVariables if available and needed
        if(this.uriVariables && uriVariables) interactionOptions['uriVariables'] = uriVariables;
        try {
          timeStart = process.hrtime();
          result.resultBody = await this.consumedThing.readProperty(this.title, interactionOptions);
          let timeEnd = process.hrtime(timeStart);
          result.interactionSuccessful = true;
          result.timeS = timeEnd[0];
          result.timeMs = timeEnd[1]/1000000;
          if (result.resultBody !== undefined && result.resultBody !== null) result.payloadSize = this.sizeCalculator.getSize(result.resultBody);
          return result;
        } catch (err) {
          result.errorMsg = err;
          result.interactionSuccessful = false;
          return result;
        }
      }
    }
    result.errorMsg = "Could not find corresponding form";
    result.interactionSuccessful = false;
    return result;
  }

  //TODO: finish this to the end
  /**
   * 
   * @param protocol 
   * @param value 
   * @param uriVariables 
   * @returns 
   */
  public async writeProperty(protocol: ProtocolEnum, value: any, uriVariables?: object) {
    let result: { interactionSuccessful: boolean, resultBody: any, errorMsg?: string,
      timeS: number | undefined, timeMs: number | undefined, payloadSize: any} = {
        interactionSuccessful: false,
        resultBody: undefined,
        errorMsg: undefined,
        timeS: undefined,
        timeMs: undefined,
        payloadSize: undefined
    }

    if(protocol === ProtocolEnum.MQTT) {
      result.errorMsg = "Cannot write property in MQTT";
      return result;
    }

    if(this.readOnly) {
      result.errorMsg = "Cannot write a read-only property";
      return result;
    }

    if(this.base) {
      let baseProtocol = this.base.split(':')[0]
      if(baseProtocol !== protocol) {
        result.errorMsg = "Could not find corresponding form";
        return result;
      }
    }

    for(let [formIndex, form] of this.forms.entries()) {
      let hrefProtocol = form.href.split(':')[0]
      // add protocol in available protocols
      if(!this.base && !this.availableProtocols.includes(hrefProtocol)) this.availableProtocols.push(hrefProtocol); 
      let operations: string[];
      if(typeof form.op === 'string') operations = [form.op]; else operations = form.op;
      if(typeof form.op === 'undefined') operations = ['readproperty', 'writeproperty'];
      if((this.base || hrefProtocol === protocol) && operations.includes('writeproperty')) {
        let interactionOptions = {formIndex: formIndex};
        if(this.uriVariables && uriVariables) interactionOptions["uriVariables"] = uriVariables;
        try {
          await this.consumedThing.writeProperty(this.title, value, interactionOptions);
          result.interactionSuccessful = true;
          return result;
        } catch (err) {
          result.errorMsg = err;
          result.interactionSuccessful = false;
          return result;
        }
      }
    }
    result.errorMsg = "Could not find corresponding form";
    result.interactionSuccessful = false;
    return result;
  }

  public async observeProperty(protocol: ProtocolEnum, listener: WoT.WotListener, uriVariables?: object) {
    let result: {interactionSuccessful: boolean, resultBody: any, errorMsg?: string} = {
      interactionSuccessful: false,
      resultBody: undefined,
      errorMsg: undefined
    }

    let includesObserve = false

    for(let form of this.forms) {
      let operations: string[];
      if(typeof form.op === 'undefined') continue;
      if(typeof form.op === 'string') operations = [form.op]; else operations = form.op;
      if(operations.includes("observeproperty")) {
        includesObserve = true; break;
      }
    }

    if(protocol !== ProtocolEnum.MQTT && !includesObserve) {
      result.errorMsg = this.observable ? "This property does not include an a form for observing" : "This property cannot be observed";
      return result;
    }

    if(this.base) {
      let baseProtocol = this.base.split(':')[0]
      if(baseProtocol !== protocol) {
        result.errorMsg = "Could not find corresponding form";
        return result;
      }
    }

    for(let [formIndex, form] of this.forms.entries()) {
      let hrefProtocol = form.href.split(':')[0]
      let operations: string[];
      // add protocol in available protocols
      if(!this.base && !this.availableProtocols.includes(hrefProtocol)) this.availableProtocols.push(hrefProtocol); 
      if(typeof form.op === 'string') operations = [form.op]; else operations = form.op;
      if((this.base || hrefProtocol === protocol) && operations.includes('observeproperty')) {
        let interactionOptions = {formIndex: formIndex};
        if(this.uriVariables && uriVariables) interactionOptions["uriVariables"] = uriVariables;
        try {
          await this.consumedThing.observeProperty(this.title, listener, interactionOptions);
          result.interactionSuccessful = true;
          return result;
        } catch (err) {
          result.errorMsg = err;
          result.interactionSuccessful = false;
          return result;
        }
      }
    }
    result.errorMsg = "Could not find corresponding form";
    result.interactionSuccessful = false;
    return result;
  }

  public async unobserveProperty(protocol: ProtocolEnum, uriVariables?: object) {
    let result: {interactionSuccessful: boolean, resultBody: any, errorMsg?: string} = {
      interactionSuccessful: false,
      resultBody: undefined,
      errorMsg: undefined
    }

    let includesUnobserve = false

    for(let form of this.forms) {
      let operations: string[];
      if(typeof form.op === 'undefined') continue;
      if(typeof form.op === 'string') operations = [form.op]; else operations = form.op;
      if(operations.includes("unobserveproperty")) {
        includesUnobserve = true; break;
      }
    }

    if(protocol !== ProtocolEnum.MQTT && !includesUnobserve) {
      result.errorMsg = this.observable ? "This property does not include an a form for unobserving" : "This property cannot be observed";
      return result;
    }

    if(this.base) {
      let baseProtocol = this.base.split(':')[0]
      if(baseProtocol !== protocol) {
        result.errorMsg = "Could not find corresponding form";
        return result;
      }
    }

    for(let [formIndex, form] of this.forms.entries()) {
      let hrefProtocol = form.href.split(':')[0]
      let operations: string[];
      // add protocol in available protocols
      if(!this.base && !this.availableProtocols.includes(hrefProtocol)) this.availableProtocols.push(hrefProtocol); 
      if(typeof form.op === 'string') operations = [form.op]; else operations = form.op;
      if((this.base || hrefProtocol === protocol) && operations.includes('unobserveproperty')) {
        let interactionOptions = {formIndex: formIndex};
        if(this.uriVariables && uriVariables) interactionOptions["uriVariables"] = uriVariables;
        try {
          await this.consumedThing.unobserveProperty(this.title, interactionOptions);
          result.interactionSuccessful = true;
          return result;
        } catch (err) {
          result.errorMsg = err;
          result.interactionSuccessful = false;
          return result;
        }
      }
    }
    result.errorMsg = "Could not find corresponding form";
    result.interactionSuccessful = false;
    return result;
  }
}

class parsedAction extends parsedInteraction implements WADE.TdActionInteractionInterface {
  public safe: boolean;
  public idempotent: boolean;
  public input: WADE.TdDataSchemaInterface | undefined;
  public output: WADE.TdDataSchemaInterface | undefined;

  constructor(consumedThing: WoT.ConsumedThing, sizeCalculator: SizeCalculator, interactionObj: string |  WADE.TdActionInteractionInterface) {
    super(consumedThing, sizeCalculator, interactionObj, InteractionAffordancesTypes.ACTION);
    let internalObj: WADE.TdActionInteractionInterface;
    internalObj = typeof interactionObj === 'string' ? JSON.parse(interactionObj) : interactionObj;
    this.safe = internalObj.safe ? internalObj.safe : false;
    this.idempotent = internalObj.idempotent ? internalObj.idempotent : false;
    this.input = internalObj.input;
    this.output = internalObj.output;
  }

  public async invokeAction(protocol: ProtocolEnum, params?: any, uriVariables?: object) {
    let result: {interactionSuccessful: boolean, resultBody: any, errorMsg?: string} = {
      interactionSuccessful: false,
      resultBody: undefined,
      errorMsg: undefined
    }
    // disregard if protocol is mqtt
    if(protocol === ProtocolEnum.MQTT) {
      result.errorMsg = "Cannot invoke action using MQTT";
      return result;
    }

    if(this.base) {
      let baseProtocol = this.base.split(':')[0]
      if(baseProtocol !== protocol) {
        result.errorMsg = "Could not find corresponding form";
        return result;
      }
    }

    // search the forms
    for(let [formIndex, form] of this.forms.entries()) {
      let hrefProtocol = form.href.split(':')[0]
      // add protocol in available protocols
      if(!this.base && !this.availableProtocols.includes(hrefProtocol)) this.availableProtocols.push(hrefProtocol);
      // check if base is there
      if(this.base || hrefProtocol === protocol) {
        // choose this form
        let interactionOptions = {formIndex: formIndex};
        // add uriVariables if available and needed
        if(this.uriVariables && uriVariables) interactionOptions['uriVariables'] = uriVariables;
        try {
          result.resultBody = await this.consumedThing.invokeAction(this.title, params, interactionOptions);
          result.interactionSuccessful = true;
          return result;
        } catch (err) {
          result.errorMsg = err;
          result.interactionSuccessful = false;
          return result;
        }
      }
    }
    result.errorMsg = "Could not find corresponding form";
    result.interactionSuccessful = false;
    return result;
  }
  
}

class parsedEvent extends parsedInteraction implements WADE.TdEventInteractionInterface {
  public subscription: WADE.TdDataSchemaInterface | undefined;
  public data: WADE.TdDataSchemaInterface | undefined;
  public cancellation: WADE.TdDataSchemaInterface | undefined;
  constructor(consumedThing: WoT.ConsumedThing, sizeCalculator: SizeCalculator, interactionObj: WADE.TdEventInteractionInterface | string) {
    super(consumedThing, sizeCalculator, interactionObj, InteractionAffordancesTypes.EVENT);
    let internalObj: WADE.TdEventInteractionInterface;
    internalObj = typeof interactionObj === 'string' ? JSON.parse(interactionObj) : interactionObj;
    this.subscription = internalObj.subscription;
    this.data = internalObj.data;
    this.cancellation = internalObj.cancellation;
  }

  public async subscribeEvent(protocol: ProtocolEnum, listener: WoT.WotListener, uriVariables?: object) {
    let result: {interactionSuccessful: boolean, resultBody: any, errorMsg?: string} = {
      interactionSuccessful: false,
      resultBody: undefined,
      errorMsg: undefined
    }

    if(this.base) {
      let baseProtocol = this.base.split(':')[0]
      if(baseProtocol !== protocol) {
        result.errorMsg = "Could not find corresponding form";
        return result;
      }
    }

    for(let [formIndex, form] of this.forms.entries()) {
      let hrefProtocol = form.href.split(':')[0]
      let operations: string[];
      // add protocol in available protocols
      if(!this.base && !this.availableProtocols.includes(hrefProtocol)) this.availableProtocols.push(hrefProtocol);
      if(typeof form.op === 'undefined') operations = ['subscribeevent'];
      if(typeof form.op === 'string') operations = [form.op]; else operations = form.op;
      if((this.base || hrefProtocol === protocol) && operations.includes('subscribeevent')) {
        let interactionOptions = {formIndex: formIndex};
        if(this.uriVariables && uriVariables) interactionOptions["uriVariables"] = uriVariables;
        try {
          await this.consumedThing.subscribeEvent(this.title, listener, interactionOptions);
          result.interactionSuccessful = true;
          return result;
        } catch (err) {
          result.errorMsg = err;
          result.interactionSuccessful = false;
          return result;
        }
      }
    }
    result.errorMsg = "Could not find corresponding form";
    result.interactionSuccessful = false;
    return result;
  }

  public async unsubscribeEvent(protocol: ProtocolEnum, uriVariables?: object) {
    let result: {interactionSuccessful: boolean, resultBody: any, errorMsg?: string} = {
      interactionSuccessful: false,
      resultBody: undefined,
      errorMsg: undefined
    }

    if(this.base) {
      let baseProtocol = this.base.split(':')[0]
      if(baseProtocol !== protocol) {
        result.errorMsg = "Could not find corresponding form";
        return result;
      }
    }

    for(let [formIndex, form] of this.forms.entries()) {
      let hrefProtocol = form.href.split(':')[0]
      let operations: string[];
      // add protocol in available protocols
      if(!this.base && !this.availableProtocols.includes(hrefProtocol)) this.availableProtocols.push(hrefProtocol);
      if(typeof form.op === 'undefined') continue;
      if(typeof form.op === 'string') operations = [form.op]; else operations = form.op;
      if((this.base || hrefProtocol === protocol) && operations.includes('unsubscribeevent')) {
        let interactionOptions = {formIndex: formIndex};
        if(this.uriVariables && uriVariables) interactionOptions["uriVariables"] = uriVariables;
        try {
          await this.consumedThing.unsubscribeEvent(this.title, interactionOptions);
          result.interactionSuccessful = true;
          return result;
        } catch (err) {
          result.errorMsg = err;
          result.interactionSuccessful = false;
          return result;
        }
      }
    }
    result.errorMsg = "Could not find corresponding form";
    result.interactionSuccessful = false;
    return result;
  }
}