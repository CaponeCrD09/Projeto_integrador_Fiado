import { PrismaClient } from "@prisma/client";
import { number, z } from 'zod';
const prisma = new PrismaClient();


//req: request, ou seja, a requisição que o frontend está fazendo para o backend, onde eu posso pegar os dados que estão sendo enviados pelo frontend, como por exemplo, os dados de um formulário ou os parâmetros de uma URL
//res; response, ou seja, a resposta que o backend vai enviar para o frontend, onde eu posso enviar os dados que eu quero que o frontend receba, como por exemplo, os dados de um produto ou uma mensagem de erro
//next; função para passar para o próximo middleware, caso haja algum erro ou algo do tipo, ele passa para o próximo middleware de tratamento de erros
export async function createProducts(req , res, _next){

    const data = req.body
    let u = await prisma.product.create({data});
    return res.status(201).json(u);
}

export async function  readProducts(req, res, _next) {
    const {name,type,value} = req.query;
    let consult = {}

    if(name) consult.name = {contains: "%" + name + "%"}
    if(type) consult.type = {contains: "%" + type+ "%"}
    if(value) consult.value = {contains: "%" + value + "%"}
    let p = await prisma.product.findMany({where: consult});
    return res.status(200).json(p);
}


export async function showProducts(req, res, _next) {
    let id = Number(req.params.id);
    let p = await prisma.product.findFirst({where: {id:id}});
    return res.status(200).json(p);
}