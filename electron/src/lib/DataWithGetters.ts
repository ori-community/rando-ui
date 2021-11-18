import { Data } from 'dataclass'

export abstract class DataWithGetters extends Data {
  public getGetters(): string[] {
    return Reflect.ownKeys(this.constructor.prototype).filter(name => {
      return typeof Reflect.getOwnPropertyDescriptor(this.constructor.prototype, name)?.["get"] === "function";
    }) as string[];
  }

  toJSON(): Object {
    const properies = [...Object.getOwnPropertyNames(this), ...this.getGetters()]
    return properies.reduce((acc: any, value) => {
      // @ts-ignore
      acc[value] = this[value]
      return acc
    }, {})
  }
}
