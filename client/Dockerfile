FROM node:22

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 4200

CMD ["npm", "start"]

