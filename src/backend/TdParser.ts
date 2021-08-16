import * as WoT from 'wot-typescript-definitions';
import { DataSchemaTypes, InteractionAffordancesTypes, ProtocolEnum } from '@/util/enums';
import SizeCalculator from '@/backend/SizeCalculator';

// Parses a consumed Td to Vue 'Interaction' Component readable data
export default class TdParser {
  private consumedTd: WoT.ConsumedThing | null;
  private parsedTd: ParsedTd;

  constructor(consumedTd: WoT.ConsumedThing) {
    this.consumedTd = consumedTd;
    this.parsedTd = new ParsedTd(consumedTd);
  }

  public getParsedTd() {
    return this.parsedTd;
  }
}

export class ParsedTd {
  public parsedProperties: parsedProperty[] = [];
  public parsedActions: parsedAction[] = [];
  public parsedEvents: parsedEvent[] = [];
  public availableProtocols: string[] = [];
  public availableOperations: string[] = [];

  constructor(consumedThing: WoT.ConsumedThing) {
    const properties = consumedThing.getThingDescription().properties;
    const actions = consumedThing.getThingDescription().actions;
    const events = consumedThing.getThingDescription().events;

    if (properties) for (const prop in properties) {
      if (properties.hasOwnProperty(prop)) {
        const parsedProp = parsedInteractionFactory.produceParsedInteraction(consumedThing, prop, properties[prop], InteractionAffordancesTypes.PROP);
        if (parsedProp instanceof parsedProperty) {
          this.parsedProperties.push(parsedProp);
          for(let protocol of parsedProp.availableProtocols) {
            if(!this.availableProtocols.includes(protocol)) this.availableProtocols.push(protocol);
          }
          for(let operation of parsedProp.availableOperations) {
            if(!this.availableOperations.includes(operation)) this.availableOperations.push(operation);
          }
        } 
      }
    }
    if (actions) for (const action in actions) {
      if (actions.hasOwnProperty(action)) {
        const parsedAct = parsedInteractionFactory.produceParsedInteraction(consumedThing, action, actions[action], InteractionAffordancesTypes.ACTION);
        if (parsedAct instanceof parsedAction) {
          this.parsedActions.push(parsedAct);
          for(let protocol of parsedAct.availableProtocols) {
            if(!this.availableProtocols.includes(protocol)) this.availableProtocols.push(protocol);
          }
          for(let operation of parsedAct.availableOperations) {
            if(!this.availableOperations.includes(operation)) this.availableOperations.push(operation);
          }
        }
      }
    }
    if (events) for (const event in events) {
      if (events.hasOwnProperty(event)) {
        const parsedEvnt = parsedInteractionFactory.produceParsedInteraction(consumedThing, event, events[event], InteractionAffordancesTypes.EVENT);
        if (parsedEvnt instanceof parsedEvent) {
          this.parsedEvents.push(parsedEvnt);
          for(let protocol of parsedEvnt.availableProtocols) {
            if(!this.availableProtocols.includes(protocol)) this.availableProtocols.push(protocol);
          }
          for(let operation of parsedEvnt.availableOperations) {
            if(!this.availableOperations.includes(operation)) this.availableOperations.push(operation);
          }
        }
      }
    }
  }
}

class parsedInteractionFactory {
  public static produceParsedInteraction(consumedThing: WoT.ConsumedThing, interactionName: string, interactionObj: WADE.TdInteractionInterface | string, interactionType: InteractionAffordancesTypes) {
    switch (interactionType) {
      case InteractionAffordancesTypes.PROP:
        return new parsedProperty(consumedThing, interactionName, interactionObj as WADE.TdPropertyInteractionInterface);
      case InteractionAffordancesTypes.ACTION:
        return new parsedAction(consumedThing, interactionName, interactionObj as WADE.TdActionInteractionInterface);
      case InteractionAffordancesTypes.EVENT:
        return new parsedEvent(consumedThing, interactionName, interactionObj as WADE.TdEventInteractionInterface);
    }
  }
}

