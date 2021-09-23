import * as vscode from 'vscode';
import { SvgaEditorProvider } from './svgaEditorProvider';

export function activate(context: vscode.ExtensionContext) { 
	context.subscriptions.push(new SvgaEditorProvider());
}

export function deactivate() { }
