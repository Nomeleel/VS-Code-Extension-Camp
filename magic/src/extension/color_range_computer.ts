import * as vs from "vscode";
import { Range, TextDocument } from "vscode";

export class ColorRangeComputer {
	private readonly materialNameColorPattern = "Colors\\.(?<mc>[\\w_\\[\\]\\.]+)";
	private readonly cupertinoNameColorPattern = "CupertinoColors\\.(?<cc>[\\w_\\[\\]\\.]+)";
	//private readonly colorConstructorPattern = "\\bColor\\(\\s*0x(?<cons>[A-Fa-f0-9]{8}),{0,1}\\s*\\)";
	private readonly colorConstructorPattern1 = "\"#(?<cons>[A-Fa-f0-9]{8}),{0,1}\"";
	private readonly colorConstructorPattern2 = "\"0x(?<cons>[A-Fa-f0-9]{8}),{0,1}\"";
	//private readonly colorConstructorPattern2 = "\\bColor\\(\\s*0x(?<cons>[A-Fa-f0-9]{8}),{0,1}\\s*\\)";
	private readonly colorConstructorRgbo = "\\bColor\\.fromRGBO\\(\\s*(?<rgboR>[\\w_]+),\\s*(?<rgboG>[\\w_]+),\\s*(?<rgboB>[\\w_]+),\\s*(?<rgboA>[\\w_.]+),{0,1}\\s*\\)";
	private readonly colorConstructorArgb = "\\bColor\\.fromARGB\\(\\s*(?<argbA>[\\w_]+),\\s*(?<argbR>[\\w_]+),\\s*(?<argbG>[\\w_]+),\\s*(?<argbB>[\\w_]+),{0,1}\\s*\\)";

	private readonly allColors = [
		this.materialNameColorPattern,
		this.cupertinoNameColorPattern,
		//this.colorConstructorPattern,
		this.colorConstructorPattern1,
		//this.colorConstructorPattern2,
		this.colorConstructorRgbo,
		this.colorConstructorArgb,
	];

	private readonly allColorsPattern = new RegExp(`^.*?(?<range>${this.allColors.join("|")})`, "gm");

	public compute(document: vs.TextDocument): { [key: string]: vs.Range[] } {
		const text = document.getText();

		// Build a map of all possible decorations, with those in this file. We need to include all
		// colors so if any were removed, we will clear their decorations.
		const decs: { [key: string]: vs.Range[] } = {};

		let result: RegExpExecArray | null;
		this.allColorsPattern.lastIndex = -1;

		// tslint:disable-next-line: no-conditional-assignment
		while (result = this.allColorsPattern.exec(text)) {
			if (!result.groups)
				continue;

			let colorHex: string | undefined;

			if (result.groups.cons)
				colorHex = result.groups.cons.toLowerCase();
			else if (result.groups.rgboR && result.groups.rgboG && result.groups.rgboB && result.groups.rgboO)
				colorHex = this.extractRgboColor(result.groups.rgboR, result.groups.rgboG, result.groups.rgboB, result.groups.rgboO);
			else if (result.groups.argbA && result.groups.argbR && result.groups.argbG && result.groups.argbB)
				colorHex = this.extractArgbColor(result.groups.argbA, result.groups.argbR, result.groups.argbG, result.groups.argbB);

			if (colorHex) {
				if (!decs[colorHex])
					decs[colorHex] = [];

				// We can't get the index of the captures yet (https://github.com/tc39/proposal-regexp-match-indices) but we do know
				// - the length of the whole match
				// - the length of the main capture
				// - that the main capture ends at the same point as the whole match
				// Therefore the index we want, is the (match index + match length - capture length).
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

		if (isNaN(a) || isNaN(r) || isNaN(g) || isNaN(b))
			return;

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