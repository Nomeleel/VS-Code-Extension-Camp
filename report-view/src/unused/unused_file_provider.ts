import { UnusedProvider } from "./unused_provider";

export default class UnusedFileProvider extends UnusedProvider {

  constructor() {
    super('file');
  }

  public unusedNode(obj: any): any {
    return obj.unusedFiles;
  }
}