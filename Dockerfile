FROM node:14
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE ${SERVER_PORT}
# CMD ["node", "index.js"]