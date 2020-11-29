import * as fs from "fs";
import * as path from "path";
import { commands, Disposable, ExtensionContext, ViewColumn, window} from "vscode";

export class FileUtilCommand implements Disposable {
  private disposables: Disposable[] = [];
  private currentPath: string;

  constructor(context: ExtensionContext) {
    this.currentPath = context.extensionPath;
    this.disposables.push(
      commands.registerCommand("vscbox.openBox", this.openBox, this),
    );
  }

  public async openBox(scriptPath: string) {
    const panel = window.createWebviewPanel(
      'Console',
      'VSC Box',
      ViewColumn.One,
      {
        enableScripts: true
      }
    );

    panel.webview.html = await this.getBoxContext();

    panel.onDidDispose(
      () => {
        console.log('Panel dispose');
      }
    );
  }

  public getBoxContext() : string {
    let context = fs.readFileSync(path.join(this.currentPath, 'dist/template/vscbox.html'), 'utf-8');
    return context;
  }

  public dispose(): any {
    this.disposables.forEach((e) => e.dispose());
  }
}