import {GraphQLInt, GraphQLObjectType, GraphQLString, GraphQLList} from "../import/index.ts";

interface StronoSchemaObjectField {
    type?: string | string[],
    required?: boolean,
    unique?: boolean,
    link?: boolean
}

export interface StronoSchemaField {
    [key: string]: StronoSchemaObjectField | [ StronoSchemaObjectField | string] | string
}

export interface StronoSchema {
    name: string,
    field: StronoSchemaField
}

export interface Composition {
    name: string,
    fields: CompositionField[]
}

export interface CompositionField {
    name: string
    type: string,
    many: boolean,
    required: boolean,
    unique: boolean,
    link: boolean
}

export interface GQLType {
    [key: string]: {
        type: GraphQLObjectType | GraphQLString | GraphQLInt | GraphQLList
    },
}
export interface GQLInputType {
    [key: string]: {
        type: GraphQLObjectType | GraphQLString | GraphQLInt | GraphQLList
        args?: {
            [key: string] : any
        }
    },
}