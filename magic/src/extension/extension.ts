import { ExtensionContext } from "vscode";
import { AddImportCommand } from "./command/AddImportCommand";
import { AddInInitScriptCommand } from "./command/AddInInitScriptCommand";
import { AddScriptCommand } from "./command/AddScriptCommand";
import { JumpToEditorCommand } from "./command/JumpToEditorCommand";
import { OpenSettingsCommand } from "./command/OpenSettingsCommand";
import { OutlineFieldSortCommand } from "./command/OutlineFieldSortCommand";
import { ShowTimeCommand } from "./command/ShowTimeCommand";
import { ColorDecorations } from "./decorations/color_decorations";
import { JsonFileListener } from "./listener/JsonFileListener";
import { ScriptFileListener } from "./listener/ScriptFileListener";
import { FieldOutlineProvider } from "./provider/FieldOutlineProvider";
import { JsonCompletionItemProvider } from "./provider/JsonCompletionItemProvider";
import { JsonOutlineProvider } from "./provider/JsonOutlineProvider";
import { JsonReferenceProvider } from "./provider/JsonReferenceProvider";
import { SymbolProvider } from "./provider/SymbolProvider";

export function activate(context: ExtensionContext) {
	context.subscriptions.push(new ShowTimeCommand());
	context.subscriptions.push(new AddScriptCommand());
	context.subscriptions.push(new AddInInitScriptCommand());
	context.subscriptions.push(new AddImportCommand());
	context.subscriptions.push(new JumpToEditorCommand());
	context.subscriptions.push(new OpenSettingsCommand());
	context.subscriptions.push(new OutlineFieldSortCommand());

	context.subscriptions.push(new ColorDecorations(context.globalStoragePath));

	context.subscriptions.push(new JsonFileListener());
	context.subscriptions.push(new ScriptFileListener());

	context.subscriptions.push(new SymbolProvider());
	context.subscriptions.push(new JsonReferenceProvider());
	context.subscriptions.push(new JsonCompletionItemProvider());
	context.subscriptions.push(new JsonOutlineProvider());
	context.subscriptions.push(new FieldOutlineProvider());
}

// this method is called when your extension is deactivated
export function deactivate() { }