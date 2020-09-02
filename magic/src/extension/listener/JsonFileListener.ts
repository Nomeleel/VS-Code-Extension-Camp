import * as fs from "fs";
import * as path from "path";
import * as vs from "vscode";
import { Uri } from "vscode";

export class JsonFileListener implements vs.Disposable {
	private readonly subscriptions: vs.Disposable[] = [];

	constructor() {
		this.subscriptions.push(vs.workspace.onDidCreateFiles((e) => this.jsonFileChangedHandle(e, OperationType.Added)));

		// 文件移动也算Rename 先删除老的 在增加新的
		// 同路径改名字
		// 文件夹修改 先不考虑
		this.subscriptions.push(vs.workspace.onDidRenameFiles((e) => this.jsonFileChangedHandle(e, OperationType.Updated)));

		this.subscriptions.push(vs.workspace.onDidDeleteFiles((e) => this.jsonFileChangedHandle(e, OperationType.Deleted)));
	}

	private jsonFileChangedHandle(event: any, operationType: OperationType) {
		let getTargetFile = this.targetFileProvider(event, operationType);
		console.log(getTargetFile);
		console.log(getTargetFile.isNotEmpty());
		if (getTargetFile.isNotEmpty()) {
			vs.window.showInformationMessage('😊 😊 😊 Whether to update app.json based on your changes? 😊 😊 😊',
				'Sure', 'No, Thanks').then((select) => {
					if (select === 'Sure') {
						this.updateAppJson(getTargetFile);
					}
				});
		}
	}

	private targetFileProvider(event: any, operationType: OperationType) : TargetFiles{
		switch(operationType) {
			case OperationType.Deleted :
				return this.getTargetFileForDeleate(event.files);
			case OperationType.Updated :
				return this.getTargetFileForUpdate(event.files);
			default :
				return this.getTargetFile(event.files);
		}
	}

	private updateAppJson(targetFiles: TargetFiles): void {
		let appJsonStr = fs.readFileSync(targetFiles.AppJsonPath, 'utf-8');
		let appMap = JSON.parse(appJsonStr);

		targetFiles.AddedFileMap?.forEach((files, dir) => {
			if (appMap[dir] === undefined) {
				appMap[dir] = new Array<string>();
			}
			appMap[dir].push(...files);
		});

		targetFiles.DeletedFileMap?.forEach((files, dir) => {
			appMap[dir] = appMap[dir].filter((vaulue : string) => !files.includes(vaulue));
		});

		targetFiles.UpdatedFileMap?.forEach((files, dir) => {
			if (appMap[dir] === undefined) {
				appMap[dir] = new Array<string>();
			}
			files?.forEach((item) => {
				let index = appMap[dir].indexOf(item.old);
				index === -1 ? appMap[dir].push(item.new) : appMap[dir][index] = item.new;
			});
		});

		let newAppJson = JSON.stringify(appMap, null, '  ');
		console.log(newAppJson);

		fs.writeFile(targetFiles.AppJsonPath, newAppJson, (err) => {
			if (err) {
				vs.window.showErrorMessage('😂 😂 😂 Failed operation, please do it manually. 😂 😂 😂',
					'Copy And Manual', 'Cancel').then((select) => {
						if (select === 'Copy And Manual') {
							// TODO 复制到剪切板
							this.openAppJson(targetFiles.AppJsonPath);
						}
					});
				return;
			}

			vs.window.showInformationMessage('😊 😊 😊 Successfully operation! Whether to check?😊 😊 😊',
				'Double Check', 'I Believe You').then((select) => {
					if (select === 'Double Check') {
						this.openAppJson(targetFiles.AppJsonPath);
					}
				});;

		});
	}

	private analysisFileUri(fileUri: Uri): AnalysisFileUri | undefined {
		let fsPath: string = fileUri.fsPath;
		let parsedPath = path.parse(fsPath);
		if (parsedPath.ext === '.json') {
			let appJsonPath = path.resolve(fsPath, '../../app.json');
			if (fs.existsSync(appJsonPath)) {
				return new AnalysisFileUri(appJsonPath, 
					parsedPath.dir.split(path.sep).pop() ?? '', parsedPath.name);
			}
		}
	}

