import {CancellationToken, DefinitionLink, DefinitionProvider, Location, Position, ReferenceContext, ReferenceProvider, TextDocument, Uri} from "vscode";

export class JsonReferenceProvider implements DefinitionProvider, ReferenceProvider {

  public async provideDefinition(document: TextDocument, position: Position, token: CancellationToken): Promise<DefinitionLink[] | undefined> {
    let text = document.getText(document.getWordRangeAtPosition(position));
    console.log(text);
    let textLine = document.lineAt(position.line);
    let regExpStr = `"(type|codeRef)"\\s*:\\s*${text}`;
    console.log(regExpStr);
    console.log(textLine.text.search(new RegExp(regExpStr)));
    console.log(new RegExp(regExpStr).test(textLine.text));
    return undefined;
  }

  public async provideReferences(document: TextDocument, position: Position, context: ReferenceContext, token: CancellationToken): Promise<Location[] | undefined> {
    return undefined;
  }
}