import StronoDbResolver from "./StronoDbResolver.ts";
import {Composition, CompositionField, Resolver, StronoSchemaField} from "./interfaces.ts";
import {
    MongoClient,
    GraphQLObjectType,
    GraphQLNonNull,
    GraphQLType,
    GraphQLList,
    GraphQLString, GraphQLInt, GraphQLFloat
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
        return collection.findMany(where)
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
            name: 'MongoID',
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

        this.compositions.forEach(composition=>{
            this.createFindOneType(
                composition.name,
                composition,
                async (parent: any, args: any) => await this.findOne(composition.name, args)
            )

            this.RootQuery[composition.name] = this.Types[composition.name]
        })
    }

    createInputType(composition: Composition, resolver: any = (parent: any, args: any)=>{}): void{

    }

    createInputWhereType(composition: Composition, resolver: any = (parent: any, args: any)=>{}): void{

    }

    createFindOneType(name: string, composition: Composition, resolver: any = (parent: any, args: any)=>{}){
        this.Types[name] = new GraphQLObjectType({
            name: name,
            fields: () => {
                console.log('hello field')
                let fields: any = {}
                composition.field.forEach( field =>{
                    let type: any = this.getType(field)
                    if (field.link){
                        if (field.many){
                            let relName = `${composition.name}${capitalize(field.name)}`
                            this.CustomTypes[relName] = GraphQLList(this.getType(field))
                            type = this.CustomTypes[relName]
                        }else{
                            let relName = `${composition.name}${capitalize(field.name)}`
                            this.CustomTypes[relName] = this.getType(field)
                            type = this.CustomTypes[relName]
                        }
                        type = this.getType({
                            type: 'String',
                            name: 'asda',
                            many: false,
                            required: false,
                            link: false,
                            unique: false
                        })
                    }
                    if(field.required) type = GraphQLNonNull(type)
                    if (field.many) type = GraphQLList(type)
                    fields[field.name] = { type }
                })
                return fields
            },
            resolve: resolver
        })
    }

    getType(field: CompositionField){
        return this.Types[field.type]
    }

}