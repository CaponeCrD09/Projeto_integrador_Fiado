import { PrismaClient } from "@prisma/client";
import { number, z } from 'zod';
const prisma = new PrismaClient();
import {attachSave} from "../utils/save.js"


//req: requisição oque esta vindo do frontend
//res; response oque eu vou 
//next; proximo oque eu vou fazer a seguir
export async function createUser(req , res, _next){

    const data = req.body
    let u = await prisma.user.create({data});
    return res.status(201).json(u);
}

export async function  readUser(req, res, _next) {
    const {name,type,email} = req.query;
    let consult = {}

    if(name) consult.name = {contains: name}
    if(type) consult.type = {contains: type}
    if(email) consult.email = {contains: email}
    let users = await prisma.user.findMany({where: consult});
    return res.status(200).json(users);
}


export async function showUser(req, res, _next) {
    let id = Number(req.params.id);
    let u = await prisma.user.findFirst({where: {id:id}});
    return res.status(200).json(u);
}

export async function  updateUser(req, res, _next) {
     
    let id = Number(req.params.id); 
    const {name,type,email,senha} = req.body  ;
    let u = await prisma.user.findFirst({where : {id:id}});

    if( !u ){
        return res.status(404).json("Nao encontri o "+id);
    }

    u = attachSave(u,'user');


    if(name) u.name = name
    if(type) u.type = type
    if(email) u.email = email
    if(senha) u.senha = senha

    await u.save();

    
    return res.status(202).json(u);
    

}

export async function deletando(req,res,_net) {
    
    let id = Number(req.params.id);
    const u = await prisma.user.findFirst({where : {id:id}});
    
    
    if(u){
        
         await prisma.user.delete({where : {id:id}});
    }
    else{

        return res.status(201).json(" nao encontrado");
    }

    return res.status(201).json("user deletado");


}


