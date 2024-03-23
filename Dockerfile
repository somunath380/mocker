# syntax=docker/dockerfile:1


ARG NODE_VERSION=20.10.0

FROM node:${NODE_VERSION}-alpine

WORKDIR /usr/src/app

# Run the application as a non-root user.
USER root

# Copy the rest of the source files into the image.
COPY . .

# Expose the port that the application listens on.
EXPOSE 3000

RUN npm install

# Run the application.
CMD npm start
