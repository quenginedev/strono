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
    field: CompositionField[]
}

export interface CompositionField {
    name: string
    type: string,
    many: boolean,
    required: boolean,
    unique: boolean,
    link: boolean
}

export interface Resolver {
    [key: string]: any,
    Query: {
        [key: string]: any,
    },
    Mutation: {
        [key: string]: any,
    }
}