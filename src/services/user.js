import { PrismaClient } from "@prisma/client";
import { z } from 'zod';
const prisma = new PrismaClient();


//req: requisição oque esta vindo do frontend
//res; response oque eu vou respoder
//next; proximo oque eu vou fazer a seguir
export async function createUser(req , res, _next){

    const data = req.body
    let u = await prisma.user.create({data});
    return res.status(201).json(u);
}

<<<<<<< HEAD
export async function  readUser(req, res, _next) {
    let users = await prisma.user.findMany();
    return res.status(200).json(users);
=======
export async function readPayment(req, res, _next) {
    let users = await prisma.payment.findMany();
    return res.status(200).json(payment);
>>>>>>> 7da6d7728f6d978276bc56cfaea8e7e803c8b9dc
}