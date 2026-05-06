export type FieldType =
  | "string"
  | "number"
  | "boolean"
  | "text"
  | "password"
  | "datetime"
  | "relation";

export type RelationConfig = {
  model: string;
  labelField: string;
};

export type FieldConfig = {
  name: string;
  type: FieldType;
  optional?: boolean;
  relation?: RelationConfig;
};
