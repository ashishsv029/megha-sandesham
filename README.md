# megha-sandesham
V1.0.0

## Libraries Used
1. Express 
2. Socket.IO
3. Prisma ORM

# Running Server Locally
1. npm start (it invokes ts compiler and generates build and copies config.yml into dist folder and executes the node app.js command (can be replaced with pm2 in future) )

# Running Tests
1. npm run test - for running unit tests & code coverage report generation

# Running Docker Compose
    -> sudo docker compose -f docker/docker-compose.yml up --build
    -> sudo docker compose -f docker/docker-compose.yml down
    -> sudo docker compose -f docker/docker-compose-distroless.yml up --build

    using normal Dockerfile gives the final app image size ~ 1.57GB
    using multistage Dockerfile gives the final app image size ~ 1.44GB
    using minimalistic linux base i.e alpine base image the final app image size reduce to ~ 605MB
    using distroless base image the final app image size is reducing till ~400MB (but some issues while spinning up the contianer.. so dont use this till updated here, use the minimialist image for now)