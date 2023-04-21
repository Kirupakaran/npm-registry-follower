FROM node:20 as build

COPY ./package.json ./package-lock.json /app/src/

WORKDIR /app/src

RUN npm ci

FROM node:20 as run

COPY --from=build /app/src/node_modules /app/src/

COPY ./start.js /app/src/
COPY ./package.json /app/src/
COPY ./.sequelizerc /app/src/
COPY ./migrations /app/src/
COPY ./models /app/src/

WORKDIR /app/src

RUN useradd --create-home --user-group npm

USER npm

ENTRYPOINT [ "npm", "run", "start"]
