import {
  CancellationToken, commands, DefinitionProvider, Location, LocationLink, Position, Range, ReferenceContext,
  ReferenceProvider, SymbolInformation, SymbolKind, TextDocument
} from "vscode";
import { getConfiguration } from "../util/util";

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
    if (/^[A-Z]\S*/.test(query)) {
      return this.getDartSymbol(query);
    } else {
      return this.getFileSymbol(query, textDocument);
    }
  }

  private async getDartSymbol(query: string) : Promise<SymbolInformation | undefined> {
    let symbolsList = await getWorkspaceSymbols(query);
    return symbolsList?.find((e) => e.kind === SymbolKind.Class && e.name === query);
  }

  private async getFileSymbol(query: string, textDocument: TextDocument ) : Promise<SymbolInformation | undefined> {
    let uriKey = this.getUriKey(textDocument.uri.fsPath);
    let queryEnhance = [query, uriKey].join('.');
    let symbolsList = await getWorkspaceSymbols(queryEnhance);
    let symbols = symbolsList?.filter((e) => e.kind === SymbolKind.Key);
    if (symbols) {
      if (symbols.length === 1) {
        return symbols[0];
      } else {
        return symbols.find((e) => e.containerName === uriKey);
      }
    }
  }

  private getUriKey(uriPath: string) : string {
    let keyArray = getConfiguration<Array<string>>('magic.uri.mark');
    let matchArray = uriPath.match(new RegExp(keyArray.join('|')));
    return (matchArray && matchArray[0]) ? matchArray[0] : '**';
  }

  public async provideReferences(document: TextDocument, position: Position, context: ReferenceContext, token: CancellationToken): Promise<Location[] | undefined> {
    return undefined;
  }
}

export async function getWorkspaceSymbols(query: string): Promise<SymbolInformation[]> {
	const workspaceSymbolResult = await (commands.executeCommand("vscode.executeWorkspaceSymbolProvider", query) as Thenable<SymbolInformation[]>);
	return workspaceSymbolResult || [];
}