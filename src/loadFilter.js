import fs from "fs";

function loadFilter(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n").map(line => line.trim()).filter(Boolean);

  let name = "";
  let bias = 0;
  let activation = false;
  let mask = [];
  let readingMask = false;

  for (const line of lines) {
    if (line.startsWith("name=")) {
      name = line.split("=")[1];
    } else if (line.startsWith("bias=")) {
      bias = parseInt(line.split("=")[1], 10);
    } else if (line.startsWith("activation=")) {
      const activationValue = line.split("=")[1].toLowerCase().trim();
      activation = activationValue === "true" || activationValue === "relu";
    } else if (line.startsWith("mask=")) {
      readingMask = true; 
    } else if (readingMask) {
      const row = line.split(/\s+/).map(Number);
      mask.push(row);
    }
  }

  // Calcula soma total dos elementos da máscara
  const maskSum = mask.flat().reduce((sum, value) => sum + value, 0);
  
  // Normaliza apenas se:
  // 1. A soma é diferente de 0, 1 ou -1 (evita dividir por zero ou normalizar filtros já corretos)
  // 2. O filtro não é de detecção de bordas (soma próxima de 0)
  if (maskSum !== 0 && maskSum !== 1 && maskSum !== -1 && Math.abs(maskSum) > 0.001) {
    console.log(`Normalizando filtro "${name}": soma original = ${maskSum}`);
    
    // Normaliza cada elemento dividindo pela soma total
    for (let i = 0; i < mask.length; i++) {
      for (let j = 0; j < mask[i].length; j++) {
        mask[i][j] = mask[i][j] / maskSum;
      }
    }
    
    // Verifica nova soma (deve ser próximo de 1)
    const newSum = mask.flat().reduce((sum, value) => sum + value, 0);
    console.log(`Nova soma após normalização: ${newSum.toFixed(6)}`);
  } else {
    console.log(`Filtro "${name}" não normalizado (soma = ${maskSum})`);
  }

  return { name, bias, activation, mask };
}

export { loadFilter };