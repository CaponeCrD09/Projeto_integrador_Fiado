import multer from 'multer';

// Usamos memoryStorage para não encher seu HD de fotos. 
// O arquivo ficará em buffer temporário até ir para o ImgBB e depois some da RAM.
const storage = multer.memoryStorage();

// Limite setado em 5MB por arquivo
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

export default upload;
