import { join } from "path";
import { extensions } from "vscode";

export function iconMap(iconName: string): string {
  switch (iconName) {
    case 'top level variable':
      return 'variable';
    case 'type alias':
    case 'function type alias':
    case 'function':
      return 'method';
    case 'mixin':
    case 'class':
      return 'class';
    case 'enum':
      return 'enumerator';
    case 'extension':
      return 'namespace';
    default:
      return 'keyword';
  }
}

export function getIconPath(iconName: string): { light: string; dark: string } | undefined {
  let flutterIconPath = getFlutterExtensionIconPath();
  if (flutterIconPath) {
    let icon = iconMap(iconName);
    return {
      light: join(flutterIconPath, `${icon}-light.svg`),
      dark: join(flutterIconPath, `${icon}-dark.svg`),
    }
  }
}

let flutterIconPath: string | undefined;
export function getFlutterExtensionIconPath(): string | undefined {
  if (!flutterIconPath) {
    let extension = extensions.getExtension('Dart-Code.dart-code');
    if (extension) {
      flutterIconPath = join(extension!.extensionPath, 'media', 'icons', 'vscode_symbols');
    }
  }

  return flutterIconPath;
}