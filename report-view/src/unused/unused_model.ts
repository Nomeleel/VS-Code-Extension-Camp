export class Unused {
  constructor(
    public readonly path: string, 
    public readonly issues: Issue[],
  ) {}
}

export class Issue {
  constructor(
    public readonly declarationType: string, 
    public readonly declarationName: string, 
    public readonly column: number, 
    public readonly line: number, 
    public readonly offset: number,
  ) {}
}
