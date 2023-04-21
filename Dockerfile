FROM node:20 as build

COPY ./package.json ./package-lock.json /app/src/

WORKDIR /app/src

RUN npm ci

FROM node:20 as run

COPY --from=build /app/src/node_modules /app/src/node_modules

COPY ./start.js /app/src/start.js
COPY ./package.json /app/src/package.json
COPY ./.sequelizerc /app/src/.sequelizerc
COPY ./migrations /app/src/migrations
COPY ./models /app/src/models

WORKDIR /app/src

RUN useradd --create-home --user-group npm

USER npm

CMD [ "npm", "run", "start"]
