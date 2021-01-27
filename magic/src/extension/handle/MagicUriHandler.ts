import { Uri, UriHandler } from "vscode";

export class MagicUriHandler implements UriHandler {
  handleUri(uri: Uri) {
    console.log(uri);
  }
}