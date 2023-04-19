FROM node:19 as build

COPY ./package.json ./package-lock.json /app/src/

WORKDIR /app/src

RUN npm ci --only production --verbose

FROM node:19 as run

COPY --from=build /app/src/node_modules /app/src/node_modules

COPY ./start.js /app/src/start.js

WORKDIR /app/src

RUN useradd --create-home --user-group npm

USER npm

ENTRYPOINT [ "node", "start.js"]