export class parsedInteraction implements WADE.TdInteractionInterface {
  public interactionName: string;
  public interactionType: InteractionAffordancesTypes;
  public forms: WADE.TdFormInterface[];
  public uriVariables: {[key: string]: WADE.TdDataSchemaInterface} | undefined;
  public description: string | undefined;
  public consumedThing: WoT.ThingDescription;
  public base: string | undefined;
  public availableProtocols: string[] = [];
  public availableOperations: string[] = [];

  constructor(consumedThing: WoT.ThingDescription, interactionName: string, interactionObj: WADE.TdInteractionInterface | string, interactionType: InteractionAffordancesTypes) {
    this.consumedThing = consumedThing;
    this.base = consumedThing.getThingDescription().base;
    let internalObj: WADE.TdInteractionInterface;
    internalObj = typeof interactionObj === 'string' ? JSON.parse(interactionObj) : interactionObj;
    this.interactionName = interactionName;
    this.forms = internalObj.forms;
    this.interactionType = interactionType;
    if (internalObj.description) this.description = internalObj.description;
    if (internalObj.uriVariables) this.uriVariables = internalObj.uriVariables;
    if (this.base) {
      this.availableProtocols.push(this.base.split(':')[0]);
    }
    this.parseForms(internalObj);
  }

  private parseForms(interactionObj: WADE.TdInteractionInterface) {
    if(interactionObj.base) {
      this.availableProtocols.push(interactionObj.base.split(':')[0]);
    }

    for(let form of interactionObj.forms) {
      let hrefProtocol =  form.href.split(':')[0];
      let operations = form.op;
      if(typeof operations === 'undefined') {
        operations = []
        switch (this.interactionType) {
          case InteractionAffordancesTypes.PROP:
            if(!(interactionObj as WADE.TdPropertyInteractionInterface).writeOnly) operations.push('readproperty');
            if(!(interactionObj as WADE.TdPropertyInteractionInterface).readOnly) operations.push('writeproperty');
            break;
          case InteractionAffordancesTypes.ACTION:
            operations = ['invokeaction'];
            break;
          case InteractionAffordancesTypes.EVENT:
            operations = ['subscribeevent'];
            break;
        }
      } 
      if(typeof operations === 'string') operations = [operations];
      if(!this.availableProtocols.includes(hrefProtocol) && !interactionObj.base) {
        this.availableProtocols.push(hrefProtocol);
      }
      for(let op of operations) {
        if(!this.availableOperations.includes(op)) this.availableOperations.push(op);
      }
    }
  }

  protected static getDataSchema(dataSchema: WADE.TdDataSchemaInterface) {
    switch (dataSchema.type) {
      case DataSchemaTypes.ARRAY:
          const schemaArray: WADE.TdArraySchemaInterface = {
            type: DataSchemaTypes.ARRAY,
            readOnly: dataSchema.readOnly,
            writeOnly: dataSchema.writeOnly,
            items: dataSchema.items,
            enum: dataSchema.enum,
            minItems: dataSchema.minItems,
            maxItems: dataSchema.maxItem,
          };
          return schemaArray;
      case DataSchemaTypes.BOOL:
        const schemaBool: WADE.TdBooleanSchemaInterface = {
          type: DataSchemaTypes.BOOL,
          readOnly: dataSchema.readOnly,
          writeOnly: dataSchema.writeOnly,
        };
        return schemaBool;
      case DataSchemaTypes.INT:
        const schemaInt: WADE.TdIntegerSchemaInterface = {
          type: DataSchemaTypes.INT,
          readOnly: dataSchema.readOnly,
          writeOnly: dataSchema.writeOnly,
          enum: dataSchema.enum,
          minimum: dataSchema.minimum,
          maximum: dataSchema.max,
        };
        return schemaInt;
      case DataSchemaTypes.NULL:
        const schemaNull: WADE.TdNullSchemaInterface = {
          type: DataSchemaTypes.NULL,
          readOnly: dataSchema.readOnly,
          writeOnly: dataSchema.writeOnly,
        };
        return schemaNull;
      case DataSchemaTypes.NUM:
        const schemaNum: WADE.TdNumberSchemaInterface = {
          type: DataSchemaTypes.NUM,
          readOnly: dataSchema.readOnly,
          writeOnly: dataSchema.writeOnly,
          enum: dataSchema.enum,
          minimum: dataSchema.minimum,
          maximum: dataSchema.maximum
        };
        return schemaNum;
      case DataSchemaTypes.OBJ:
        const schemaObj: WADE.TdObjectSchemaInterface = {
          type: DataSchemaTypes.OBJ,
          readOnly: dataSchema.readOnly,
          writeOnly: dataSchema.writeOnly,
          enum: dataSchema.enum,
          properties: dataSchema.properties,
          required: dataSchema.required
        };
        return schemaObj;
      case DataSchemaTypes.STRING:
        const schemaStr: WADE.TdStringSchemaInterface = {
          type: DataSchemaTypes.STRING,
          readOnly: dataSchema.readOnly,
          writeOnly: dataSchema.writeOnly,
          enum: dataSchema.enum,
        };
        return schemaStr;
      case DataSchemaTypes.UNDEF:
        return dataSchema;
    }
    return dataSchema;
  }
}

