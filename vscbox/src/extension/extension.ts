import * as vscode from 'vscode';
import { FileCommand } from './command/FileCommand';
import { FileUtilCommand } from "./command/FileUtilCommand";

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('vscbox.hellohello', () => {
		vscode.window.showInformationMessage('Hello World from vscbox 😊😊😊');
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(new FileUtilCommand(context));
	context.subscriptions.push(new FileCommand());
}

export function deactivate() {}
