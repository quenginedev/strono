import { Composer, SchemaType } from './lib/composer.class.ts'
const user: SchemaType = {
    name: "User",
    fields: {
        email: {
            type: 'String',
            required: true,
            unique: true,
        },
        phoneNumber: {
            type: 'String',
            required: true,
        },
        name: { 
            type: 'String', 
            required: true, 
        },
        age: 'Int',
        pets: {
            type: ['Pet'],
            link: true,
        }
    }
}

const pet: SchemaType = {
    name: "Pet",
    fields: {
        name: {
            type: 'String',
            required: true,
        },
        age: 'Int',
        user: {
            type: 'User',
            link: true
        }
    }
}

const home: SchemaType = {
    name: "Home",
    fields: {
        address: 'String',
        office_box: {
            type: 'String',
            unique: true,
            required: true
        },
        user: {
            type: 'User',
            link: true,
            required: true
        },
        pets: [{
            type: 'Pet',
            link: true
        }]
    }
}
// const composer = new Composer([user, pet, home])

export default [user, pet, home]