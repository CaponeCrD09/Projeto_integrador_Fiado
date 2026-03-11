import { PrismaClient } from "@prisma/client";
import { number, z } from 'zod';
const prisma = new PrismaClient();
import { attachSave} from "../utils/save.js";


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
    let u = await prisma.product.findMany({where: consult});
    return res.status(200).json(u);
}


export async function showProducts(req, res, _next) {
    let id = Number(req.params.id);
    let u = await prisma.product.findFirst({where: {id:id}});
    return res.status(200).json(u);
}

export async function editProducts(req , res, _next){

    let id = Number(req.params.id); 
    const {companyId,value,name,type,description} = req.body  ;

    let p = await prisma.product.findFirst({where : {id:id}});
    
    if(!p){
        return res.status(400).json("Não encontrei" +id);
}
  p = attachSave(p, 'products');

  if(companyId,value,name,type,description) p.companyId,value,name,type,description = companyId,value,name,type,description
  await p.save();

}


//"companyId":1,
  //"value": 20.00,
  //"name": "Produto 2",
  //type": "bike",
 //"description": "Descrição do produto 2",
  //"url_img": "https://example.com/image2.jpg"