	// 现在默认都在同一个app.json中，后期需要可添加到多个app.json文件。
	private getTargetFile(files: Array<Uri>): TargetFiles {
		let targetFiles = new TargetFiles();

		files.forEach(file => {
			let analysis = this.analysisFileUri(file);
			if (analysis) {
				targetFiles.pushAddedFileMap(analysis);
			}
		});

		return targetFiles;
	}

	private getTargetFileForDeleate(files: Array<Uri>): TargetFiles {
		let targetFiles = new TargetFiles();

		files.forEach(file => {
			let analysis = this.analysisFileUri(file);
			if (analysis) {
				targetFiles.pushDeletedFileMap(analysis);
			}
		});

		return targetFiles;
	}

	private getTargetFileForUpdate(files: Array<{ oldUri: Uri, newUri: Uri }>): TargetFiles {
		let targetFiles = new TargetFiles();

		files.forEach((item) => {
			let oldAnalysis = this.analysisFileUri(item.oldUri);
			let newAnalysis = this.analysisFileUri(item.newUri);
			if (oldAnalysis && newAnalysis && oldAnalysis.Dir === newAnalysis.Dir) {
				targetFiles.pushUpdateFileMap(oldAnalysis, newAnalysis);
			} else {
				if (oldAnalysis) {
					targetFiles.pushDeletedFileMap(oldAnalysis);
				}
				if (newAnalysis) {
					targetFiles.pushAddedFileMap(newAnalysis);
				}
			}
		});

		return targetFiles;
	}

	private openAppJson(appJsonPath: string): void {
		vs.workspace.openTextDocument(appJsonPath).then((textDocument) => {
			// TODO 定位到添加的地方
			vs.window.showTextDocument(textDocument);
		});
	}

	public dispose() {
		this.subscriptions.forEach((s) => s.dispose());
	}
}

class TargetFiles {
	AppJsonPath!: string;
	AddedFileMap!: Map<string, Array<string>>;
	DeletedFileMap!: Map<string, Array<string>>;
	UpdatedFileMap!: Map<string, Array<{ old: string, new: string }>>;

	public pushAddedFileMap(analysisFileUri: AnalysisFileUri) : void {
		this.AppJsonPath = analysisFileUri.AppJsonPath;
		if (this.AddedFileMap === undefined) {
			this.AddedFileMap = new Map<string, Array<string>>();
		}
		let dir: string = analysisFileUri.Dir;
		if (!this.AddedFileMap.has(dir)) {
			this.AddedFileMap.set(dir, new Array<string>());
		}
		this.AddedFileMap.get(dir)?.push(analysisFileUri.Name);
	}

	public pushDeletedFileMap(analysisFileUri: AnalysisFileUri) : void {
		this.AppJsonPath = analysisFileUri.AppJsonPath;
		if (this.DeletedFileMap === undefined) {
			this.DeletedFileMap = new Map<string, Array<string>>();
		}
		let dir: string = analysisFileUri.Dir;
		if (!this.DeletedFileMap.has(dir)) {
			this.DeletedFileMap.set(dir, new Array<string>());
		}
		this.DeletedFileMap.get(dir)?.push(analysisFileUri.Name);
	}

	public pushUpdateFileMap(oldAnalysisFileUri: AnalysisFileUri, newAnalysisFileUri: AnalysisFileUri) : void {
		this.AppJsonPath = oldAnalysisFileUri.AppJsonPath;
		if (this.UpdatedFileMap === undefined) {
			this.UpdatedFileMap = new Map<string, Array<{ old: string, new: string }>>();
		}
		let dir: string = oldAnalysisFileUri.Dir;
		if (!this.UpdatedFileMap.has(dir)) {
			this.UpdatedFileMap.set(dir, new Array<{ old: string, new: string }>());
		}
		this.UpdatedFileMap.get(dir)?.push({ old: oldAnalysisFileUri.Name, new: newAnalysisFileUri.Name });
	}

	public isNotEmpty(): boolean {
		return this.AppJsonPath !== undefined && this.AppJsonPath.length > 0 &&
			((this.AddedFileMap !== undefined && this.AddedFileMap.size > 0) ||
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