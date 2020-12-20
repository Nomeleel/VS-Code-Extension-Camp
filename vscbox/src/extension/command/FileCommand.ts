import * as fs from "fs";
import * as JSZip from "jszip";
import * as path from "path";
import { commands, Disposable, Uri } from "vscode";
import { addDateSuffixForFilePath, getOrSetKey, getZipDirPath, mkdirSync, openFile } from "../util/util";

export class FileCommand implements Disposable {
  private disposables: Disposable[] = [];

  constructor() {
    this.disposables.push(
      commands.registerCommand("vscbox.fileEncrypt", this.fileXOR, this),
      commands.registerCommand("vscbox.fileDecrypt", this.fileXOR, this),
    );
  }

  private fileXOR(fileUri: Uri) {
    let xorKey: Array<number> | undefined = getOrSetKey();
    if (xorKey) {
      let currentFilePath = fileUri.fsPath;
      fs.readFile(currentFilePath, (error, data) => {
        if (error) {
          console.log('Error!');
        } else {
          let xorBuffer = this.xor(data, xorKey ?? []);
          this.writeThenOpenFileSync(addDateSuffixForFilePath(currentFilePath), xorBuffer);
          this.tryUnZip(xorBuffer, currentFilePath);
        }
      });
    }
  }

  private xor(buffer: Buffer, xorKey: Array<number>) : Buffer {
    let bytesLength = buffer.length;
    let keyBytesLength = xorKey.length;
    if(bytesLength > 0 && keyBytesLength > 0) {
      for (let i = 0, startIndex = 0; i < bytesLength; i++, startIndex++) {
        startIndex %= keyBytesLength;
        buffer[i] ^= xorKey[startIndex];
      }
    }
    return buffer;
  }

  private writeThenOpenFileSync(filePath: string, buffer: Buffer) {
    fs.writeFileSync(filePath, buffer);
    openFile(filePath);
  }

  private tryUnZip(buffer: Buffer, sourcePath: string) {
    let jsZip = new JSZip();
    jsZip.loadAsync(buffer).then((zip) => {
      let zipDirPath = getZipDirPath(sourcePath);
      mkdirSync(zipDirPath);
      for (const file in zip!.files) {
        let fileItem = zip.file(file);
        if (fileItem) {
          if (!fileItem.dir) {
            fileItem!.async('nodebuffer').then((content) => {
              this.writeThenOpenFileSync(path.join(zipDirPath, fileItem!.name), content);
            });
          } else {
            // TODO(Nomeleel): 处理文件夹的情况
          }
        }
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  public dispose(): any {
    this.disposables.forEach((e) => e.dispose());
  }
}