import { CancellationToken, CustomDocumentBackup, CustomDocumentBackupContext, CustomDocumentEditEvent, CustomDocumentOpenContext, CustomEditorProvider, Disposable, EventEmitter, Uri, Webview, WebviewPanel, window } from "vscode";
import { SvgaDocument } from "./SvgaDocument";

export class SvgaEditorProvider implements CustomEditorProvider<SvgaDocument>, Disposable {

  private static readonly viewType = 'svga.preview';

  public disposables: Disposable[] = [];

  constructor() {
    this.disposables.push(
      window.registerCustomEditorProvider(SvgaEditorProvider.viewType, this),
    );
  }

  private readonly _onDidChangeCustomDocument = new EventEmitter<CustomDocumentEditEvent<SvgaDocument>>();
  public readonly onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;

  saveCustomDocument(document: SvgaDocument, cancellation: CancellationToken): Thenable<void> {
    return document.save(cancellation);
  }

  saveCustomDocumentAs(document: SvgaDocument, destination: Uri, cancellation: CancellationToken): Thenable<void> {
    return document.saveAs(destination, cancellation);
  }

  revertCustomDocument(document: SvgaDocument, cancellation: CancellationToken): Thenable<void> {
    return document.save(cancellation);
  }

  backupCustomDocument(document: SvgaDocument, context: CustomDocumentBackupContext, cancellation: CancellationToken): Thenable<CustomDocumentBackup> {
    return document.backup(context.destination, cancellation);
  }

  async openCustomDocument(uri: Uri, openContext: CustomDocumentOpenContext, token: CancellationToken): Promise<SvgaDocument> {
    const document: SvgaDocument = new SvgaDocument(uri);
    await document.open();
    return document;
  }

  resolveCustomEditor(document: SvgaDocument, webviewPanel: WebviewPanel, token: CancellationToken): void | Thenable<void> {
    webviewPanel.webview.options = {
      enableScripts: true,
    };
    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);
    webviewPanel.webview.onDidReceiveMessage(e => {
      if (e.type === 'ready') {
        this.postMessage(webviewPanel, 'load', document.documentData);
      }
    });
  }

  private postMessage(webviewPanel: WebviewPanel, type: string, args: any): void {
    webviewPanel.webview.postMessage({ type, args });
  }

  private getHtmlForWebview(webview: Webview): string {
    return 'Svga';
  }

  dispose() {
    this.disposables.forEach((e) => e.dispose());
  }
}
