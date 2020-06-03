import { Composition, Resolver } from './interfaces.ts'
import {
    GraphQLType,
    GraphQLFloat,
    GraphQLScalarType,
    GraphQLInputType,
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLInt

} from "../import/index.ts";

export default class StronoDbResolver {

    compositions: Composition[]
    Types: {
        [key: string] : any
    } = {
        'String': GraphQLString,
        'Int': GraphQLInt,
        'Float': GraphQLFloat,
    }
    RootQuery: any = {}
    CustomTypes: any = {}

    constructor(compositions: Composition[]) {
        this.compositions = compositions
    }

    createScalarType(type: {
        name: string,
        serialize?: any,
        parseValue?: any,
        parseLiteral?: any
    }){
        return new GraphQLScalarType({
            name: type.name,
            serialize: type.serialize,
            parseValue: type.parseValue,
        })
    }



    build(){
        let build = {
            ...this.CustomTypes,
            Query: this.RootQuery
        }
        return new GraphQLSchema(build)
    }
}