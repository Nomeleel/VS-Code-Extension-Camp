import * as fs from "fs";
import * as path from "path";
import { commands, Disposable, ExtensionContext, ViewColumn, window} from "vscode";

export class FileUtilCommand implements Disposable {
  private disposables: Disposable[] = [];
  private context: ExtensionContext;

  constructor(context: ExtensionContext) {
    this.context = context;
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

    panel.webview.html = this.getBoxContext();

    panel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'context':
            window.showInformationMessage(message.context);
            console.log('----------');
            console.log(message.context);
            console.log('----------');
            break;
          case 'url':
            window.showInformationMessage(message.url);
            console.log('-----url-----');
            console.log(message.url);
            console.log('----------');
            break;
        }
      },
      undefined,
      this.context.subscriptions
    );

    panel.onDidDispose(
      () => {
        console.log('Panel dispose');
      }
    );
  }

  public getBoxContext() : string {
    let context = fs.readFileSync(path.join(this.context.extensionPath, 'dist/template/vscbox.html'), 'utf-8');
    return context;
  }

  public dispose(): any {
    this.disposables.forEach((e) => e.dispose());
  }
}