export class parsedProperty extends parsedInteraction implements WADE.TdPropertyInteractionInterface {
  public readOnly: boolean;
  public writeOnly: boolean;
  public observable: boolean | undefined;
  public type: WADE.DataSchemaTypes;
  public dataSchema: WADE.TdDataSchemaInterface = {
    type: DataSchemaTypes.UNDEF,
    readOnly: false,
    writeOnly: false
  };

  constructor(consumedThing: WoT.ThingDescription, interactionName: string, interactionObj: WADE.TdPropertyInteractionInterface | string) {
    super(consumedThing, interactionName, interactionObj, InteractionAffordancesTypes.PROP);
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
    const result: { interactionSuccessful: boolean, resultBody: any, errorMsg?: string,
      timeS: number | undefined, timeMs: number | undefined, payloadSize: string | undefined} = {
        interactionSuccessful: false,
        resultBody: undefined,
        errorMsg: undefined,
        timeS: undefined,
        timeMs: undefined,
        payloadSize: undefined
    };
    let timeStart;
    // disregard if protocol is mqtt
    if (protocol === ProtocolEnum.MQTT) {
      result.errorMsg = 'Cannot read property in MQTT';
      return result;
    }
    // disregard if read-only
    if (this.writeOnly) {
      result.errorMsg = 'Cannot read a write-only property';
      return result;
    }

    if (this.base) {
      const baseProtocol = this.base.split(':')[0];
      if (baseProtocol !== protocol) {
        result.errorMsg = 'Could not find corresponding form';
        return result;
      }
    }

    // search the forms
    for (const [formIndex, form] of this.forms.entries()) {
      const hrefProtocol = form.href.split(':')[0];
      let operations: string[] = [];
      // if form op is undefined, treat as readproperty and writeproperty according to standard
      if (typeof form.op === 'undefined') {
        if(!this.writeOnly) operations.push('readproperty');
        if(!this.readOnly) operations.push('writeproperty');
      }
      // convert operations to array
      if (typeof form.op === 'string') operations = [form.op]; else operations = form.op;
      // check if base has same protocol and form has the operation
      if ((this.base || hrefProtocol === protocol)  && operations.includes('readproperty')) {
        // choose this form
        let interactionOptions: {formIndex: number, uriVariables?: any} = {formIndex};
        // add uriVariables if available and needed
        if (this.uriVariables && uriVariables) interactionOptions.uriVariables = uriVariables;
        try {
          timeStart = process.hrtime();
          result.resultBody = await this.consumedThing.readProperty(this.interactionName, interactionOptions);
          const timeEnd = process.hrtime(timeStart);
          result.interactionSuccessful = true;
          result.timeS = timeEnd[0];
          result.timeMs = timeEnd[1] / 1000000;
          if (result.resultBody !== undefined && result.resultBody !== null) result.payloadSize = SizeCalculator.getSize(result.resultBody);
          return result;
        } catch (err) {
          result.errorMsg = err;
          result.interactionSuccessful = false;
          return result;
        }
      }
    }
    result.errorMsg = 'Could not find corresponding form';
    result.interactionSuccessful = false;
    return result;
  }

