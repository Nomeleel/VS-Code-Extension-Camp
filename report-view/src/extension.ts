import { ExtensionContext } from 'vscode';
import { DeleteFileCommand } from './command/delete_file_command';
import { ShowTextDocumentCommand } from './command/show_text_document_command';
import { DuplicateProvider } from './duplicate/duplicate_provider';
import UnusedCodeProvider from './unused/unused_code_provider';
import UnusedFileProvider from './unused/unused_file_provider';

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    new UnusedCodeProvider(),
    new UnusedFileProvider(),
    new DuplicateProvider(),
    new ShowTextDocumentCommand(),
    new DeleteFileCommand(),
  );
}

export function deactivate() { }
