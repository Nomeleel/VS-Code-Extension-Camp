import * as path from "path";
import * as vscode from 'vscode';
import { ColorDecorations } from "./decorations/color_decorations";
import { JsonFileListener } from "./listener/JsonFileListener";

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('magic.showTime', () => {
		vscode.window.showInformationMessage('Show Time ^_^');
	});

	context.subscriptions.push(disposable);

	context.subscriptions.push(new ColorDecorations(path.join(context.globalStoragePath, "colors")));
	
	context.subscriptions.push(new JsonFileListener());

}

// this method is called when your extension is deactivated
export function deactivate() {}
