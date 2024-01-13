FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE ${SERVER_PORT}
RUN ["node", "config.js"]
RUN ["npm", "run", ${ENV}]