# Usa a imagem do Node 20
FROM node:20-alpine

# Define o diretório de trabalho
WORKDIR /app

# Instala as dependências
COPY package.json package-lock.json* ./
RUN npm install

# Copia o projeto e faz o build
COPY . .
RUN npm run build

# Expõe a porta e inicia
EXPOSE 3000
CMD ["npm", "start"]