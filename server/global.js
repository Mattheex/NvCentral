import config from "./constants.js";
import {client} from "./server.js";

export function request(query, type) {
    const stream = client.query.select(query, {
        headers: {
            "Content-Type": config.queryType[type],
        },
        operation: 'postDirect'
    })
    const json = {}


    return new Promise((resolve, reject) => {
        stream.on('data', row => {
            for (const [key, value] of Object.entries(row)) {
                json[key] ||= [];
                json[key].push(value.value);
            }
        })

        stream.on('end', () => {
            resolve(json)
        })

        stream.on('error', err => {
            reject(err)
        })
    })
}
