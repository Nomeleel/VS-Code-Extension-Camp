import * as vs from "vscode";
import { FieldItem } from "../provider/FieldOutlineProvider";
import { getConfiguration, setGlobalConfiguration } from "../util/util";

export class OutlineFieldSortCommand implements vs.Disposable {
	private disposables: vs.Disposable[] = [];
	private configKey: string = 'magic.outline.fieldArray';

	constructor() {
		this.disposables.push(
			vs.commands.registerCommand("magic.outlineFieldUp", this.up, this),
			vs.commands.registerCommand("magic.outlineFieldDown", this.down, this),
		);
  }

  private up(fieldItem: FieldItem) {
		this.move(fieldItem, -1);
  }

  private down(fieldItem: FieldItem) {
		this.move(fieldItem, 1);
  }

	private indexOf(fieldItem: FieldItem, fieldArray: Array<string>) : number {
		let field = [fieldItem.label, fieldItem.description].filter(e => e).join('/');
		return fieldArray.indexOf(field);
	}

  private move(fieldItem: FieldItem, moveLength: number) {
		let fieldArray = getConfiguration<Array<string>>(this.configKey);
		let index = this.indexOf(fieldItem, fieldArray);
		if (index !== -1) {
			index += moveLength;
			if (index >= 0 && index < fieldArray.length) {
				let target = fieldArray[index];
				fieldArray[index] = fieldArray[index - moveLength];
				fieldArray[index - moveLength] = target;
				setGlobalConfiguration<Array<string>>(this.configKey, fieldArray);
			}
		}
  }

  public dispose(): any {
		this.disposables.forEach((e) => e.dispose());
	}
}