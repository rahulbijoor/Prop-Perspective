/// <reference types="vite/client" />

declare module "convex/server" {
  export function defineSchema(schema: any): any;
  export function defineTable(table: any): any;
  export function query(config: any): any;
  export function mutation(config: any): any;
  export function action(config: any): any;
}

declare module "convex/values" {
  export const v: {
    string(): any;
    number(): any;
    boolean(): any;
    optional(validator: any): any;
    id(table: string): any;
  };
}

declare module "./_generated/server" {
  export function query(config: any): any;
  export function mutation(config: any): any;
  export function action(config: any): any;
}
