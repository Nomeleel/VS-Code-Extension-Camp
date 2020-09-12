import { CancellationToken, SymbolKind, SymbolInformation, WorkspaceSymbolProvider, Location, Uri, Position } from "vscode";

export class SymbolProvider implements WorkspaceSymbolProvider {
  
  public async provideWorkspaceSymbols(query: string, token: CancellationToken): Promise<SymbolInformation[] | undefined> {
    if (query === 'Hello') {
      return [new SymbolInformation('Hello', SymbolKind.File, 'Test Hello', new Location(Uri.file(''), new Position(0, 0)))];
    } 

    return undefined;
  }
}