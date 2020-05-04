FROM node:12

## create app directory
WORKDIR /usr/src/app

## Install dependencies and cache them
COPY package*.json ./
COPY yarn.lock ./

COPY . /usr/src/app/

COPY .env /usr/src/app/

RUN yarn install

CMD [ "node", "handler.js" ]

