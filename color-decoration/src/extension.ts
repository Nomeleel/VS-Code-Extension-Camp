import * as vscode from 'vscode';
import { ColorDecoration } from './color_decoration';
import { ColorDecorationConfig } from './color_decoration_config';
import { ColorRangeComputerARGBProvider } from './color_range_computer_provider';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(new ColorDecoration(
		context.globalStorageUri.path, 
		new ColorDecorationConfig(
			['dart'], 
			['dart'],
			new ColorRangeComputerARGBProvider()
		)
	));
}

export function deactivate() { }
