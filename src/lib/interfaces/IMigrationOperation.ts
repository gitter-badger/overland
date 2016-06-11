export interface IMigrationOperation {
  execute(operand: any): void;
}
