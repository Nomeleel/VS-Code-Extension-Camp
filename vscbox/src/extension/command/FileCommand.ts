import * as fs from "fs";
import { commands, Disposable, window, workspace } from "vscode";

export class FileCommand implements Disposable {
  private disposables: Disposable[] = [];

  constructor() {
    this.disposables.push(
      commands.registerCommand("vscbox.fileEncrypt", this.fileXOR, this),
      commands.registerCommand("vscbox.fileDecrypt", this.fileXOR, this),
    );
  }

  private fileXOR() {
    if (window.activeTextEditor) {
      let xorKey: Array<number> = [];
      let currentFilePath = window.activeTextEditor.document.uri.fsPath;
      fs.readFile(currentFilePath, (error, data) => {
        if (error) {
          console.log('Error!');
        } else {
          let targetFilePath = currentFilePath + 'test.txt';
          fs.writeFileSync(targetFilePath, this.xor(data, xorKey));
          workspace.openTextDocument(targetFilePath).then((textDocument) => {
            window.showTextDocument(textDocument);
          });
        }
      });
    }
  }

  private xor(buffer: Buffer, xorKey: Array<number>) : Buffer{
    let bytesLength = buffer.length;
    let keyBytesLength = xorKey.length;
    for (let i = 0, startIndex = 0; i < bytesLength; i++, startIndex++) {
      startIndex %= keyBytesLength;
      buffer[i] ^= xorKey[startIndex];
    }
    return buffer;
  }

  public dispose(): any {
    this.disposables.forEach((e) => e.dispose());
  }
}