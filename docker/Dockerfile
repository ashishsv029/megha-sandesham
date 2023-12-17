# install linux os base image ex:- ubuntu. Later replace with a slim size linux distibution image
# install node (npm also if not installed, install curl)
# install typescript
# install node modules
# install prisma client 
# compile ts file into dst folder using tsc
# set entrpoint as node
# execute cmd index.js in dist folder

FROM ubuntu
RUN apt-get update
RUN apt-get install -y curl
RUN apt install -y nodejs npm
# change node version to 18.15.0  
RUN npm i -g n \
    && n 18.15.0
# install typescript globally
RUN npm i -g typescript


WORKDIR /app

#copying package files alone before doing npm install is very effeicient to use layer caching
#as the copy command will not copy the contents again and again from host if the cache key (which formed with 1st time execution of copy command along with the copy content ) remains same
#only if the package files change, the cache key will be changed and then only the command executes newly again, otherwise it uses the data from buildcache
COPY package.json package-lock.json ./
# here this step wont execute again and will take node modules content from build cache if the previous layer is not invalidated
RUN npm install

COPY ./prisma/schema.prisma ./prisma/
# this should be after copying the prisma schema, because the schema.prisma file changes very rarely and we can take layer optimization benefit  
RUN npx prisma generate

# so this below copy command is most probable to get changed and invalidate all the subsequent layered cache.. so keep at it as end (top layer) as possible
COPY . .

#compile ts code and generate js build
RUN tsc

#this will fail because it needs dependent services (like redis and postgres) to be up before starting app.. so either this container should run after those container started.. use dockerize when automating while usig docker-compose
ENTRYPOINT [ "node" ]
CMD ["dist/src/app.js"] 
# use what command the container should run while running the container. for ex:- docker run -it imageid/name /bin/bash -c "cd app && node dist/src/app.js" 