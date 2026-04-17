import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const emailDesejado = "testeadm@gmail.com"; // Troque pelo email do usuário que você quer fazer admin
    
    console.log(`Buscando usuário com email: ${emailDesejado}...`);
    const user = await prisma.user.findFirst({ where: { email: emailDesejado } });

    if (!user) {
        console.log("Usuário não encontrado! Verifique o email digitado.");
        return;
    }

    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { type: "admin" }
    });

    console.log(`Sucesso! O usuário '${updatedUser.name}' (ID: ${updatedUser.id}) agora é um admin.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
