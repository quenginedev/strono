import { isArray, isString, isObject, camelCase, objectId } from './utils.ts'
import MongoResolverGenerator from './MongoResolverGenerator.ts'
import {
    GraphQLScalarType,
    GraphQLInputType
}  from "../import/index.ts";



interface SchemaType {
    name: string,
    fields: {},
    relations? : []
}

interface CompositionField { 
    many: boolean, 
    type: string, 
    required: boolean, 
    unique: boolean, 
    link: boolean 
}


class Composer {
    private db : any
    private Schema: any = {}
    private Composition: any = {}
    private typeDefs: String = ''
    private resolvers: any = {
        Query : {},
        // Mutation: {}
    }

    constructor(schemas: SchemaType[] , client_db: any){
        this.db = client_db
        this.addManySchema(schemas)
        this.init()
    }

    init(){

        // Creating a mongo ID Scalar type
        this.addToTypeDefs(`
scalar MongoID
scalar AND
scalar NOT
scalar OR
`)

        this.setupScalars()
        this.setupCompositions()
        let query = ''
        let mutation = ''
        Object.keys(this.Composition).forEach(c_name=>{
            let composition = this.Composition[c_name]            
            this.generateTypeDef(c_name,  composition)
            this.generateResolver(c_name,  composition)
            query += 
`
    ${c_name} (where: ${c_name}WhereUniqueInput!) :${c_name}
    ${c_name}Many (where: ${c_name}WhereInput) : [${c_name}]
`
            mutation += 
`
    create${c_name} (data: ${c_name}DataInput!): ${c_name}
`

        })
        this.addToTypeDefs(`
type Query {
    ${query}
}

type Mutation {
    ${mutation}
}
        `)
    }

    setupScalars(){
        this.resolvers.MongoID = new GraphQLScalarType({
            name: "MongoID",
            description: "MongoDB ID",
            serialize: (value: { $oid: string }) =>{
                if(!isObject(value)) return null
                return value.$oid
            },
            parseValue: (value: string) =>{
                if (/^[0-9a-fA-F]{24}$/.test(value)){
                    return { $oid: value }
                }else{
                    return null
                }
            }
        })
        this.resolvers.AND = new GraphQLScalarType({
            name: "AND",
            description: "Logical AND on filters",
            parseValue: (value: string) =>{
                return { $and: value }
            }
        })
        this.resolvers.NOT = new GraphQLScalarType({
            name: "NOT",
            description: "Logical NOT on filters",
            parseValue: (value: string) =>{
                return { $ne: value }
            }
        })
        this.resolvers.OR = new GraphQLScalarType({
            name: "OR",
            description: "Logical OR on filters",
            parseValue: (value: string) =>{
                return { $or: value }
            }
        })

    }
    
    addManySchema(schemas: SchemaType[]){
        schemas.forEach(schema => {
            this.addSchema(schema)
        })
    }


    private setupCompositions(){
        Object.keys(this.Schema).forEach(schema_name=>{
            let fields = this.Schema[schema_name].fields
            this.Composition[schema_name] = {}
            Object.keys(fields).forEach(field_name=>{
                let field = fields[field_name]
                let composition = {
                    many: false,
                    type: '',
                    required: false,
                    unique: false,
                    link: false
                }
                composition.many = isArray(field)
                if(!composition.many){
                    composition = this.createComposition(field, composition)
                }else{
                    composition = this.createComposition(field[0], composition)
                }
                this.Composition[schema_name][field_name] = composition
            })
        })
    }

    private generateTypeDef(c_name: string, composition: any){
        let c_output = '_id: MongoID '
        // let c_connection = ''
        let c_where_input = '_id: MongoID '
        let c_data_input = ''
        // let c_order_by_input = ''
        let c_where_unique_input = '_id: MongoID '
        let links: string[] = []

        Object.keys(composition).forEach(f_name=>{
            let field = composition[f_name]
            let type = field.type
            let output = field.type

            if (field.unique) {
                c_where_unique_input += `${f_name}: ${type}
    `
            }

            if (field.link){
                this.addToTypeDefs(`input ${composition[f_name].type}Without${c_name}Input {
    connect : ${c_name}${composition[f_name].type}ConnectInput
    create : ${c_name}${composition[f_name].type}CreateInput
}`)

                links.push(composition[f_name].type)
                c_where_input += `
                AND
                ${f_name}: ${type}WhereInput 
    `
                type = `${composition[f_name].type}Without${c_name}Input`
            }else{
                c_where_input += `${f_name}: ${type}
    `
            }

            
            if (field.required) {
                type += '!'
            }

            if (field.many) {
                type = `[${type}]`
                output = `[${output}!]!`
            }

            c_data_input += `${f_name}: ${type} 
    `
            c_output += `${f_name}: ${output}
    `
        })

        

        this.addToTypeDefs(`

type ${c_name} {
    ${c_output}
}

input ${c_name}DataInput{
    ${c_data_input}
}

input ${c_name}WhereInput{
    ${c_where_input}
}

input ${c_name}WhereUniqueInput{
    ${c_where_unique_input}
}
        `)

        links.forEach(link=>{
            this.addToTypeDefs(`
input ${c_name}${link}ConnectInput{
    ${c_where_unique_input}
}

input ${c_name}${link}CreateInput{
    ${c_data_input}
}
            `)
        })

    }

    private generateResolver(name: string, composition: CompositionField){
        let dbResolver = new MongoResolverGenerator(name, composition, this.db)
        let {Custom, Query, Mutation} = dbResolver.buildResolvers()
        console.log({Custom})
        this.resolvers = {...this.resolvers, ...Custom}
        this.resolvers.Query = {...this.resolvers.Query, ...Query}
        this.resolvers.Mutation = {...this.resolvers.Mutation, ...Mutation}
    }

    createComposition(field: any, composition: CompositionField){
        if(isObject(field)){

            isArray(field.type) ?
                (composition.type = field.type[0], composition.many = true):
                composition.type = field.type

            composition.required = field.required ? true : false
            composition.unique = field.unique ? true : false
            composition.link = field.link ? true : false
        }else if(isString(field)){
            composition.type = field
        }
        return composition
    }

    addSchema(schema: SchemaType){
        this.Schema[schema.name] = {
            fields : schema.fields || {},
            relations: schema.relations || []
        }
    }


    buildSchema(){
        let build = {
            typeDefs: this.typeDefs,
            resolvers: this.resolvers
        }
        // console.log(this.Composition,this.typeDefs);
        console.log(this.resolvers)


        return build
    }

    private addToTypeDefs(typeDef: string){
        this.typeDefs += `
${typeDef}

`
    }


    
}

export {
    Composer,
    SchemaType
}