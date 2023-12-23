
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

#The smallest distroless image, gcr.io/distroless/static-debian11, is around 2 MB. 
#That's approximately 50% of the size of alpine (~5 MiB), and less than 2% of the size of debian (124 MiB)
#source:-- https://alphasec.io/dockerize-a-node-js-app-using-a-distroless-image/

#Distroless images do not contain package managers, shells ( bash will also be not there)or other similar programs; since they have a smaller attack surface, they are also less vulnerable to security exploits.
#so creating another lightweight base image to install bash and copy those artifacts into my finalstage
FROM busybox:1.35.0-uclibc as busybox

FROM gcr.io/distroless/nodejs18-debian11 as finalstage


# Now copy the static shell into base image.
COPY --from=busybox /bin/sh /bin/sh
# You may also copy all necessary executables into distroless image.
COPY --from=busybox /bin/mkdir /bin/mkdir
COPY --from=busybox /bin/cat /bin/cat
COPY --from=busybox /bin/chmod /bin/chmod
COPY --from=busybox /bin/ls /bin/ls
COPY --from=busybox /bin/which /bin/which


#RUN apk update && apk add --update curl nodejs npm bash
#Alpine Linux typically uses ash as the default shell, and it doesn't include bash by default.
#RUN npm i -g n && n 18.15.0
WORKDIR /app
# before runnig app, we need to copy tsc compiled dist folder, node_modules, dockerize file and copy into /usr/local/bin
# in our dockerfile there are less artifacts (like executables, binaries etc.. ) so the finalstage image size will be just somewhat smaller than original single stage image
# but as the base image itself is moved from much heavier ubuntu to much lighter alpine the final size image should reduce by a lot

COPY --from=base /app/.env /app/.env
COPY --from=base /app/prisma /app/prisma/
COPY --from=base /app/run-app-in-distroless-container.sh run-app-in-distroless-container.sh
COPY --from=base /app/run-app.sh run-app.sh
COPY --from=base /app/node_modules node_modules
COPY --from=base /app/dist dist
COPY --from=base /usr/local/bin/dockerize /usr/local/bin/dockerize
ENTRYPOINT [ "node" ]
CMD ["dist/src/app.js"]  