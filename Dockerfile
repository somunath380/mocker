FROM node:16
WORKDIR /app
COPY package*.json ./
RUN apt-get update && apt-get install -y redis-server
RUN npm install
COPY . .
# Build the frontend
WORKDIR /app/web
RUN npm install
RUN npm run build

EXPOSE 3000
ENV DOCKER_CONTAINER true
RUN ["npm", "start"]
