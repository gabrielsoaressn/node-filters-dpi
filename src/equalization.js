//para cada pixel (i,j), verifica o valor e incrementa o item do array que tem o index correspondente ao valor
function calculateHistogram(window, L) {
    const hist = new Array(L).fill(0);
    for (let i = 0; i < window.width; i++) {
        for (let j = 0; j < window.height; j++) {
            let pixel = window.getPixel(i, j);
            hist[pixel]++;
        }
    }
    return hist;
}

function equalizeWindow(window, L){
    const hist = calculateHistogram(window, L);
    const cdf = new Array(L).fill(0);
    cdf[0] = hist[0];
    for (let i = 1; i < L; i++) //cdf recebe a soma cumuluativa hist[0] + hist[2]+...+hist[L-1]
    {
        cdf[i] = cdf[i - 1] + hist[i];
    }
    const minCDF = cdf.find(value => value > 0);//encontra o primeiro valor diferente de 0
    for (let i = 0; i < window.width; i++) {
        for (let j = 0; j < window.height; j++) {
            let pixel = window.getPixel(i, j);
            let equalized = Math.round((cdf[pixel] - minCDF) / (window.width * window.height - minCDF) * (L - 1));//fórmula da equalização
            window.setPixel(i, j, equalized);
        }
    }
}

function expandWindow(window, L){
    let min = L-1, max =0;
    for(let i =0; i <window.width;i++){
        for(let j = 0;j < window.height;j++){
            let pixel = window.getPixel(i,j);
            if(pixel < min) min = pixel;
            if(pixel > max) max = pixel;
        }
    }
    for(let i =0; i <window.width;i++){
        for(let j = 0;j < window.height;j++){
            let pixel = window.getPixel(i,j);
            let expanded = Math.round((pixel - min) / (max - min) * (L - 1));
            window.setPixel(i, j, expanded);
        }
    }
}

function equalizacaoSeguidaExpansao(window, L) {
    equalizeWindow(window, L);  // Primeiro equaliza
    expandWindow(window, L);    // Depois expande
}