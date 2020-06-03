import { isArray, isString, isObject} from './utils.ts'
import {StronoSchema, Composition, CompositionField} from './interfaces.ts'
const errors = {
    StronoInvalidField : (c: string, f: string, i: any) => {error: `${c} field ${f}: invalid input ${i} provided`}
}

export default class Strono {

    compositions: Composition[] = []
    stronoDBResolver: any

    constructor(schemas: StronoSchema[], stronoDBResolver: any, options: any) {
        this.normalizeSchemaToComposer(schemas)
        this.stronoDBResolver = new stronoDBResolver(options, this.compositions)
    }

    private normalizeSchemaToComposer(schemas: StronoSchema[]){
        schemas.forEach(schema=>{
            let composition_name: string = schema.name
            let composition_field: CompositionField[] = []
            Object.keys(schema.field).forEach((field_name: string)=>{
                let schemaField: any = schema.field[field_name]
                let field: CompositionField = {
                    name: field_name,
                    type: '',
                    many: false,
                    required: false,
                    unique: false,
                    link: false
                }
                // Is it an array
                if(isArray(schemaField)){
                    field["many"] = true
                    if (isObject(schemaField[0])){
                        if(isArray(schemaField[0].type)){
                            field.type = schemaField[0].type[0]
                        }else {
                            field.type = schemaField[0].type
                        }
                        field.many = !!schemaField[0].many
                        field.link = !!schemaField[0].link
                        field.required = !!schemaField[0].required
                        field.unique = !!schemaField[0].unique
                    }else if(isString(schemaField[0])){
                        field.type = schemaField[0]
                    }else {
                        throw errors.StronoInvalidField(composition_name, field_name, schemaField)
                    }
                }else if (isObject(schemaField)){
                    field.many = !!schemaField.many
                    field.link = !!schemaField.link
                    field.required = !!schemaField.required
                    field.unique = !!schemaField.unique

                    if (isArray(schemaField.type)){
                        field = {...field, ...schemaField}
                        field.many = true
                        field.type = schemaField.type[0]
                    }else{
                        field = {...field, ...schemaField}
                    }
                } else if(isString(schemaField)){
                    field.type = schemaField
                }else{
                    throw errors.StronoInvalidField(composition_name, field_name, schemaField)
                }
                composition_field.push(field)
            })
            this.compositions.push({
                name: composition_name,
                field: composition_field
            })
        })
    }

    build(){
        return this.stronoDBResolver.build()
    }
}