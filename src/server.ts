import { Application } from "https://deno.land/x/oak/mod.ts";
import Strono from "./lib/Strono.ts";
import schemas from "./schema/index.ts";
import StronoMongo from "./lib/StronoMongo.ts";
import { applySchema } from './lib/StronoOak.ts'

const app = new Application();

let dbOptions = {
    uri: 'mongodb://localhost:27017',
    db: 'strono'
}

let strono = new Strono(schemas, StronoMongo, dbOptions)
const GraphQLService = await applySchema({
    path: '/',
    schema: strono.build()
});

app.use(GraphQLService.routes(), GraphQLService.allowedMethods());

console.log("Server start at http://localhost:5000/");
await app.listen({ port: 5000 });
