# Sistema de Processamento Digital de Imagens

Sistema desenvolvido para a disciplina **Introdução ao Processamento Digital de Imagens** - UFPB/CI  
**Professor:** Leonardo Vidal Batista  
**Data:** 27/08/2025

## Funcionalidades

✅ **Correlação Bidimensional** com 6 filtros:
- Gaussiano 5×5 (suavização)
- Box 1×10, 10×1, 10×10 (média/blur)
- Sobel Horizontal e Vertical (detecção de bordas)

✅ **Equalização + Expansão de Histograma Local** com janelas configuráveis (3×3, 5×5, 7×7, 9×9)

## Pré-requisitos

- **Node.js** versão 14 ou superior
- **npm** ou **yarn**

## Instalação

1. **Clone o repositório:**
```bash
git clone <url-do-repositorio>
cd node-filters-dpi
```

2. **Instale as dependências:**
```bash
npm install
```

### Dependências

O projeto utiliza apenas uma dependência externa:

```json
{
  "dependencies": {
    "jimp": "^0.22.10"
  }
}
```

Para instalar manualmente:
```bash
npm install jimp
```

## Estrutura do Projeto

```
node-filters-dpi/
├── src/
│   ├── loadImg.js          # Carregamento de imagens
│   ├── loadFilter.js       # Leitura de arquivos de filtro  
│   ├── applyFilter.js      # Correlação bidimensional
│   └── equalization.js     # Equalização de histograma local
├── filters/
│   ├── gaussiano_5x5.txt
│   ├── box_1x10.txt
│   ├── box_10x1.txt  
│   ├── box_10x10.txt
│   ├── sobel_horizontal.txt
│   └── sobel_vertical.txt
├── images/
│   └── [suas imagens de teste]
├── outputs/                # Resultados (criado automaticamente)
├── index.js               # Script principal
└── package.json
```

## Uso

### Configuração Básica

1. **Configure o package.json para ES modules:**
```json
{
  "type": "module",
  "dependencies": {
    "jimp": "^0.22.10"
  }
}
```

2. **Adicione suas imagens** na pasta `images/`

3. **Execute o sistema:**
```bash
node index.js
```

### Formatos de Imagem Suportados

- PNG
- JPEG/JPG
- TIFF  
- BMP

### Personalização

**Para usar imagens diferentes:**
Edite o array `testImages` no `index.js`:
```javascript
const testImages = [
  "images/sua-imagem.jpg",
  "images/outra-imagem.png"
];
```

**Para filtros personalizados:**
Crie arquivo `.txt` na pasta `filters/` seguindo o formato:
```
name=Nome do Filtro
bias=0
activation=identity
mask=
-1 0 1
-2 0 2  
-1 0 1
```

## Resultados

O sistema gera automaticamente:

### Filtros Convolucionais
- `[imagem]_gaussiano-5x5.png`
- `[imagem]_box-1x10.png`
- `[imagem]_box-10x1.png`
- `[imagem]_box-10x10.png`
- `[imagem]_sobel-horizontal.png`
- `[imagem]_sobel-vertical.png`
- `[imagem]_sobel-horizontal_abs_expanded.png`
- `[imagem]_sobel-vertical_abs_expanded.png`

### Histograma Local
- `[imagem]_histogram_local_3x3.png`
- `[imagem]_histogram_local_5x5.png`
- `[imagem]_histogram_local_7x7.png`
- `[imagem]_histogram_local_9x9.png`

## Parâmetros dos Filtros

### Bias
Valor adicionado após a convolução (-255 a 255)

### Função de Ativação
- **`identity`**: Preserva todos os valores (padrão)
- **`relu`**: Valores negativos → 0

### Normalização Automática
Filtros de suavização são normalizados automaticamente para preservar brilho.

## Limitações

- **Bordas**: Sistema não implementa extensão, resultando em imagens menores
- **Performance**: Processamento sequencial para imagens grandes
- **Memória**: Carrega imagem completa na RAM

## Solução de Problemas

### Erro "Module not found"
```bash
# Certifique-se de que package.json contém:
echo '{"type": "module"}' > package.json
npm install jimp
```

### Erro de memória com imagens grandes
```bash
node --max-old-space-size=4096 index.js
```

### Imagem não carrega
- Verifique se o arquivo existe em `images/`
- Confirme que o formato é suportado (PNG, JPG, TIFF, BMP)

## Especificações Técnicas

- **Linguagem:** JavaScript ES6+
- **Runtime:** Node.js  
- **Biblioteca:** Jimp para manipulação de imagens
- **Algoritmos:** Correlação bidimensional, equalização CDF, expansão linear

## Desenvolvimento

### Estrutura das Funções Principais

**Correlação:**
```javascript
export function processImageWithFilter(image, filter)
```

**Histograma Local:**
```javascript  
export async function applyLocalHistogramProcessing(image, windowWidth, windowHeight)
```

### Extensões Futuras

- Interface gráfica
- Processamento paralelo
- Filtros morfológicos
- Transformadas de Fourier

## Contato

Sistema desenvolvido para trabalho acadêmico - UFPB/CI  
Disciplina: Introdução ao Processamento Digital de Imagens