  // TODO: finish this to the end
  /**
   *
   * @param protocol
   * @param value
   * @param uriVariables
   * @returns
   */
  public async writeProperty(protocol: ProtocolEnum, value: any, uriVariables?: object) {
    const result: { interactionSuccessful: boolean, errorMsg?: string,
      timeS: number | undefined, timeMs: number | undefined} = {
        interactionSuccessful: false,
        errorMsg: undefined,
        timeS: undefined,
        timeMs: undefined,
    };
    let timeStart;

    if (protocol === ProtocolEnum.MQTT) {
      result.errorMsg = 'Cannot write property in MQTT';
      return result;
    }

    if (this.readOnly) {
      result.errorMsg = 'Cannot write a read-only property';
      return result;
    }

    if (this.base) {
      const baseProtocol = this.base.split(':')[0];
      if (baseProtocol !== protocol) {
        result.errorMsg = 'Could not find corresponding form';
        return result;
      }
    }

    for (const [formIndex, form] of this.forms.entries()) {
      const hrefProtocol = form.href.split(':')[0];
      let operations: string[];
      if (typeof form.op === 'string') operations = [form.op]; else operations = form.op;
      if (typeof form.op === 'undefined') operations = ['readproperty', 'writeproperty'];
      if ((this.base || hrefProtocol === protocol) && operations.includes('writeproperty')) {
        let interactionOptions: {formIndex: number, uriVariables?: any} = {formIndex};
        if (this.uriVariables && uriVariables) interactionOptions.uriVariables = uriVariables;
        try {
          timeStart = process.hrtime();
          await this.consumedThing.writeProperty(this.interactionName, value, interactionOptions);
          const timeEnd = process.hrtime(timeStart);
          result.timeS = timeEnd[0];
          result.timeMs = timeEnd[1] / 1000000;
          result.interactionSuccessful = true;
          return result;
        } catch (err) {
          result.errorMsg = err;
          result.interactionSuccessful = false;
          return result;
        }
      }
    }
    result.errorMsg = 'Could not find corresponding form';
    result.interactionSuccessful = false;
    return result;
  }

  public async observeProperty(protocol: ProtocolEnum, listener: WoT.WotListener, uriVariables?: object) {
    const result: {interactionSuccessful: boolean, errorMsg?: string} = {
      interactionSuccessful: false,
      errorMsg: undefined
    };

    let includesObserve = false;

    for (const form of this.forms) {
      let operations: string[];
      if (typeof form.op === 'undefined') continue;
      if (typeof form.op === 'string') operations = [form.op]; else operations = form.op;
      if (operations.includes('observeproperty')) {
        includesObserve = true; break;
      }
    }

    if (protocol !== ProtocolEnum.MQTT && !includesObserve) {
      result.errorMsg = this.observable ? 'This property does not include an a form for observing' : 'This property cannot be observed';
      return result;
    }

    if (this.base) {
      const baseProtocol = this.base.split(':')[0];
      if (baseProtocol !== protocol) {
        result.errorMsg = 'Could not find corresponding form';
        return result;
      }
    }

    for (const [formIndex, form] of this.forms.entries()) {
      const hrefProtocol = form.href.split(':')[0];
      let operations: string[];
      if (typeof form.op === 'string') operations = [form.op]; else operations = form.op;
      if ((this.base || hrefProtocol === protocol) && operations.includes('observeproperty')) {
        let interactionOptions: {formIndex: number, uriVariables?: any} = {formIndex};
        if (this.uriVariables && uriVariables) interactionOptions.uriVariables = uriVariables;
        try {
          await this.consumedThing.observeProperty(this.interactionName, listener, interactionOptions);
          result.interactionSuccessful = true;
          return result;
        } catch (err) {
          result.errorMsg = err;
          result.interactionSuccessful = false;
          return result;
        }
      }
    }
    result.errorMsg = 'Could not find corresponding form';
    result.interactionSuccessful = false;
    return result;
  }

