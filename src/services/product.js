import { PrismaClient } from "@prisma/client";
import { number, z } from 'zod';
const prisma = new PrismaClient();


//req: requisição oque esta vindo do frontend
//res; response oque eu vou respoder
//next; proximo oque eu vou fazer a seguir
export async function createProducts(req , res, _next){

    const data = req.body
    let u = await prisma.product.create({data});
    return res.status(201).json(u);
}

export async function  readProducts(req, res, _next) {
    let products = await prisma.product.findMany();
    return res.status(200).json(products);
}


export async function showProducts(req, res, _next) {
    let id = Number(req.params.id);
    let p = await prisma.product.findFirst({where: {id:id}});
    return res.status(200).json(p);
}