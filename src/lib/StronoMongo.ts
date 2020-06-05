import StronoDbResolver from "./StronoDbResolver.ts";
import {Composition, CompositionField,  StronoSchemaField} from "./interfaces.ts";
import {
    MongoClient,
    GraphQLObjectType,
    GraphQLNonNull,
    GraphQLType,
    GraphQLList,
    GraphQLString, GraphQLInt, GraphQLFloat, GraphQLSchema
} from '../import/index.ts'
import {camelCase, capitalize, isObject} from "./utils.ts";

export default class StronoMongo extends StronoDbResolver{

    db: any


    constructor(options: any, compositions: Composition[]) {
        super(compositions);
        const client = new MongoClient()
        client.connectWithUri(options.uri)
        this.db = client.database(options.db)
        this.init()
    }

    async createOne(collection_name: string, data: any){
        let collection = this.db.collection(collection_name)
        return await collection.insertOne(data)
    }

    async createMany(collection_name: string, data: any[]){
        let collection = this.db.collection(collection_name)
        return await collection.insertMany(data)
    }

    async findOne(collection_name: string, where: any){
        let collection = this.db.collection(collection_name)
        return collection.findOne(where)
    }

    async findMany(collection_name: string, where: any[]){
        let collection = this.db.collection(collection_name)
        return collection.find(where)
    }


    async updateOne(collection_name: string, where: any, data: any){
        let collection = this.db.collection(collection_name)
        await collection.updateOne(where, data)
        return collection.findOne(where)
    }

    async updateMany(collection_name: string, where: any, data: any){
        let collection = this.db.collection(collection_name)
        let { matchedCount } = await collection.updateMany(where, data)
        return { count : matchedCount }
    }

    async  deleteOne(collection_name: string, where: any){
        let collection = this.db.collection(collection_name)
        return collection.deleteOne(where)
    }

    async  deleteMany(collection_name: string, where: any){
        let collection = this.db.collection(collection_name)
        return collection.deleteMany(where)
    }


    async count(collection_name: string, where: any){
        let collection = this.db.collection(collection_name)
        return collection.count(where)
    }

    init() {
        this.createScalarType({
            name: 'ID',
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
        this.createCompositionTypes()
        this.createRootQueries()
    }

    createCompositionTypes(){
        this.compositions.forEach((composition: Composition)=>{
            //createType
            this.createType(composition.name, composition, {
                single: async (parent: any, args: any, field: CompositionField) => {
                    let where = parent[field.name]
                    return await this.findOne(field.type, where)
                },
                many: async (parent: any, args: any, field: CompositionField) => {
                    let where = parent[field.name]
                    return await this.findMany(field.type, where)
                }
            })

            //createWhereInput
            this.createInputType(`${composition.name}Input`, composition, {id: true})

            //createWhereInput
            this.createInputType(`${composition.name}WhereInput`, composition, {id: true})
        })
    }

    createRootQueries(){
        let queries: any = {}

        this.compositions.forEach(composition=>{
            queries[`${composition.name}One`] = {
                type: this.getType(composition.name),
                args: { where: { type: this.getInputType(`${composition.name}Input`) } },
                resolve: (parent: any, args: any)=>{
                    return this.findOne(composition.name, args.where)
                }
            }

            queries[`${composition.name}Many`] = {
                type: GraphQLList(this.getType(composition.name)) ,
                args: { where: { type: this.getInputType(`${composition.name}Input`) } },
                resolve: (parent: any, args: any)=>{
                    return this.findMany(composition.name, args.where)
                }
            }
        })

        this.RootQuery = new GraphQLObjectType({
            name: 'Query',
            fields: ()=>queries
        })
        
    }
}