import {objectId} from './src/lib/utils.ts'
// import {MongoClient} from "./src/import";
let test = /^[0-9a-fA-F]{24}$/.test(objectId())
console.log(test)