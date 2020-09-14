import * as path from "path";
import {CancellationToken, LocationLink, DefinitionProvider, Location, Position, Range, ReferenceContext, 
  ReferenceProvider, TextDocument, Uri, workspace, SymbolInformation, commands, SymbolKind} from "vscode";

export class JsonReferenceProvider implements DefinitionProvider, ReferenceProvider {

  public async provideDefinition(document: TextDocument, position: Position, token: CancellationToken): Promise<LocationLink[] | undefined> {
    let textRange = document.getWordRangeAtPosition(position, /([^\"\s]+)/g);
    let targetText = document.getText(textRange);
    let regExp = new RegExp(`"(type|codeRef)"\\s*:\\s*"${targetText}"`);
    let match = regExp.exec(document.lineAt(position.line).text);
    
    if (match) {
      console.log(match[1]);

      let symbol = await this.getSymbol(targetText, document);
      if (symbol) {
        let locationLink = {
          originSelectionRange: textRange,
          targetRange: symbol.location.range,
          targetUri: symbol.location.uri,
          targetSelectionRange: new Range(new Position(0, 0), new Position(0, 0))
        } as LocationLink;
  
        return [locationLink];
      }
    }
  }

  // 这里通过SymbolProvider 获取到目标文件的Uri
  // 大写的结果由Dart插件提供 小写的会由这个插件实现
  // 大写kind搜索Class 小写搜索File
  // 小写的File可能会有很多 需要根据当前document uri中关键字 选取最接近的一个
  private async getSymbol(query: string, textDocument: TextDocument ) : Promise<SymbolInformation | undefined> {
    let symbolsList = await getWorkspaceSymbols(query);
    symbolsList.forEach(console.log);
    if (symbolsList) {
      if (/[A-Z]\S*/.test(query)) {
        return symbolsList.find((e) => e.kind === SymbolKind.Class);
      } else {
        let symbols = symbolsList.filter((e) => e.kind === SymbolKind.File);
        if (symbols) {
          if (symbols.length === 1) {
            return symbols[0];
          } else {
            let paths = textDocument.uri.fsPath.split(path.sep);
            let uriKey = paths[paths.length - 5];
            return symbols.find((e) => e.containerName === uriKey);
          }
        }
      }
    }
  }

  public async provideReferences(document: TextDocument, position: Position, context: ReferenceContext, token: CancellationToken): Promise<Location[] | undefined> {
    return undefined;
  }
}

export async function getWorkspaceSymbols(query: string): Promise<SymbolInformation[]> {
	const workspaceSymbolResult = await (commands.executeCommand("vscode.executeWorkspaceSymbolProvider", query) as Thenable<SymbolInformation[]>);
	return workspaceSymbolResult || [];
}