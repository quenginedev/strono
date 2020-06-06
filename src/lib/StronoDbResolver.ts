import {Composition, CompositionField} from './interfaces.ts'
import {
    GraphQLID,
    GraphQLType,
    GraphQLFloat,
    GraphQLScalarType,
    GraphQLInputObjectType,
    GraphQLObjectType,
    GraphQLOutputType,
    GraphQLString,
    GraphQLSchema,
    GraphQLInt, GraphQLNonNull, GraphQLList

} from "../import/index.ts";

export default class StronoDbResolver {

    compositions: Composition[]
    Types: {
        [key: string] : any
    } = {
        'ID' : GraphQLID,
        'String': GraphQLString,
        'Int': GraphQLInt,
        'Float': GraphQLFloat,
    }

    InputTypes: {
        [key: string] : any
    } = {
        'ID' : GraphQLID,
        'String': GraphQLString,
        'Int': GraphQLInt,
        'Float': GraphQLFloat,
    }

    RootQuery: any = {}
    RootMutation: any = {}

    constructor(compositions: Composition[]) {
        this.compositions = compositions
    }

    getType(field: string){
        return this.Types[field]
    }

    getInputType(field: string){
        return this.InputTypes[field]
    }

    createIndexes(collection_name: string,  fields: string[]){

    }

    createScalarType(type: {
        name: string,
        serialize?: any,
        parseValue?: any,
        parseLiteral?: any
    }){
        this.Types[type.name] = this.InputTypes[type.name] = new GraphQLScalarType({
            name: type.name,
            serialize: type.serialize,
            parseValue: type.parseValue,
        })
    }

    createType( name: string, composition: Composition, linkResolvers: {
        single: (parent: any, args: any, field: CompositionField) => any ,
        many: (parent: any, args: any, field: CompositionField) => any
    }){
        this.Types[name] = new GraphQLObjectType({
            name,
            description: `${name}`,
            fields: ()=>{
                let result: {
                    [name: string] : { type: any, resolve?:  (parent?: any, args?: any)=>{} }
                } = {
                    _id: {type: this.getType('ID')}
                }
                composition.fields.forEach((field: CompositionField) => {
                    let type = this.getType(field.type)
                    type = field.many ? GraphQLList(type) : type
                    result[field.name] =  { type } 
                    if(field.link){
                        let resolve: any
                        if(field.many){
                            resolve = async (parent: any, args: any) => {
                                return await linkResolvers.many(parent, args, field)
                            }
                        }else{
                            resolve = async (parent: any, args: any) => {
                                return await linkResolvers.single(parent, args, field)
                            }
                        }
                        result[field.name].resolve = resolve
                    }
                })
                return result
            }
        })
    }

    createInputType(name: string, composition: Composition,  checks: {
        postfix?: string,
        id?: boolean,
        unique?: (collection_name: string, fields: string[])=>void,
        required?: boolean,
    } = {
        postfix: '',
        id: false,
        unique: ()=>{},
        required: false,
    }){
        
        this.InputTypes[`${name}${checks.postfix}`] = new GraphQLInputObjectType({
            name: `${name}${checks.postfix}`,
            description: `${name}${checks.postfix}`,
            fields: () => {
                let unique_fields: string[] = []
                let result: {
                    [name: string] : { type: any, resolve?:  (parent?: any, args?: any)=>{} }
                } =  checks.id ? {} : { _id: { type: this.getInputType('ID') } }

                composition.fields.forEach((field: CompositionField) => {

                    let type = field.link ?  
                        this.getInputType(`${field.type}${checks.postfix}`) :  
                        this.getInputType(field.type)  
                    
                    if(checks.required && field.required){
                        type = GraphQLNonNull(type)
                    }

                    if(field.many){
                        type = GraphQLList(type)
                    }

                    if(checks.unique && field.unique){
                        unique_fields.push(field.name)
                    }
                    result[field.name] = { type } 
                    
                })
                // create unique indexes
                if(checks.unique)
                    checks.unique(composition.name, unique_fields)

                return result
            }
        })
    }


    build(){
        // const User = new GraphQLObjectType({
        //     name: 'User',
        //     description: 'User',
        //     fields: ()=>({
        //         name: {
        //             type: GraphQLString
        //         },
        //         age: {
        //             type: GraphQLInt
        //         }
        //     })
        // })
        //
        // const UserWhereInput = new GraphQLInputObjectType({
        //     name: 'UserWhereInput',
        //     description: 'User Where Input Field',
        //     fields: ()=>({
        //         name: {
        //             type: GraphQLNonNull(GraphQLString)
        //         },
        //         age: {
        //             type: GraphQLInt
        //         }
        //     })
        // })
        //
        let build = new GraphQLSchema({
        //     query: new GraphQLObjectType({
        //         name: 'Query',
        //         fields: {
        //             hello: {
        //                 type: GraphQLString,
        //                 resolve: ()=> 'Hello word'
        //             },
        //             user:  {
        //                 type: User,
        //                 args: {
        //                     where : {
        //                         name: 'UserWhereInput',
        //                         type: UserWhereInput,
        //
        //                     }
        //                 },
        //                 resolve: (parent: any, args: any)=>({
        //                     name: args.where.name,
        //                     age: args.where.age
        //                 })
        //             }
        //         }
        //     })
            query: this.RootQuery,
            mutation: this.RootMutation
        })
        return build
    }
}