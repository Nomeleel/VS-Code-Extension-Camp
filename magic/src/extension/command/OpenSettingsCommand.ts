import { commands, workspace } from "vscode";
import { BaseDisposable } from "../BaseDisposable";

export class OpenSettingsCommand extends BaseDisposable {

	constructor() {
		super();
		let settingsKeyArray = this.settingsKeyArray();
		settingsKeyArray.forEach((e) => {
			this.disposables.push(
				commands.registerCommand(`magic.open${e}Settings`, () => this.openSettings(e)),
			);
		});

		this.disposables.push(
			commands.registerCommand(`magic.openSettingsByKey`, this.openSettings),
		);
  }

  private openSettings(key: string) {
		console.log(key);
    // TODO(Nomeleel): 当作常量提取出去
    commands.executeCommand("workbench.action.openSettings", `@ext:Nomeleel.magic ${key}`);
  }

	public settingsKeyArray() : Array<string>{
		let settingsKeyArray = [''];
		let configuration = workspace.getConfiguration('magic');
		for (const key in configuration) {
			if (configuration.has(key)) {
				let sectionKey = this.firstCaseToUpper(key);
				settingsKeyArray.push(sectionKey);
				let subKeys : Object = configuration.get(key) ?? [];
				// TODO(Nomeleel): 配置约束为两级 所以这里这样写 不使用递归
				for (const subKey in subKeys) {
					settingsKeyArray.push(`${sectionKey}${this.firstCaseToUpper(subKey)}`);
				}
			}
		}
		return settingsKeyArray;
	}

	public firstCaseToUpper(str: string) : string {
		return str ? str.replace(str[0], str[0].toUpperCase()) : '';
	}
}
