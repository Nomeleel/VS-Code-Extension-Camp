import { CancellationToken, CustomDocument, CustomDocumentBackup, Uri, workspace } from "vscode";

export class SvgaDocument implements CustomDocument {
  public readonly uri: Uri;

  private _documentData: Uint8Array | undefined;
	public get documentData(): Uint8Array { return this._documentData!; }

  constructor(
    uri: Uri
  ) {
    this.uri = uri;
  }

  public async open(): Promise<void> {
		this._documentData = await workspace.fs.readFile(this.uri);
	}

  async save(cancellation: CancellationToken): Promise<void> {
    await this.saveAs(this.uri, cancellation);
  }

  async saveAs(destination: Uri, cancellation: CancellationToken): Promise<void> {
    if (cancellation.isCancellationRequested) {
			return;
		}
    await workspace.fs.writeFile(destination, this._documentData!);
  }

  async revert(cancellation: CancellationToken): Promise<void> {

  }

  async backup(destination: Uri, cancellation: CancellationToken): Promise<CustomDocumentBackup> {
    await this.saveAs(destination, cancellation);

    return {
      id: destination.toString(),
      delete: async () => {
        try {
          await workspace.fs.delete(destination);
        } catch {
          // Nothing
        }
      }
    };
  }

  public dispose(): any {
  }
}