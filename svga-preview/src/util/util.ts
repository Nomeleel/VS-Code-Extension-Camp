import { Extension, extensions, Uri } from "vscode";

function getExtension(): Extension<any> {
  return extensions.getExtension('Nomeleel.svga-preview')!;
}

export function getExtensionUri(): Uri {
  return getExtension().extensionUri;
}

export function getExtensionPath(): string {
  return getExtension().extensionPath;
}