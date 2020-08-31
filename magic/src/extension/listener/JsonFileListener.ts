import * as fs from "fs";
import * as path from "path";
import * as vs from "vscode";
import { Uri } from "vscode";

export class JsonFileListener implements vs.Disposable {
	private readonly subscriptions: vs.Disposable[] = [];

	private readonly decorationTypes: { [key: string]: vs.TextEditorDecorationType } = {};

	constructor() {
		this.subscriptions.push(vs.workspace.onDidCreateFiles((e) => {
			let getTargetFile = this.getTargetFile(e.files);

			if (getTargetFile.isNotEmpty()) {
				vs.window.showInformationMessage('😊 😊 😊 Whether to add newly added files to app.json? 😊 😊 😊', 
					'Sure', 'No, Thanks').then((select) => {
						if (select === 'Sure') {
							this.addInAppJson(getTargetFile);
						}
					});
			}
		}));

		this.subscriptions.push(vs.workspace.onDidRenameFiles((e) => {
			// 文件移动也算Rename 先删除老的 在增加新的
			// 同路径改名字
			// 文件夹修改 先不考虑
			vs.window.showInformationMessage('onDidRenameFiles');
		}));

		this.subscriptions.push(vs.workspace.onDidDeleteFiles((e) => {
			vs.window.showInformationMessage('onDidDeleteFiles');
		}));

	}

	// 正则方式 /"page":\s*\[\s*("\S*",?)*\s*\]/g 貌似这个匹配不了
	private addInAppJson(targetFiles: TargetFiles) : void {
		let appJsonStr = fs.readFileSync(targetFiles.appJsonPath, 'utf-8');
		let appMap = JSON.parse(appJsonStr);
		targetFiles.fileMap.forEach((files, dir) => {
			if (appMap[dir] === undefined) {
				appMap[dir] = new Array<string>();
			}
			appMap[dir].push(...files);
		});

		let newAppJson = JSON.stringify(appMap, null, '  ');
		console.log(newAppJson);

		fs.writeFile(targetFiles.appJsonPath, newAppJson, (err) => {
			if (err) {
				vs.window.showErrorMessage('😂 😂 😂 Added failed, please add manually. 😂 😂 😂', 
					'Copy And Manual', 'Cancel').then((select) => {
						if (select === 'Copy And Manual') {
							// TODO 复制到剪切板
							this.openAppJson(targetFiles.appJsonPath);
						}
				});
				return;
			}

			vs.window.showInformationMessage('😊 😊 😊 Added successfully! Whether to check?😊 😊 😊', 
				'Double Check', 'I Believe You').then((select) => {
					if (select === 'Double Check') {
						this.openAppJson(targetFiles.appJsonPath);
					}
			});;

		});
	}

	// 现在默认都在同一个app.json中，后期需要可添加到多个app.json文件。
	private getTargetFile(files: ReadonlyArray<Uri>): TargetFiles {
		let targetFiles = new TargetFiles();

		files.forEach(file => {
			let fsPath: string = file.fsPath;
			let parsedPath = path.parse(fsPath);
			if (parsedPath.ext === '.json') {
				let appJsonPath = path.resolve(fsPath, '../../app.json');
				if (fs.existsSync(appJsonPath)) {
					targetFiles.appJsonPath = appJsonPath;
					if (targetFiles.fileMap === undefined) {
						targetFiles.fileMap = new Map<string, Array<string>>();
					}
					let dir: string = parsedPath.dir.split(path.sep).pop() ?? '';
					if (!targetFiles.fileMap.has(dir)) {
						targetFiles.fileMap.set(dir, new Array<string>());
					}
					targetFiles.fileMap.get(dir)?.push(parsedPath.name);
					console.log(targetFiles.fileMap.get(dir));
				}
			}
		});

		return targetFiles;
	}

	private openAppJson(appJsonPath: string) : void {
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
	fileMap!: Map<string, Array<string>>;

	public isNotEmpty(): boolean {
		return this.appJsonPath !== undefined && this.appJsonPath.length > 0 &&
			this.fileMap !== undefined && this.fileMap.size > 0;
	}

}