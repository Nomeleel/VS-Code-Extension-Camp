import { CancellationToken, SymbolKind, SymbolInformation, WorkspaceSymbolProvider, Location, Uri, Position, workspace, Range } from "vscode";
import { downloadAndUnzipVSCode } from "vscode-test";

export class SymbolProvider implements WorkspaceSymbolProvider {
  
  // 动态的去查 大写搜索dart（这个可以交给Dart插件去做） 小写搜索json
  // 文件在不断变化，如果一开始就把映射建立好，后期就要监听文件的变化，并维护映射
  // 每次查询通过查找文件名或许不会太慢
  public async provideWorkspaceSymbols(query: string, token: CancellationToken): Promise<SymbolInformation[] | undefined> {
    if (/[a-z]\S*/.test(query)) {
      let uris = await workspace.findFiles(`**/*${query}.json`);
      if (uris) {
        if (uris.length === 1) {
          return [new SymbolInformation(query, SymbolKind.File, query, new Location(uris[0], await this.getFillRange(uris[0])))];
        } else {
          // 在containerName中添加标示
        }
      }
    }
  }

  private async getFillRange(uri: Uri) : Promise<Range>{
    let textDocument = await workspace.openTextDocument(uri.fsPath);
    let endPosition = new Position(textDocument.lineCount + 1, 0);

    return new Range(new Position(0, 0), endPosition);
  }
}