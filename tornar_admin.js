import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const emailsDesejados = ["neres@gmail.com", "admin2@gmail.com", "felipeadm@gmail.com"]; 
    
    for (const email of emailsDesejados) {
        const user = await prisma.user.findFirst({ where: { email } });

        if (user) {
            await prisma.user.update({
                where: { id: user.id },
                data: { type: "admin" }
            });
            console.log(`Sucesso! O usuário '${email}' (ID: ${user.id}) agora é um admin na base de dados.`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
