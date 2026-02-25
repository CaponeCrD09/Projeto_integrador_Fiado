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