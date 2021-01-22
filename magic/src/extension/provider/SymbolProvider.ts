import * as path from "path";
import { CancellationToken, Disposable, languages, Location, SymbolInformation, SymbolKind, Uri, workspace, WorkspaceSymbolProvider } from "vscode";
import { getFillRange } from "../util/util";

export class SymbolProvider implements WorkspaceSymbolProvider, Disposable {
	public disposables: Disposable[] = [];

  constructor() {
    this.disposables.push(languages.registerWorkspaceSymbolProvider(this));
  }

  // 动态的去查 大写搜索dart（这个可以交给Dart插件去做） 小写搜索json
  // 文件在不断变化，如果一开始就把映射建立好，后期就要监听文件的变化，并维护映射
  // 每次查询通过查找文件名或许不会太慢
  public async provideWorkspaceSymbols(query: string, token: CancellationToken): Promise<SymbolInformation[] | undefined> {
    if (/^[a-z]\S*/.test(query)) {
      let queryParse = query.split('.');
      if (queryParse.length === 2) {
        let subQuery = queryParse[0];
        let uris = await workspace.findFiles(`**/${queryParse[1]}/**/${subQuery}.json`);
        // findFiles为模糊查询，进一步通过相同文件名筛选
        let filterUris = uris?.filter((e) => path.parse(e.fsPath).name === subQuery);
        if (filterUris) {
          if (filterUris.length === 1) {
            return [await this.genSymbolInformation(subQuery, subQuery, uris[0])];
          } else {
            // 没有配置Mark的时候, 会走这个逻辑为每个item添加mark
            // 在containerName中添加标识
            let uriList = filterUris.map((e) => e.fsPath.split(path.sep));
            let symbolList: SymbolInformation[] = new Array<SymbolInformation>();
            for (let index = 0; index < uriList.length; index++) {
              let bIndex = index + 1 < uriList.length ? index + 1 : 0;
              let diff = uriList[index].filter(e => !uriList[bIndex].includes(e));
              symbolList.push(await this.genSymbolInformation(subQuery, diff ? diff[0] : '', uris[0]));
            }
            console.log(symbolList);
            return symbolList;
          }
        }
      }
    }
  }

  private async genSymbolInformation(name: string, containerName: string, uri: Uri) {
    return new SymbolInformation(name, SymbolKind.Key, containerName, 
      new Location(uri, await getFillRange(uri)));
  }

  public dispose(): any {
		this.disposables.forEach((e) => e.dispose());
	}
}