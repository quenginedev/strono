export function isString (value: any) {
    return typeof value === 'string' || value instanceof String;
}

export function isNumber (value: any) {
    return typeof value === 'number' && isFinite(value);
}

export function isFunction(value: any){
    return typeof value === 'function'
}

export function isArray(value: any){
    return Array.isArray(value);
}

export function isObject(value: any){
    return value && typeof value === 'object' && value.constructor === Object
}

export function isBoolean (value: any) {
    return typeof value === 'boolean';
}

export function isDate (value: any) {
    return value instanceof Date;
}

export function capitalize(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

export function camelCase(value: string) {
    return value.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
}

export function objectId () {
    return hex(Date.now() / 1000) +
      ' '.repeat(16).replace(/./g, () => hex(Math.random() * 16))
}

function hex (value: any) {
    return Math.floor(value).toString(16)
}
