export class Duplicate {
  constructor(
    public readonly lines: number,
    public readonly fragment: string,
    public readonly firstFile: DuplicateItem,
    public readonly secondFile: DuplicateItem,
  ) { }
}

export class DuplicateItem {
  constructor(
    public readonly name: string,
    public readonly startLoc: DuplicatePosition,
    public readonly endLoc: DuplicatePosition,
  ) { }
}

export class DuplicatePosition {
  constructor(
    public readonly line: number,
    public readonly column: number,
    public readonly position: number,
  ) { }
}