import {CancellationToken, LocationLink, DefinitionProvider, Location, Position, Range, ReferenceContext, ReferenceProvider, TextDocument, Uri, workspace, DebugConsoleMode} from "vscode";

export class JsonReferenceProvider implements DefinitionProvider, ReferenceProvider {

  public async provideDefinition(document: TextDocument, position: Position, token: CancellationToken): Promise<LocationLink[] | undefined> {
    let textRange = document.getWordRangeAtPosition(position, /([^\"\s]+)/g);
    let targetText = document.getText(textRange);
    let regExp = new RegExp(`"(type|codeRef)"\\s*:\\s*"${targetText}"`);
    let match = regExp.exec(document.lineAt(position.line).text);
    
    if (match) {
      console.log(match[1]);

      // 这里通过SymbolProvider 获取到目标文件的Uri
      let testUri = Uri.file('/Users/choonlay/Desktop/test2.json');

      let locationLink = {
        originSelectionRange: textRange,
        targetRange: await this.getFillRange(testUri),
        targetUri: testUri,
        targetSelectionRange: new Range(new Position(0, 0), new Position(0, 0))
      } as LocationLink;

      return [locationLink];
    }

    return undefined;
  }

  private async getFillRange(uri: Uri) : Promise<Range>{
    let textDocument = await workspace.openTextDocument(uri.fsPath);
    let endPosition = new Position(textDocument.lineCount + 1, 0);

    return new Range(new Position(0, 0), endPosition);
  }

  public async provideReferences(document: TextDocument, position: Position, context: ReferenceContext, token: CancellationToken): Promise<Location[] | undefined> {
    return undefined;
  }
}