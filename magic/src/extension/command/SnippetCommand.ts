import * as fs from "fs";
import * as path from "path";
import { commands, ExtensionContext, ViewColumn, window, workspace} from "vscode";
import { BaseDisposable } from "../BaseDisposable";

export class SnippetCommand extends BaseDisposable {
  private context: ExtensionContext;

  constructor(context: ExtensionContext) {
    super();
    this.context = context;
    this.disposables.push(
      commands.registerCommand("magic.openSnippetView", this.openSnippetView, this),
    );
  }

  public async openSnippetView(scriptPath: string) {
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
    let context = fs.readFileSync(path.join(this.context.extensionPath, 'dist/template/snippet.html'), 'utf-8');
    return context;
  }
}