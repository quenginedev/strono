import {StronoSchema} from "../lib/interfaces.ts";

const user: StronoSchema = {
    name: "User",
    field: {
        email : {
            type: 'String',
            required: true,
            unique: true
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

const pet: StronoSchema = {
    name: "Pet",
    field: {
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

const home: StronoSchema = {
    name: "Home",
    field: {
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

export default [user, pet, home]