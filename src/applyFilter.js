// Pega o valor RGB de um pixel específico na imagem
function getPixelRGB(image, x, y) {
    const pixelIndex = 4 * (y * image.bitmap.width + x);
    return {
        r: image.bitmap.data[pixelIndex + 0],
        g: image.bitmap.data[pixelIndex + 1], 
        b: image.bitmap.data[pixelIndex + 2]
    };
}

// Aplica a máscara em uma posição específica
function applyMaskAtPosition(image, centerX, centerY, mask, anchorX, anchorY) {
    const maskHeight = mask.length;
    const maskWidth = mask[0].length;
    
    let totalR = 0;
    let totalG = 0; 
    let totalB = 0;
    
    // Percorre todos os elementos da máscara
    for (let maskY = 0; maskY < maskHeight; maskY++) {
        for (let maskX = 0; maskX < maskWidth; maskX++) {
            
            // Calcula onde buscar o pixel na imagem original
            const imageX = centerX + (maskX - anchorX);
            const imageY = centerY + (maskY - anchorY);
            
            // Pega a cor do pixel
            const pixel = getPixelRGB(image, imageX, imageY);
            
            // Pega o peso da máscara nesta posição
            const maskWeight = mask[maskY][maskX];
            
            // Multiplica cor do pixel pelo peso da máscara e acumula
            totalR += pixel.r * maskWeight;
            totalG += pixel.g * maskWeight;
            totalB += pixel.b * maskWeight;
        }
    }
    
    return { r: totalR, g: totalG, b: totalB };
}

// Função que adiciona bias aos valores RGB
function addBias(rgbValues, bias) {
    return {
        r: rgbValues.r + bias,
        g: rgbValues.g + bias,
        b: rgbValues.b + bias
    };
}

// Função que aplica a função de ativação (ReLU ou valor absoluto)
function applyActivation(rgbValues, useActivation) {
    if (useActivation) {
        // ReLU: valores negativos viram 0
        return {
            r: Math.max(0, rgbValues.r),
            g: Math.max(0, rgbValues.g),
            b: Math.max(0, rgbValues.b)
        };
    } else {
        // Sem ReLU: usa valor absoluto para visualização
        return {
            r: Math.abs(rgbValues.r),
            g: Math.abs(rgbValues.g),
            b: Math.abs(rgbValues.b)
        };
    }
}

// Função que limita os valores RGB entre 0 e 255
function clampRGB(rgbValues) {
    return {
        r: Math.min(255, rgbValues.r),
        g: Math.min(255, rgbValues.g),
        b: Math.min(255, rgbValues.b)
    };
}

// Função que escreve um pixel RGB no buffer de saída
function writePixelToOutput(outputData, outputX, outputY, outputWidth, rgbValues) {
    const outputIndex = 4 * (outputY * outputWidth + outputX);
    
    outputData[outputIndex + 0] = rgbValues.r;     // Red
    outputData[outputIndex + 1] = rgbValues.g;     // Green  
    outputData[outputIndex + 2] = rgbValues.b;     // Blue
    outputData[outputIndex + 3] = 255;             // Alpha (transparência)
}


export function processImageWithFilter(image, mask, bias, activation, outputData, newWidth, newHeight) {
    const imageWidth = image.bitmap.width;
    const imageHeight = image.bitmap.height;
    
    const maskHeight = mask.length;
    const maskWidth = mask[0].length;
    
    // Calcula o centro da máscara
    const anchorY = Math.floor(maskHeight / 2);
    const anchorX = Math.floor(maskWidth / 2);
    
    for (let imageY = anchorY; imageY < imageHeight - anchorY; imageY++) {
        for (let imageX = anchorX; imageX < imageWidth - anchorX; imageX++) {
            
            let pixelResult = applyMaskAtPosition(image, imageX, imageY, mask, anchorX, anchorY);
            pixelResult = addBias(pixelResult, bias);
            pixelResult = applyActivation(pixelResult, activation);
            pixelResult = clampRGB(pixelResult);
            
            // Calcula posição na imagem de saída
            const outputX = imageX - anchorX;
            const outputY = imageY - anchorY;
            
            // Escreve o resultado no buffer de saída
            writePixelToOutput(outputData, outputX, outputY, newWidth, pixelResult);
        }
    }
}