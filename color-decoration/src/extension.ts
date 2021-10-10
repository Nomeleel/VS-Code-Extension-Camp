import { ExtensionContext } from 'vscode';
import { ColorDecoration, ColorDecorationConfig, ColorRangeComputerARGBProvider } from './index';

export function activate(context: ExtensionContext) {
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