  public async unobserveProperty(protocol: ProtocolEnum, uriVariables?: object) {
    const result: {interactionSuccessful: boolean, errorMsg?: string} = {
      interactionSuccessful: false,
      errorMsg: undefined
    };

    let includesUnobserve = false;

    for (const form of this.forms) {
      let operations: string[];
      if (typeof form.op === 'undefined') continue;
      if (typeof form.op === 'string') operations = [form.op]; else operations = form.op;
      if (operations.includes('unobserveproperty')) {
        includesUnobserve = true; break;
      }
    }

    if (protocol !== ProtocolEnum.MQTT && !includesUnobserve) {
      result.errorMsg = this.observable ? 'This property does not include an a form for unobserving' : 'This property cannot be observed';
      return result;
    }

    if (this.base) {
      const baseProtocol = this.base.split(':')[0];
      if (baseProtocol !== protocol) {
        result.errorMsg = 'Could not find corresponding form';
        return result;
      }
    }

    for (const [formIndex, form] of this.forms.entries()) {
      const hrefProtocol = form.href.split(':')[0];
      let operations: string[];
      if (typeof form.op === 'string') operations = [form.op]; else operations = form.op;
      if ((this.base || hrefProtocol === protocol) && operations.includes('unobserveproperty')) {
        let interactionOptions: {formIndex: number, uriVariables?: any} = {formIndex};
        if (this.uriVariables && uriVariables) interactionOptions.uriVariables = uriVariables;
        try {
          await this.consumedThing.unobserveProperty(this.interactionName, interactionOptions);
          result.interactionSuccessful = true;
          return result;
        } catch (err) {
          result.errorMsg = err;
          result.interactionSuccessful = false;
          return result;
        }
      }
    }
    result.errorMsg = 'Could not find corresponding form';
    result.interactionSuccessful = false;
    return result;
  }
}

export class parsedAction extends parsedInteraction implements WADE.TdActionInteractionInterface {
  public safe: boolean;
  public idempotent: boolean;
  public input: WADE.TdDataSchemaInterface | undefined;
  public output: WADE.TdDataSchemaInterface | undefined;

  constructor(consumedThing: WoT.ConsumedThing, interactionName: string, interactionObj: string |  WADE.TdActionInteractionInterface) {
    super(consumedThing, interactionName, interactionObj, InteractionAffordancesTypes.ACTION);
    let internalObj: WADE.TdActionInteractionInterface;
    internalObj = typeof interactionObj === 'string' ? JSON.parse(interactionObj) : interactionObj;
    this.safe = internalObj.safe ? internalObj.safe : false;
    this.idempotent = internalObj.idempotent ? internalObj.idempotent : false;
    this.input = internalObj.input;
    this.output = internalObj.output;
  }

  public async invokeAction(protocol: ProtocolEnum, params?: any, uriVariables?: object) {
    const result: {interactionSuccessful: boolean, resultBody: any, errorMsg?: string
    timeS: number | undefined, timeMs: number | undefined, payloadSize: string | undefined} = {
      interactionSuccessful: false,
      resultBody: undefined,
      timeS: undefined,
      timeMs: undefined,
      payloadSize: undefined,
      errorMsg: undefined
    };
    let timeStart: [number, number] | undefined;
    // disregard if protocol is mqtt
    if (protocol === ProtocolEnum.MQTT) {
      result.errorMsg = 'Cannot invoke action using MQTT';
      return result;
    }

    if (this.base) {
      const baseProtocol = this.base.split(':')[0];
      if (baseProtocol !== protocol) {
        result.errorMsg = 'Could not find corresponding form';
        return result;
      }
    }

    // search the forms
    for (const [formIndex, form] of this.forms.entries()) {
      const hrefProtocol = form.href.split(':')[0];
      // check if base is there
      if (this.base || hrefProtocol === protocol) {
        // choose this form
        let interactionOptions: {formIndex: number, uriVariables?: any} = {formIndex};
        // add uriVariables if available and needed
        if (this.uriVariables && uriVariables) interactionOptions.uriVariables = uriVariables;
        try {
          timeStart = process.hrtime();
          result.resultBody = await this.consumedThing.invokeAction(this.interactionName, params, interactionOptions);
          const timeEnd = process.hrtime(timeStart);
          result.timeS = timeEnd[0];
          result.timeMs = timeEnd[1] / 1000000;
          if (result.resultBody !== undefined && result.resultBody !== null) result.payloadSize = SizeCalculator.getSize(result.resultBody);
          result.interactionSuccessful = true;
          return result;
        } catch (err) {
          const timeEnd = process.hrtime(timeStart);
          result.timeS = timeEnd[0];
          result.timeMs = timeEnd[1] / 1000000;
          result.errorMsg = err;
          result.interactionSuccessful = false;
          return result;
        }
      }
    }
    result.errorMsg = 'Could not find corresponding form';
    result.interactionSuccessful = false;
    return result;
  }

}

