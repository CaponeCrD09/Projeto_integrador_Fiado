import axios from 'axios';

// Recebe a memória do arquivo tirado do Multer
export async function uploadToImgBB(fileBuffer) {
    const IMGBB_API_KEY = process.env.IMGBB_API_KEY; // Você vai adicionar essa chave lá no seu arquivo .env

    if (!IMGBB_API_KEY) {
        throw new Error('IMGBB_API_KEY não foi encontrada no seu .env da raiz do projeto.');
    }

    // O ImgBB permite upload simples mandando a string codificada
    const base64Image = fileBuffer.toString('base64');
    
    const params = new URLSearchParams();
    params.append('key', IMGBB_API_KEY);
    params.append('image', base64Image);

    try {
        const response = await axios.post('https://api.imgbb.com/1/upload', params.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        // Sucesso: Retorna apenas o link final da imagem no servidor deles
        return response.data.data.display_url;
    } catch (error) {
        console.error("Detalhes do erro no ImgBB:", error.response?.data || error.message);
        throw new Error("Falha de conexão ao fazer upload da imagem no ImgBB.");
    }
}
