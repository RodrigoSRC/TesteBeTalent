FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3333

CMD node ace migration:run && node ace db:seed && node ace serve --hmr