export class ConflictError extends Error {
  constructor(readonly conflictAttributes: string[]) {
      super(`${conflictAttributes.join(',')} already exists.`);
      this.name = "Conflict Error";
  }
}
