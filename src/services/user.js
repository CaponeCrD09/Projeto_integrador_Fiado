import { PrismaClient } from "@prisma/client";
import { number, z } from 'zod';
const prisma = new PrismaClient();


//req: requisição oque esta vindo do frontend
//res; response oque eu vou respoder
//next; proximo oque eu vou fazer a seguir
export async function createUser(req , res, _next){

    const data = req.body
    let u = await prisma.user.create({data});
    return res.status(201).json(u);
}

export async function  readUser(req, res, _next) {
    let users = await prisma.user.findMany();
    return res.status(200).json(users);
}


export async function showUser(req, res, _next) {
    let id = Number(req.params.id);
    let u = prisma.user.findFirst({where: {id:id}});
    return res.status(200).json(u);
}


