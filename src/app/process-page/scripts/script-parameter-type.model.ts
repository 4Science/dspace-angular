/**
 * List of parameter types used for scripts
 */
export enum ScriptParameterType {
  STRING = 'String',
  INTEGER = 'Integer',
  DATE = 'date',
  NUMBER = ScriptParameterType.INTEGER,
  BOOLEAN = 'boolean',
  FILE = 'InputStream',
  OUTPUT = 'OutputStream'
}
