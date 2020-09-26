import * as fs from "fs";
import * as path from "path";
import * as vs from "vscode";
import { Position, TextDocument, TextEdit, Uri, window, workspace, WorkspaceEdit } from "vscode";

export class ScriptFileListener implements vs.Disposable {
	private readonly subscriptions: vs.Disposable[] = [];

	constructor() {
		/// 开始位置插入import文件 结束位置替换} 为代码片段加}
		/// 利用的Dart在Source Action中的提供的Organize Imports 对import相关进行处理
		/// Sort Members貌似不会对方法中内容进行排序 对于我所要处理的文件 实际效果同Organize Imports
		this.subscriptions.push(vs.workspace.onDidCreateFiles((e) => this.scriptFileChangedHandle(e, OperationType.Added)));

		/// 全部替换即可 考虑Abc 替换可能会影响到Abcd的问题
		this.subscriptions.push(vs.workspace.onDidRenameFiles((e) => this.scriptFileChangedHandle(e, OperationType.Updated)));

		/// 关键字所在行删除 对于import如果失去引用 利用Organize Imports 也可将对应import删除掉
		this.subscriptions.push(vs.workspace.onDidDeleteFiles((e) => this.scriptFileChangedHandle(e, OperationType.Deleted)));
	}

	private scriptFileChangedHandle(event: any, operationType: OperationType) {
		let getTargetFile = this.targetFileProvider(event, operationType);
		console.log(getTargetFile);
		console.log(getTargetFile.isNotEmpty());
		if (getTargetFile.isNotEmpty()) {
			vs.window.showInformationMessage('😊 😊 😊 Whether to update InitScript.dart based on your changes? 😊 😊 😊',
				'Sure', 'No, Thanks').then((select) => {
					if (select === 'Sure') {
						this.updateInitScript(getTargetFile);
					}
				});
		}
	}
	
	private targetFileProvider(event: any, operationType: OperationType) : TargetFiles {
		switch(operationType) {
			default :
				return this.getTargetFile(event.files);
		}
	}

	private getTargetFile(files: Array<Uri>): TargetFiles {
		let targetFiles = new TargetFiles();

		files.forEach(file => {
			let analysis = this.analysisFileUri(file);
			if (analysis) {
				targetFiles.pushAddedFile(analysis);
			}
		});

		return targetFiles;
	}

	private async updateInitScript(targetFiles: TargetFiles): Promise<void> {
		console.log(targetFiles.AddedFileMap);
		let workspaceEdit = new WorkspaceEdit();
		let textEdits = Array<TextEdit>();
		
		//let textDocument = await workspace.openTextDocument(targetFiles.AppJsonPath);
		let lineCount = await this.realLineCount(targetFiles.AppJsonPath);
		console.log(lineCount);

		targetFiles.AddedFileMap?.forEach((name) => {
			textEdits.push(TextEdit.insert(new Position(lineCount - 1, 0), `  dynamicCodeMap['${name}'] = init${name};\n`));
			textEdits.push(TextEdit.insert(new Position(0, 0), `import '${name}.dart';\n`));
		});

		workspaceEdit.set(Uri.file(targetFiles.AppJsonPath), textEdits);
		await workspace.applyEdit(workspaceEdit);
		await workspace.saveAll();

		await this.organizeImports(targetFiles.AppJsonPath);
	}

	private async organizeImports(path: string) {
		await vs.commands.executeCommand('_dart.organizeImports', await workspace.openTextDocument(path));
	}

	private async realLineCount(path: string) : Promise<number> {
		let textDocument = await workspace.openTextDocument(path);
		let lineCount: number = textDocument.lineCount;
		console.log(lineCount);
		while(textDocument.lineAt(lineCount - 1).isEmptyOrWhitespace) {
			lineCount--;
		}
		return lineCount;
	}

	private analysisFileUri(fileUri: Uri): AnalysisFileUri | undefined {
		let fsPath: string = fileUri.fsPath;
		let parsedPath = path.parse(fsPath);
		if (parsedPath.ext === '.dart') {
			let initScriptPath = path.resolve(fsPath, '../InitScript.dart');
			if (fs.existsSync(initScriptPath)) {
				return new AnalysisFileUri(initScriptPath,
					parsedPath.dir.split(path.sep).pop() ?? '', parsedPath.name);
			}
		}
	}

	public dispose() {
		this.subscriptions.forEach((s) => s.dispose());
	}
}

class TargetFiles {
	AppJsonPath!: string;
	AddedFileMap!: Array<string>;
	DeletedFileMap!: Map<string, Array<string>>;
	UpdatedFileMap!: Map<string, Array<{ old: string, new: string }>>;

	public pushAddedFile(analysisFileUri: AnalysisFileUri) : void {
		this.AppJsonPath = analysisFileUri.AppJsonPath;
		if (this.AddedFileMap === undefined) {
			this.AddedFileMap = Array<string>();
		}
		this.AddedFileMap?.push(analysisFileUri.Name);
	}

	public isNotEmpty(): boolean {
		return this.AppJsonPath !== undefined && this.AppJsonPath.length > 0 &&
			((this.AddedFileMap !== undefined && this.AddedFileMap.length > 0) ||
			(this.DeletedFileMap !== undefined && this.DeletedFileMap.size > 0) ||
			(this.UpdatedFileMap !== undefined && this.UpdatedFileMap.size > 0));
	}

}

class AnalysisFileUri {
	AppJsonPath!: string;
	Dir!: string;
	Name!: string;

	constructor(AppJsonPath: string, Dir: string, Name: string) {
		this.AppJsonPath = AppJsonPath;
		this.Dir = Dir;
		this.Name = Name;
	}
}

enum OperationType {
	Updated,
	Added,
	Deleted,
}