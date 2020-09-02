import * as fs from "fs";
import * as path from "path";
import * as vs from "vscode";
import { Uri } from "vscode";

export class JsonFileListener implements vs.Disposable {
	private readonly subscriptions: vs.Disposable[] = [];

	private readonly decorationTypes: { [key: string]: vs.TextEditorDecorationType } = {};

	constructor() {
		this.subscriptions.push(vs.workspace.onDidCreateFiles((e) => this.jsonFileChangedHandle(e, OperationType.Added)));

		this.subscriptions.push(vs.workspace.onDidRenameFiles((e) => {
			// 文件移动也算Rename 先删除老的 在增加新的
			// 同路径改名字
			// 文件夹修改 先不考虑
			vs.window.showInformationMessage('onDidRenameFiles');
			this.jsonFileChangedHandle(e, OperationType.Updated);
		}));

		this.subscriptions.push(vs.workspace.onDidDeleteFiles((e) => this.jsonFileChangedHandle(e, OperationType.Deleted)));
	}

	private jsonFileChangedHandle(event: any, operationType: OperationType) {
		let getTargetFile = this.targetFileProvider(event, operationType);
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

	// 正则方式 /"page":\s*\[\s*("\S*",?)*\s*\]/g 貌似这个匹配不了
	private updateAppJson(targetFiles: TargetFiles): void {
		let appJsonStr = fs.readFileSync(targetFiles.appJsonPath, 'utf-8');
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

		});

		let newAppJson = JSON.stringify(appMap, null, '  ');
		console.log(newAppJson);

		fs.writeFile(targetFiles.appJsonPath, newAppJson, (err) => {
			if (err) {
				vs.window.showErrorMessage('😂 😂 😂 Failed operation, please do it manually. 😂 😂 😂',
					'Copy And Manual', 'Cancel').then((select) => {
						if (select === 'Copy And Manual') {
							// TODO 复制到剪切板
							this.openAppJson(targetFiles.appJsonPath);
						}
					});
				return;
			}

			vs.window.showInformationMessage('😊 😊 😊 Successfully operation! Whether to check?😊 😊 😊',
				'Double Check', 'I Believe You').then((select) => {
					if (select === 'Double Check') {
						this.openAppJson(targetFiles.appJsonPath);
					}
				});;

		});
	}

	private analysisFileUri(fileUri: Uri): { appJsonPath: string, dir: string, name: string } | undefined {
		let fsPath: string = fileUri.fsPath;
		let parsedPath = path.parse(fsPath);
		if (parsedPath.ext === '.json') {
			let appJsonPath = path.resolve(fsPath, '../../app.json');
			if (fs.existsSync(appJsonPath)) {
				return {
					appJsonPath: appJsonPath,
					dir: parsedPath.dir.split(path.sep).pop() ?? '',
					name: parsedPath.name,
				};
			}
		}
	}

	// 现在默认都在同一个app.json中，后期需要可添加到多个app.json文件。
	private getTargetFile(files: Array<Uri>): TargetFiles {
		let targetFiles = new TargetFiles();

		files.forEach(file => {
			let analysis = this.analysisFileUri(file);
			if (analysis) {
				targetFiles.appJsonPath = analysis.appJsonPath;
				if (targetFiles.AddedFileMap === undefined) {
					targetFiles.AddedFileMap = new Map<string, Array<string>>();
				}
				let dir: string = analysis.dir;
				if (!targetFiles.AddedFileMap.has(dir)) {
					targetFiles.AddedFileMap.set(dir, new Array<string>());
				}
				targetFiles.AddedFileMap.get(dir)?.push(analysis.name);
				console.log(targetFiles.AddedFileMap.get(dir));
			}
		});

		return targetFiles;
	}

	private getTargetFileForDeleate(files: Array<Uri>): TargetFiles {
		let targetFiles = new TargetFiles();

		files.forEach(file => {
			let analysis = this.analysisFileUri(file);
			if (analysis) {
				targetFiles.appJsonPath = analysis.appJsonPath;
				if (targetFiles.DeletedFileMap === undefined) {
					targetFiles.DeletedFileMap = new Map<string, Array<string>>();
				}
				let dir: string = analysis.dir;
				if (!targetFiles.DeletedFileMap.has(dir)) {
					targetFiles.DeletedFileMap.set(dir, new Array<string>());
				}
				targetFiles.DeletedFileMap.get(dir)?.push(analysis.name);
				console.log(targetFiles.DeletedFileMap.get(dir));
			}
		});

		return targetFiles;
	}

	private getTargetFileForUpdate(files: Array<{ oldUri: Uri, newUri: Uri }>): TargetFiles {
		console.log('--update--');
		return new TargetFiles();
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
	appJsonPath!: string;
	AddedFileMap!: Map<string, Array<string>>;
	DeletedFileMap!: Map<string, Array<string>>;
	UpdatedFileMap!: Map<string, Array<{ old: string, new: string }>>;

	public isNotEmpty(): boolean {
		return this.appJsonPath !== undefined && this.appJsonPath.length > 0 &&
			((this.AddedFileMap !== undefined && this.AddedFileMap.size > 0) ||
			(this.DeletedFileMap !== undefined && this.DeletedFileMap.size > 0) ||
			(this.UpdatedFileMap !== undefined && this.UpdatedFileMap.size > 0));
	}

}

enum OperationType {
	Updated,
	Added,
	Deleted,
}