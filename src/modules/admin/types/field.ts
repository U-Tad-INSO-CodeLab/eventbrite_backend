export type FieldType =
  | "string"
  | "number"
  | "boolean"
  | "text"
  | "password"
  | "datetime";

export type FieldConfig = {
  name: string;
  type: FieldType;
  optional?: boolean;
};
