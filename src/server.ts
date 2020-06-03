import { Application } from "https://deno.land/x/oak/mod.ts";
import { applyGraphQL } from "https://deno.land/x/oak_graphql/mod.ts";
import Strono from "./lib/Strono.ts";
import schemas from "./schema/index.ts";
import StronoMongo from "./lib/StronoMongo.ts";

const app = new Application();

let dbOptions = {
    uri: 'mongodb://localhost:27017',
    db: 'test'
}

let strono = new Strono(schemas, StronoMongo, dbOptions)
let {resolvers, typeDefs} = strono.build()
console.log({resolvers, typeDefs}, 'hello')
//
// const GraphQLService = await applyGraphQL({
//     path: '/',
//     resolvers,
//     typeDefs
// });
//
// app.use(GraphQLService.routes(), GraphQLService.allowedMethods());

console.log(strono.build())
console.log("Server start at http://localhost:5000/");
await app.listen({ port: 5000 });
