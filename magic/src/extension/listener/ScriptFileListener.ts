import * as fs from "fs";
import * as path from "path";
import * as vs from "vscode";
import { Uri } from "vscode";

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

	}

	public dispose() {
		this.subscriptions.forEach((s) => s.dispose());
	}
}

enum OperationType {
	Updated,
	Added,
	Deleted,
}