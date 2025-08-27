import { Jimp } from "jimp";

// Função para extrair valores de um canal específico de uma janela
function extractChannelValues(image, centerX, centerY, windowWidth, windowHeight, channel) {
    const values = [];
    const halfW = Math.floor(windowWidth / 2);
    const halfH = Math.floor(windowHeight / 2);
    
    for (let dy = -halfH; dy <= halfH; dy++) {
        for (let dx = -halfW; dx <= halfW; dx++) {
            const x = centerX + dx;
            const y = centerY + dy;
            
            // Verifica bordas
            if (x >= 0 && x < image.bitmap.width && y >= 0 && y < image.bitmap.height) {
                const idx = 4 * (y * image.bitmap.width + x);
                let value;
                switch(channel) {
                    case 'r': value = image.bitmap.data[idx]; break;
                    case 'g': value = image.bitmap.data[idx + 1]; break;
                    case 'b': value = image.bitmap.data[idx + 2]; break;
                }
                values.push(value);
            }
        }
    }
    return values;
}

// Sua função original adaptada para array de valores
function calculateHistogram(values, L) {
    const hist = new Array(L).fill(0);
    for (let i = 0; i < values.length; i++) {
        let pixel = values[i];
        hist[pixel]++;
    }
    return hist;
}

// Sua função original adaptada para retornar valores em vez de modificar
function equalizeValues(values, L) {
    const hist = calculateHistogram(values, L);
    const cdf = new Array(L).fill(0);
    cdf[0] = hist[0];
    
    for (let i = 1; i < L; i++) {
        cdf[i] = cdf[i - 1] + hist[i];
    }
    
    const minCDF = cdf.find(value => value > 0);
    const totalPixels = values.length;
    
    return values.map(pixel => {
        return Math.round((cdf[pixel] - minCDF) / (totalPixels - minCDF) * (L - 1));
    });
}

// Sua função original adaptada para retornar valores
function expandValues(values, L) {
    let min = L-1, max = 0;
    
    for (let i = 0; i < values.length; i++) {
        let pixel = values[i];
        if (pixel < min) min = pixel;
        if (pixel > max) max = pixel;
    }
    
    const range = max - min;
    if (range === 0) return values; // Evita divisão por zero
    
    return values.map(pixel => {
        return Math.round((pixel - min) / range * (L - 1));
    });
}

// Sua função combinada adaptada
function equalizacaoSeguidaExpansaoValues(values, L) {
    const equalized = equalizeValues(values, L);
    const expanded = expandValues(equalized, L);
    return expanded;
}

// Função principal que usa suas funções adaptadas
export async function applyLocalHistogramProcessing(image, windowWidth, windowHeight, L = 256) {
    const { width, height } = image.bitmap;
    const halfW = Math.floor(windowWidth / 2);
    const halfH = Math.floor(windowHeight / 2);
    
    // Dimensões da imagem resultante (sem bordas)
    const newWidth = width - (windowWidth - 1);
    const newHeight = height - (windowHeight - 1);
    
    const outputImage = new Jimp({ width: newWidth, height: newHeight });
    
    console.log(`Processando histograma local com janela ${windowWidth}x${windowHeight}`);
    console.log(`Imagem: ${width}x${height} → ${newWidth}x${newHeight}`);
    
    for (let y = halfH; y < height - halfH; y++) {
        for (let x = halfW; x < width - halfW; x++) {
            
            // Extrair valores de cada canal na janela
            const rValues = extractChannelValues(image, x, y, windowWidth, windowHeight, 'r');
            const gValues = extractChannelValues(image, x, y, windowWidth, windowHeight, 'g');
            const bValues = extractChannelValues(image, x, y, windowWidth, windowHeight, 'b');
            
            // Aplicar sua função equalização + expansão em cada canal
            const rProcessed = equalizacaoSeguidaExpansaoValues(rValues, L);
            const gProcessed = equalizacaoSeguidaExpansaoValues(gValues, L);
            const bProcessed = equalizacaoSeguidaExpansaoValues(bValues, L);
            
            // Pegar valor central (pixel sendo processado)
            const centerIndex = Math.floor(rValues.length / 2);
            
            // Escrever no pixel da imagem de saída
            const outIdx = 4 * ((y - halfH) * newWidth + (x - halfW));
            outputImage.bitmap.data[outIdx] = rProcessed[centerIndex];
            outputImage.bitmap.data[outIdx + 1] = gProcessed[centerIndex];
            outputImage.bitmap.data[outIdx + 2] = bProcessed[centerIndex];
            outputImage.bitmap.data[outIdx + 3] = 255; // Alpha fixo
        }
        
        // Progress indicator
        if (y % 100 === 0) {
            const progress = ((y - halfH) / (height - 2 * halfH) * 100).toFixed(1);
            console.log(`Progresso: ${progress}%`);
        }
    }
    
    return outputImage;
}