
export default class MongoResolverGenerator{
    
    private compositions : any
    private client : any
    private name: string

    constructor(name: string, compositions: any, mongoClient: any){
        this.name = name
        this.compositions = Object.keys(compositions).map(composition_name=>{
            return {
                name: composition_name,
                fields: compositions[composition_name]
            }
        }) 
        this.client = mongoClient

    }

    private buildRelationResolvers(){
        
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
        let Custom:any = {}
        let Query: any = {}
        let Mutation:any = {}

        Query[`${this.name}Many`] = async (parent: any, args: any, ctx: any, info: any)=>{
            try {
                let user = this.client.collection('users')
                return await user.find()
            }catch (e) {
                console.log(e)
            }

        }

        return {Custom, Query, Mutation}
    }
}