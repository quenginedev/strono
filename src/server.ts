import { MongoClient } from 'https://deno.land/x/mongo@v0.7.0/mod.ts';
import { Application } from "https://deno.land/x/oak/mod.ts";
import { applyGraphQL, gql } from "https://deno.land/x/oak_graphql/mod.ts";
import {Composer} from './lib/composer.class.ts'
import schema from './index.ts'

const client = new MongoClient()
client.connectWithUri('mongodb://localhost:27017')
const db = client.database("lyfeaid")

const app = new Application();

// const users = [
//     { name: "Ernest"}
// ] 


// const typeDefs = gql`
//   type User {
//     name: String
//   }

//   type Query {
//       getUsers: [User]
//   }
// `

// const resolvers = {
//     Query: {
//         getUsers: (parent: any, args: any, context: any, info: any) => {
//             console.log('hello')
//             return users;
//         },
//     },
// };
const composer = new Composer(schema, db)
const { resolvers, typeDefs } = composer.buildSchema()

const GraphQLService = await applyGraphQL({
    path: '/',
    resolvers,
    typeDefs
});

app.use(GraphQLService.routes(), GraphQLService.allowedMethods());

console.log("Server start at http://localhost:5000/");
await app.listen({ port: 5000 });
