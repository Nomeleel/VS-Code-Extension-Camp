import { commands, Disposable, workspace } from "vscode";
import { firstCaseToUpper } from "../util/util";

export class OpenSettingsCommand implements Disposable {
	private disposables: Disposable[] = [];

	constructor() {
		let settingsKeyArray = this.settingsKeyArray();
		settingsKeyArray.forEach((e) => {
			this.disposables.push(
				commands.registerCommand(`vscbox.open${e}Settings`, () => this.openSettings(e)),
			);
		});
	}

	private openSettings(key: string) {
		console.log(key);
		// TODO(Nomeleel): 当作常量提取出去
		commands.executeCommand("workbench.action.openSettings", `@ext:Nomeleel.vscbox ${key}`);
	}

	public settingsKeyArray(): Array<string> {
		let settingsKeyArray = [''];
		let configuration = workspace.getConfiguration('vscbox');
		for (const key in configuration) {
			if (configuration.has(key)) {
				let sectionKey = firstCaseToUpper(key);
				settingsKeyArray.push(sectionKey);
				let subKeys: Object = configuration.get(key) ?? [];
				// TODO(Nomeleel): 配置约束为两级 所以这里这样写 不使用递归
				for (const subKey in subKeys) {
					settingsKeyArray.push(`${sectionKey}${firstCaseToUpper(subKey)}`);
				}
			}
		}
		return settingsKeyArray;
	}

	public dispose(): any {
		this.disposables.forEach((e) => e.dispose());
	}
}
