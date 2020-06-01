
export default class MongoResolverGenerator{
    
    private compositions : any
    private client : any
    private resolvers: any = {}


    constructor(compositions: any, mongoClient: any){
        this.compositions = Object.keys(compositions).map(composition_name=>{
            return {
                name: composition_name,
                fields: compositions[composition_name]
            }
        }) 
        this.client = mongoClient
    }

    private getRelationsReolvers(){
        
    }

    findMany(composition_name: string, where: {} = {}){
        let collection = this.client.collection(composition_name)
        
    }
    findOne(composition_name: string, where: {} = {}){}
    findOneById(composition_name: string, id: string){}
    findManyByIds(composition_name: string, ids: string[]){}
    createOne(composition_name: string, data: {} = {}){}
    createMany(composition_name: string, data: [] = []){}
    update(composition_name: string, where: {} = {}, data: {}){}
    remove(composition_name: string, where: {} = {}){}

    buildResolvers(){
        this.resolvers.Query = {}
        this.resolvers.Mutation = {}
        this.compositions.forEach((composition: any)=>{

            this.resolvers.Query[composition.name] = async (parent: any, args: any, ctx: any, info: any)=>{
                let user = this.client.collection('users')
                return await user.find()
            }

        })
        return this.resolvers
    }
}