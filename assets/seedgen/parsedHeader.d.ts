export type ParsedHeaderParameter = {
  default_value: string;
  documentation?: string;
  identifier: string;
  parameter_type: number;
}

export type ParsedHeader = {
  name: string
  displayName: string
  description: string
  hidden: boolean
  category?: string
  content: string
  parametersByIdentifier: {string: ParsedHeaderParameter}
}
