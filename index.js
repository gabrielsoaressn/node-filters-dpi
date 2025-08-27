import { loadFilter } from "./src/loadFilter.js";
import { processImageWithFilter } from "./src/applyFilter.js";
import { loadImg } from "./src/loadImg.js";
import { applyLocalHistogramProcessing } from "./src/equalization.js";

// Lista de todos os filtros solicitados
const filterFiles = [
  "gaussiano_5x5.txt",
  "box_1x10.txt", 
  "box_10x1.txt",
  "box_10x10.txt",
  "sobel_horizontal.txt",
  "sobel_vertical.txt"
];

// Lista de imagens para testar
const testImages = [
  "images/CobblestoneBrickCityAlley_byBrunoPassigatti.jpg"
];

async function testAllFilters() {
  for (const imagePath of testImages) {
    console.log(`📸 Carregando imagem: ${imagePath}`);
    const img = await loadImg(imagePath);
    const imageName = imagePath.split('/').pop().split('.')[0]; // extrai nome base
    
    // ============================================================================
    // FUNCIONALIDADE 1: CORRELAÇÃO BIDIMENSIONAL COM FILTROS
    // ============================================================================
    console.log("=" .repeat(70));
    console.log("FUNCIONALIDADE 1: CORRELAÇÃO BIDIMENSIONAL");
    console.log("=" .repeat(70));
    
    for (const filterFile of filterFiles) {
      try {
        console.log(`🔧 Aplicando filtro: ${filterFile}`);
        
        // Carrega filtro
        const filter = loadFilter(`filters/${filterFile}`);
        console.log(`   Nome: ${filter.name}`);
        console.log(`   Bias: ${filter.bias}`);
        console.log(`   Activation: ${filter.activation}`);
        console.log(`   Máscara: ${filter.mask.length}x${filter.mask[0].length}`);
        
        // Aplica filtro
        const result = processImageWithFilter(img, filter);

        // Nome do arquivo de saída
        const filterName = filterFile.replace('.txt', '').replace('_', '-');
        const outputName = `outputs/${imageName}_${filterName}.png`;
        
        // Salva resultado
        await result.write(outputName);
        console.log(`   ✅ Salvo: ${outputName}\n`);
        
        // Para filtros Sobel, criar versão com valor absoluto + expansão
        if (filterFile.includes('sobel')) {
          console.log(`   🔄 Criando versão absoluta para Sobel...`);
          const absoluteResult = await applySobelVisualization(img, filter);
          const absOutputName = `outputs/${imageName}_${filterName}_abs_expanded.png`;
          await absoluteResult.write(absOutputName);
          console.log(`   ✅ Versão absoluta salva: ${absOutputName}\n`);
        }
        
      } catch (error) {
        console.error(`❌ Erro ao processar ${filterFile}:`, error.message);
      }
    }
    
    // ============================================================================
    // FUNCIONALIDADE 2: EQUALIZAÇÃO + EXPANSÃO DE HISTOGRAMA LOCAL
    // ============================================================================
    console.log("\n" + "=".repeat(70));
    console.log("FUNCIONALIDADE 2: EQUALIZAÇÃO + EXPANSÃO DE HISTOGRAMA LOCAL");
    console.log("=".repeat(70));
    
    const tamanhosJanela = [
      { w: 3, h: 3 },
      { w: 5, h: 5 },
      { w: 7, h: 7 },
      { w: 9, h: 9 }
    ];
    
    for (const {w, h} of tamanhosJanela) {
      try {
        console.log(`\n📊 Aplicando equalização+expansão local ${w}x${h}...`);
        const resultado = await applyLocalHistogramProcessing(img, w, h);
        const outputName = `outputs/${imageName}_histogram_local_${w}x${h}.png`;
        await resultado.write(outputName);
        console.log(`✅ Salvo: ${outputName}`);
        
      } catch (error) {
        console.error(`❌ Erro no processamento ${w}x${h}: ${error.message}`);
      }
    }
    
    // Salva original para comparação
    console.log("\n📋 Salvando imagem original para comparação...");
    await img.write(`outputs/${imageName}_original.png`);
    console.log(`✅ Original salva: outputs/${imageName}_original.png`);
  }
  
  console.log("\n🎉 SISTEMA COMPLETO FINALIZADO!");
  console.log("📁 Verifique a pasta 'outputs/' para todos os resultados");
}

// Função especial para visualização do Sobel (valor absoluto + expansão)
async function applySobelVisualization(image, filter) {
  // Aplica filtro normal
  const result =  processImageWithFilter(image, filter);
  
  // Aplica valor absoluto e encontra min/max para expansão
  let minVal = 255, maxVal = 0;
  const { width, height } = result.bitmap;
  
  // Primeiro pass: encontrar min/max
  for (let i = 0; i < width * height * 4; i += 4) {
    const r = result.bitmap.data[i];
    const g = result.bitmap.data[i + 1]; 
    const b = result.bitmap.data[i + 2];
    
    const gray = (r + g + b) / 3; // converte para escala de cinza
    minVal = Math.min(minVal, gray);
    maxVal = Math.max(maxVal, gray);
  }
  
  // Segundo pass: expandir histograma para [0, 255]
  const range = maxVal - minVal;
  if (range > 0) {
    for (let i = 0; i < width * height * 4; i += 4) {
      const r = result.bitmap.data[i];
      const g = result.bitmap.data[i + 1];
      const b = result.bitmap.data[i + 2];
      
      const gray = (r + g + b) / 3;
      const expanded = Math.round(((gray - minVal) / range) * 255);
      
      result.bitmap.data[i] = expanded;     // R
      result.bitmap.data[i + 1] = expanded; // G  
      result.bitmap.data[i + 2] = expanded; // B
      // Alpha mantém valor original
    }
  }
  
  return result;
}

// Executa o teste
testAllFilters().catch(console.error);