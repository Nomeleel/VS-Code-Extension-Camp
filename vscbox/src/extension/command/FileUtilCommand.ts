import * as fs from "fs";
import * as path from "path";
import * as http from "http";
import { commands, Disposable, ExtensionContext, ViewColumn, window, workspace} from "vscode";

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

    this.getKey();

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
            //this.get(message.url);
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

  public getKey() : Array<number>{
    let configuration = workspace.getConfiguration();
    let keyArray = configuration.get('vscbox.keyArray') as Array<number>;
    if (keyArray.length === 0) {
      let keyStr: string|undefined = configuration.get('vscbox.keyString');
      if (keyStr) {
        keyArray = keyStr.split(',').map((e) => int.pre);
      }
    }

    console.log(keyArray);
    return keyArray;
  }

  public get(url: string) {
    http.get(url ,(req: any) => {
      let html='';
      req.on('data',function(data: any){
        html+=data;
      });
      req.on('end',function(){
        console.info(html);
      });
    });
  }

  public getBoxContext() : string {
    let context = fs.readFileSync(path.join(this.context.extensionPath, 'dist/template/vscbox.html'), 'utf-8');
    return context;
  }

  public dispose(): any {
    this.disposables.forEach((e) => e.dispose());
  }
}