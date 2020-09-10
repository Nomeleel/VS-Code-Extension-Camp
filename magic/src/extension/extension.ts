import * as path from "path";
import * as vscode from 'vscode';
import { ColorDecorations } from "./decorations/color_decorations";
import { JsonFileListener } from "./listener/JsonFileListener";

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('magic.showTime', async () => {
		vscode.window.showInformationMessage('Show Time ^_^');

		let Symbols = await getWorkspaceSymbols('TestImport');
		Symbols.forEach(console.log);
	});

	context.subscriptions.push(disposable);

	context.subscriptions.push(new ColorDecorations(path.join(context.globalStoragePath, "colors")));
	
	context.subscriptions.push(new JsonFileListener());

}

// this method is called when your extension is deactivated
export function deactivate() {}

export async function getWorkspaceSymbols(query: string): Promise<vscode.SymbolInformation[]> {
	const workspaceSymbolResult = await (vscode.commands.executeCommand("vscode.executeWorkspaceSymbolProvider", query) as Thenable<vscode.SymbolInformation[]>);
	return workspaceSymbolResult || [];
}
