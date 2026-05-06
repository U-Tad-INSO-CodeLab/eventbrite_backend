export type FieldType =
  | "string"
  | "number"
  | "boolean"
  | "text"
  | "password"
  | "datetime"
  | "relation"
  | "enum";

export type RelationConfig = {
  model: string;
  labelField: string;
};

export type FieldConfig = {
  name: string;
  type: FieldType;
  optional?: boolean;
  relation?: RelationConfig;
  /** Prisma enum string values (e.g. Object.values(UserType)) */
  enumValues?: string[];
};
