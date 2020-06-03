import Strono from "./src/lib/Strono.ts";
import schemas from './src/schema/index.ts'
import StronoMongo from "./src/lib/StronoMongo.ts";

let options = {
    uri: 'mongodb://localhost:27017',
    db: 'test'
}

let strono = new Strono(schemas, StronoMongo, options)
// console.log(strono.build())