export class parsedEvent extends parsedInteraction implements WADE.TdEventInteractionInterface {
  public subscription: WADE.TdDataSchemaInterface | undefined;
  public data: WADE.TdDataSchemaInterface | undefined;
  public cancellation: WADE.TdDataSchemaInterface | undefined;
  constructor(consumedThing: WoT.ConsumedThing, interactionName: string, interactionObj: WADE.TdEventInteractionInterface | string) {
    super(consumedThing, interactionName, interactionObj, InteractionAffordancesTypes.EVENT);
    let internalObj: WADE.TdEventInteractionInterface;
    internalObj = typeof interactionObj === 'string' ? JSON.parse(interactionObj) : interactionObj;
    this.subscription = internalObj.subscription;
    this.data = internalObj.data;
    this.cancellation = internalObj.cancellation;
  }

  public async subscribeEvent(protocol: ProtocolEnum, listener: WoT.WotListener, uriVariables?: object) {
    const result: {interactionSuccessful: boolean, errorMsg?: string} = {
      interactionSuccessful: false,
      errorMsg: undefined
    };
    if (this.base) {
      const baseProtocol = this.base.split(':')[0];
      if (baseProtocol !== protocol) {
        result.errorMsg = 'Could not find corresponding form';
        return result;
      }
    }

    for (const [formIndex, form] of this.forms.entries()) {
      const hrefProtocol = form.href.split(':')[0];
      let operations: string[];
      if (typeof form.op === 'undefined') operations = ['subscribeevent'];
      if (typeof form.op === 'string') operations = [form.op]; else operations = form.op;
      if ((this.base || hrefProtocol === protocol) && operations.includes('subscribeevent')) {
        let interactionOptions: {formIndex: number, uriVariables?: any} = {formIndex};
        if (this.uriVariables && uriVariables) interactionOptions.uriVariables = uriVariables;
        try {
          await this.consumedThing.subscribeEvent(this.interactionName, listener, interactionOptions);
          result.interactionSuccessful = true;
          return result;
        } catch (err) {
          result.errorMsg = err;
          result.interactionSuccessful = false;
          return result;
        }
      }
    }
    result.errorMsg = 'Could not find corresponding form';
    result.interactionSuccessful = false;
    return result;
  }

  public async unsubscribeEvent(protocol: ProtocolEnum, uriVariables?: object) {
    const result: {interactionSuccessful: boolean, errorMsg?: string} = {
      interactionSuccessful: false,
      errorMsg: undefined
    };
    if (this.base) {
      const baseProtocol = this.base.split(':')[0];
      if (baseProtocol !== protocol) {
        result.errorMsg = 'Could not find corresponding form';
        return result;
      }
    }

    for (const [formIndex, form] of this.forms.entries()) {
      const hrefProtocol = form.href.split(':')[0];
      let operations: string[];
      if (typeof form.op === 'undefined') continue;
      if (typeof form.op === 'string') operations = [form.op]; else operations = form.op;
      if ((this.base || hrefProtocol === protocol) && operations.includes('unsubscribeevent')) {
        let interactionOptions: {formIndex: number, uriVariables?: any} = {formIndex};
        if (this.uriVariables && uriVariables) interactionOptions.uriVariables = uriVariables;
        try {
          await this.consumedThing.unsubscribeEvent(this.interactionName, interactionOptions);
          result.interactionSuccessful = true;
          return result;
        } catch (err) {
          result.errorMsg = err;
          result.interactionSuccessful = false;
          return result;
        }
      }
    }
    result.errorMsg = 'Could not find corresponding form';
    result.interactionSuccessful = false;
    return result;
  }
}
