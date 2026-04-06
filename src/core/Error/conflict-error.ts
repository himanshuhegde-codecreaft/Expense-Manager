export class ConflictError extends Error {
  constructor(readonly conflictName: string) {
      super(`${conflictName} already exists. Use other ${conflictName}`);
      this.name = "Conflict Error";
      this.conflictName = `${conflictName} Conflict`
  }
}
