import { UnusedProvider } from "./unused_provider";

export default class UnusedCodeProvider extends UnusedProvider {

  constructor() {
    super('code');
  }

  public unusedNode(obj: any): any {
    return obj.unusedCode;
  }
}