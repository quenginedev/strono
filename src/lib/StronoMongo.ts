import StronoDbResolver from "./StronoDbResolver.ts";
import {Composition, CompositionField,  StronoSchemaField} from "./interfaces.ts";
import {
    MongoClient,
    GraphQLObjectType,
    GraphQLNonNull,
    GraphQLType,
    GraphQLList,
    GraphQLString, GraphQLInt, GraphQLFloat, GraphQLSchema, GraphQLInputObjectType
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
        let $oid = await collection.insertOne(data).catch((err: any)=>{
            throw {error: err}
        })
        return await this.findOne(collection_name, { _id: $oid})
    }

    async createMany(collection_name: string, data: any[]){
        let collection = this.db.collection(collection_name)
        return await collection.insertMany(data).catch((err: any)=>{
            throw {error: err}
        })
    }

    async findOne(collection_name: string, where: any){
        let collection = this.db.collection(collection_name)
        return collection.findOne(where).catch((err: any)=>{
            throw {error: err}
        })
    }

    async findMany(collection_name: string, where: any[]){
        let collection = this.db.collection(collection_name)
        return collection.find(where).catch((err: any)=>{
            throw {error: err}
        })
    }


    async updateOne(collection_name: string, where: any, data: any){
        let collection = this.db.collection(collection_name)
        await collection.updateOne(where, data)
        return collection.findOne(where).catch((err: any)=>{
            throw {error: err}
        })
    }

    async updateMany(collection_name: string, where: any, data: any){
        let collection = this.db.collection(collection_name)
        let { matchedCount } = await collection.updateMany(where, data).catch((err: any)=>{
            throw {error: err}
        })
        return { count : matchedCount }
    }

    async  deleteOne(collection_name: string, where: any){
        let collection = this.db.collection(collection_name)
        return collection.deleteOne(where).catch((err: any)=>{
            throw {error: err}
        })
    }

    async  deleteMany(collection_name: string, where: any){
        let collection = this.db.collection(collection_name)
        return collection.deleteMany(where).catch((err: any)=>{
            throw {error: err}
        })
    }


    async count(collection_name: string, where: any){
        let collection = this.db.collection(collection_name)
        return collection.count(where).catch((err: any)=>{
            throw {error: err}
        })
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
            this.createInputType(`${composition.name}`, composition, {
                id: true, 
                required: true, 
                postfix: 'Input',
                unique: (collection_name: string, fields: string[]) => {
                    let collection = this.db.collection(collection_name)
                    let keyed_fields: {[field_name: string]: boolean} = {}
                    fields.forEach((field: string)=>{
                        keyed_fields[field] = true
                    })
                    // collection.createIndexes([{
                    //     keys: keyed_fields,
                    //     options: {
                    //         unique: true
                    //     }
                    // }]).catch((err: any)=>{

                    //     console.error(err)
                    // })
                }
            })

            //createWhereInput
            this.createInputType(`${composition.name}`, composition, {id: true, postfix: 'WhereInput'})
        })
    }

    createRootQueries(){
        let queries: any = {}
        let mutations: any = {}

        this.compositions.forEach(composition=>{
            let collection = this.db.collection(composition.name)
            queries[`${composition.name}`] = {
                type: this.getType(composition.name),
                args: { where: { type: GraphQLNonNull(this.getInputType(`${composition.name}WhereInput`)) } },
                resolve: (parent: any, args: any)=>{
                    return this.findOne(composition.name, args.where)
                }
            }

            queries[`${composition.name}Many`] = {
                type: GraphQLList(this.getType(composition.name)) ,
                args: { where: { type: this.getInputType(`${composition.name}WhereInput`) } },
                resolve: (parent: any, args: any)=>{
                    return this.findMany(composition.name, args.where)
                }
            }

            mutations[`create${composition.name}`] = {
                type: this.getType(composition.name),
                args: { data: { type: this.getInputType(`${composition.name}Input`) } },
                resolve: (parent: any, args: any)=>{
                    return this.createOne(composition.name, args.data)
                }
            }
        })

        this.RootQuery = new GraphQLObjectType({
            name: 'Query',
            fields: ()=>queries
        })

        this.RootMutation = new GraphQLObjectType({
            name: 'Mutation',
            fields: ()=>mutations
        })
        
    }
}