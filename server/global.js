import config from "./constants.js";
import jwt from "jsonwebtoken";
import SparqlClient from "sparql-http-client";
import nodemailer from "nodemailer";

export const client = new SparqlClient({
    endpointUrl: config.endpointUrl[process.env.NODE_ENV],
    user: config.user,
    password: process.env.secretKEY,
});

export const transporter = nodemailer.createTransport({
    service:'gmail',
    auth: {
        user: 'noreply.nvcentral@gmail.com',
        pass:  process.env.smtpPass,
    }
});


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
            console.log(err)
            reject(err)
        })
    })
}

export function verifiyAccount(token) {
    let account;
    if (token == null) {
        account = 'Visitor'
    } else {
        jwt.verify(token, process.env.secretKEY, (err, node) => {
            if (err) {
                return [{}]
            }
            account = node.node
        })
    }

    return account
}
