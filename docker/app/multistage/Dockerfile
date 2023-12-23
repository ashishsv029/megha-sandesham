
FROM ubuntu as base
#these package are not needed to run the final app, so we need not keep these in final image, which reduces the final image size
RUN apt-get update && apt-get install -y curl wget
RUN apt install -y nodejs npm
ENV DOCKERIZE_VERSION v0.6.0
RUN wget --no-check-certificate https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz
RUN npm i -g n \
    && n 18.15.0
RUN npm i -g typescript
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .  
RUN npx prisma generate
RUN tsc
#here we have these unused typescript files also, these are unused because using ts transpiler we convert to js code and use that js files to run the app.. 
#so no need to store these typescript artifacts in the final build


FROM ubuntu as finalstage
RUN apt-get update && apt-get install -y curl nodejs npm
RUN npm i -g n && n 18.15.0
WORKDIR /app
# before runnig app, we need to copy tsc compiled dist folder, node_modules, dockerize file and copy into /usr/local/bin
# in our dockerfile there are less artifacts (like executables, binaries etc.. ) so the finalstage image size will be just somewhat smaller than original single stage image
COPY --from=base /app/.env /app/.env
COPY --from=base /app/prisma /app/prisma/
COPY --from=base /app/run-app.sh run-app.sh
COPY --from=base /app/node_modules node_modules
COPY --from=base /app/dist dist
COPY --from=base /usr/local/bin/dockerize /usr/local/bin/dockerize
ENTRYPOINT [ "node" ]
CMD ["dist/src/app.js"]  