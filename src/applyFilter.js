import { Jimp } from "jimp";

export async function applyFilter(image, filter) {
    const { mask, bias, activation } = filter;
    
    // Obtendo dados da imagem
    const { width, height } = image.bitmap;
    
    // Obtendo dados da máscara
    const kH = mask.length; // altura da máscara -> quantidade de arrays
    const kW = mask[0].length; // largura da máscara -> quantidade de colunas na linha 0
    
    // Pixel central da máscara
    const anchorY = Math.floor(kH / 2);
    const anchorX = Math.floor(kW / 2);
    
    // Dimensões da nova imagem (sem bordas)
    const newWidth = width - (kW - 1);
    const newHeight = height - (kH - 1);
    
    // Criando buffer de saída
    const outputData = new Uint8ClampedArray(newWidth * newHeight * 4);
    
    // Loop pelos pixels
    for (let y = anchorY; y < height - anchorY; y++) {
        for (let x = anchorX; x < width - anchorX; x++) {
            let accR = 0, accG = 0, accB = 0; // RGB acumulados
            
            // Loop na máscara
            for (let ky = 0; ky < kH; ky++) {
                for (let kx = 0; kx < kW; kx++) {
                    const srcX = x + (kx - anchorX);
                    const srcY = y + (ky - anchorY);
                    
                    // Pega cor do vizinho (r,g,b)
                    const idx = 4 * (srcY * image.bitmap.width + srcX);
                    const r = image.bitmap.data[idx + 0];
                    const g = image.bitmap.data[idx + 1];
                    const b = image.bitmap.data[idx + 2];
                    
                    // Peso da máscara
                    const w = mask[ky][kx];
                    accR += r * w;
                    accG += g * w;
                    accB += b * w;
                }
            }
            
            // ✅ CORREÇÃO: Bias aplicado DEPOIS da convolução completa
            accR += bias;
            accG += bias;
            accB += bias;
            
            // Para demonstrar diferença do ReLU, vamos tratar valores negativos diferente:
            if (activation) {
                // COM ReLU: valores negativos viram 0
                accR = Math.max(0, accR);
                accG = Math.max(0, accG);
                accB = Math.max(0, accB);
            } else {
                // SEM ReLU: valores negativos viram valor absoluto (para visualização)
                // Isso criará diferença visual perceptível
                accR = Math.abs(accR);
                accG = Math.abs(accG);
                accB = Math.abs(accB);
            }
            
            // Clamp final para valores RGB válidos (0-255)
            accR = Math.min(255, accR);
            accG = Math.min(255, accG);
            accB = Math.min(255, accB);
            
            // Escreve no buffer de saída
            const idx = 4 * ((y - anchorY) * newWidth + (x - anchorX));
            outputData[idx + 0] = accR;
            outputData[idx + 1] = accG;
            outputData[idx + 2] = accB;
            outputData[idx + 3] = 255; // alpha fixo (opaco)
        }
    }
    
    const outputImage = new Jimp({ width: newWidth, height: newHeight });
    for (let i = 0; i < outputData.length; i++) {
        outputImage.bitmap.data[i] = outputData[i];
    }
    
    return outputImage;
}