import * as vs from "vscode";
import { Range, TextDocument } from "vscode";

export class ColorRangeComputer {
	private readonly colorARGBPattern = "(?<=(\"|,))(#|0x|0X)(?<cons>[A-Fa-f0-9]{8})(?=(\"|,))";

	private readonly allColors = [
		this.colorARGBPattern
	];

	private readonly allColorsPattern = new RegExp(`(\"|,)(?<range>${this.allColors.join("|")})`, "gm");

	public compute(document: vs.TextDocument): { [key: string]: vs.Range[] } {
		const text = document.getText();

		const decs: { [key: string]: vs.Range[] } = {};

		let result: RegExpExecArray | null;
		this.allColorsPattern.lastIndex = -1;

		while (result = this.allColorsPattern.exec(text)) {
			if (!result.groups) {
				continue;
			}

			let colorHex: string | undefined;

			if (result.groups.cons) {
				colorHex = result.groups.cons.toLowerCase();
				
				if (!decs[colorHex]) {
					decs[colorHex] = [];
				}

				const index = result.index + result[0].length - result.groups!.range.length;

				decs[colorHex].push(toRange(document, index, result.groups!.range.length));
			}
		}

		return decs;
	}

	private extractRgboColor(inputR: string, inputG: string, inputB: string, inputO: string): string | undefined {
		const r = parseInt(inputR);
		const g = parseInt(inputG);
		const b = parseInt(inputB);
		const opacity = parseFloat(inputO);

		if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(opacity)) {
			return;
		}

		return asHexColor({ r, g, b, a: opacity * 255 });
	}

	private extractArgbColor(inputA: string, inputR: string, inputG: string, inputB: string) {
		const a = parseInt(inputA);
		const r = parseInt(inputR);
		const g = parseInt(inputG);
		const b = parseInt(inputB);

		if (isNaN(a) || isNaN(r) || isNaN(g) || isNaN(b)) {
			return;
		}

		return asHexColor({ a, r, g, b });
	}
}


export function asHexColor({ r, g, b, a }: { r: number, g: number, b: number, a: number }): string {
	r = clamp(r, 0, 255);
	g = clamp(g, 0, 255);
	b = clamp(b, 0, 255);
	a = clamp(a, 0, 255);

	return `${asHex(a)}${asHex(r)}${asHex(g)}${asHex(b)}`.toLowerCase();
}

export function clamp(v: number, min: number, max: number) {
	return Math.min(Math.max(min, v), max);
}

export function asHex(v: number) {
	return Math.round(v).toString(16).padStart(2, "0");
}

export function toRange(document: TextDocument, offset: number, length: number): Range {
	return new Range(document.positionAt(offset), document.positionAt(offset + length));
}