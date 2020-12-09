import * as path from "path";
import * as vscode from 'vscode';
import { ColorDecorations } from "./decorations/color_decorations";
import { JsonFileListener } from "./listener/JsonFileListener";
import { SymbolProvider } from "./provider/SymbolProvider";
import { JsonReferenceProvider } from "./provider/JsonReferenceProvider";
import { ScriptFileListener } from "./listener/ScriptFileListener";
import { AddScriptCommand } from "./command/AddScriptCommand";
import { AddInInitScriptCommand } from "./command/AddInInitScriptCommand";
import { JsonOutlineProvider } from "./provider/JsonOutlineProvider";
import { FieldOutlineProvider } from "./provider/FieldOutlineProvider";

const JSON_MODE = { language: "json", scheme: "file" };

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('magic.showTime', async () => {
		vscode.window.showInformationMessage('Show Time ^_^');
	});
	context.subscriptions.push(disposable);
	context.subscriptions.push(new AddScriptCommand());
	context.subscriptions.push(new AddInInitScriptCommand());

	context.subscriptions.push(new ColorDecorations(path.join(context.globalStoragePath, "colors")));
	
	context.subscriptions.push(new JsonFileListener());
	context.subscriptions.push(new ScriptFileListener());

	context.subscriptions.push(vscode.languages.registerWorkspaceSymbolProvider(new SymbolProvider()));
	context.subscriptions.push(vscode.languages.registerDefinitionProvider(JSON_MODE, new JsonReferenceProvider()));
	context.subscriptions.push(vscode.languages.registerReferenceProvider(JSON_MODE, new JsonReferenceProvider()));
	context.subscriptions.push(vscode.window.createTreeView("jsonOutline", { treeDataProvider: new JsonOutlineProvider(), showCollapseAll: true }));
	context.subscriptions.push(vscode.window.createTreeView("fieldOutline", { treeDataProvider: new FieldOutlineProvider(), showCollapseAll: true }));
}

// this method is called when your extension is deactivated
export function deactivate() {}