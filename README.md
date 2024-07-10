# Project MeghaSandesham
V8.0.0

A polyglot microservices-based application developed for chatting and message scheduling. The architecture includes 6 different micro services 

1. Chatting Service. Tech Stack:-  | TypeScript | NodeJS | Websockets(Socket.io) |
2. Authentication Service. Tech Stack:- | Java Spring Boot | Spring Security |
3. UI Service. Tech Stack:- | React JS | HTML and CSS Fundementals like Flexbox etc |
4. Nginx Service. (Used as a Reverse Proxy)
5. Postgres. (Relational Database for both Chatting Service and Authentication Service)
6. Redis. (Used for storing User-Socket Map and for Socket Redis Adapater, useful when chatting service is scaled up) 

## Architecture

## Image Registries Link
The Microservices images are pushed into publicly visible repositories in these registries

1. Dockerhub Registry :- https://hub.docker.com/u/ashishsv029
2. AWS ECR Registry :- https://ap-south-1.console.aws.amazon.com/ecr/public-registry/repositories?region=ap-south-1 (only accessed by me)

## Available Features
1. Basic User Signup/Signin
2. DM chat (with acknowledgement support i.e delivered, read and seen)
3. Group chat


## Planned Features
1. Message delivery scheduling
2. Image sharing


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

# Schema Design Doc

![MeghaSandeshamSchemaDesign](https://github.com/ashishsv029/megha-sandesham/blob/master/public/readme_images/MeghaSandesham.png)


# Todos:-

1. Add cron handling for all scheduled messages - change UI of the scheduled messages -  ToDo
2. Add proper session management, signIn and Signup flows using proper authentication and authorization workflows (or use java springboot project for doing the same) - Done (Using Spring Security, JWT Based authentication)
4. Add Images handling for 1. profile photos 2. Sending Images - Done (using AWS S3 and presigned URLs)

PHASE 2:

1. AWS deployment - Done (Using ECS Fargate)
2. CI CD Pipleline - ToDO
