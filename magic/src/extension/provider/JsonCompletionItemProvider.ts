import { CancellationToken, CompletionContext, CompletionItem, CompletionItemProvider, CompletionList, Disposable, languages, Position, ProviderResult, TextDocument } from "vscode";
import { JSON_MODE } from "../constant/constant";

export class JsonCompletionItemProvider implements CompletionItemProvider, Disposable {
  public disposables: Disposable[] = [];

  constructor() {
    this.disposables.push(languages.registerCompletionItemProvider(JSON_MODE, this, '"'));
  }

  provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken, context: CompletionContext): ProviderResult<CompletionItem[] | CompletionList<CompletionItem>> {
    console.log(document);
    throw new Error("Method not implemented.");
  }

  public dispose(): any {
    this.disposables.forEach((e) => e.dispose());
  }
}