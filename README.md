# Project MeghaSandesham
V8.0.0

A polyglot microservices-based application developed for chatting and message scheduling. The architecture includes 6 different micro services 

# Project Services

| S.No | Service               | Note                                                                                                  | Tech Stack                                                         | Project Link                                                                                                      |
|------|-----------------------|-------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------|
| 1    | Chatting Service      | It is a websocket handling server written in **NodeJS** using **Socket.IO** library, which manages websockets and communicates with socket clients. It used Redis Streams Adapter [Ref](https://socket.io/docs/v4/redis-streams-adapter/), so that sockets connected to different chat services can also be handled.                                                                                                     | ![TypeScript](https://img.shields.io/badge/-TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)  ![NodeJS](https://img.shields.io/badge/-NodeJS-339933?style=flat&logo=node.js&logoColor=white) ![Socket.IO](https://img.shields.io/badge/-Socket.io-010101?style=flat&logo=socket.io&logoColor=white) ![Docker](https://img.shields.io/badge/-Docker-2496ED?style=flat&logo=docker&logoColor=white) | [https://github.com/ashishsv029/megha-sandesham](https://github.com/ashishsv029/megha-sandesham)                  |
| 2    | Authentication Service| It manages and authenticates users. It is a generic service written in **Java Spring Boot** and **Spring Security** whihc provides authentication support by exposing 3 main APIs. 1. /signup 2. /login  3. /validate. The signup api stores the user details, login api validates the user deatils with stored details and drops a server cookie with JWT and the validate API validates the JWT sent by the client                                                                                                     | <br>![Java](https://img.shields.io/badge/-Java-007396?style=flat&logo=java&logoColor=white) ![Spring Boot](https://img.shields.io/badge/-Spring%20Boot-6DB33F?style=flat&logo=spring-boot&logoColor=white)  ![Docker](https://img.shields.io/badge/-Docker-2496ED?style=flat&logo=docker&logoColor=white)  | [https://github.com/ashishsv029/authentication-service](https://github.com/ashishsv029/authentication-service)    |
| 3    | UI Service            | It is a **React** based application and connects to socket server via nginx. The components are written mainly using CSS flexbox concepts                                                                                                      | <br>![React](https://img.shields.io/badge/-React-61DAFB?style=flat&logo=react&logoColor=white) ![HTML](https://img.shields.io/badge/-HTML5-E34F26?style=flat&logo=html5&logoColor=white) ![CSS](https://img.shields.io/badge/-CSS3-1572B6?style=flat&logo=css3&logoColor=white) ![Docker](https://img.shields.io/badge/-Docker-2496ED?style=flat&logo=docker&logoColor=white)| [https://github.com/ashishsv029/megha-sandesham-frontend](https://github.com/ashishsv029/megha-sandesham-frontend)|
| 4    | Nginx Service         | Used as a Reverse Proxy                                                                               | <br>![Nginx](https://img.shields.io/badge/-Nginx-009639?style=flat&logo=nginx&logoColor=white) ![Docker](https://img.shields.io/badge/-Docker-2496ED?style=flat&logo=docker&logoColor=white)                                         | [https://github.com/ashishsv029/megha-sandesham-nginx](https://github.com/ashishsv029/megha-sandesham-nginx)      |
| 5    | Postgres              | Relational Database for both Chatting Service and Authentication Service                              | ![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-336791?style=flat&logo=postgresql&logoColor=white)                                                                   |                                                                                                                  |
| 6    | Redis                 | Used for storing User-Socket Map and for Socket Redis Adapter, useful when chatting service is scaled up | <br>![Redis](https://img.shields.io/badge/-Redis-DC382D?style=flat&logo=redis&logoColor=white)                                                                    |                                                                                                                  |

## Architecture
1. Local Deployment Architecture (using HTTP Tunneling using ngrok)
![MeghaSandeshamLocalDeploymentArchitecture](https://github.com/ashishsv029/megha-sandesham/blob/master/public/readme_images/MeghaSandeshamLocalDeployment.png)

2. MeghaSandesham UI (ReactJS):-
![MeghaSandeshamUI](https://github.com/ashishsv029/megha-sandesham/blob/master/public/readme_images/MeghaSandesham-UI.png)

3. AWS Planned Architecture:
![MeghaSandeshamPlannedDeploymentArchitecture](https://github.com/ashishsv029/megha-sandesham/blob/master/public/readme_images/MeghaSandeshamPropesdDeploymentArchitecture.png)
The inter task communication will be happening by setting service discovery and by creating a cloud map namespace. We can also add another nginx in private subnet for communication between private subnet containers

4. AWS Present Deployed Architecture:
![MeghaSandeshamCurrentDeploymentArchitecture](https://github.com/ashishsv029/megha-sandesham/blob/master/public/readme_images/MeghaSandeshamAWSCurrentArchitecture.png)
For time being and cost saving purpose, I deployed all the containers in a single task. As multiple containers within a task in awsvpc networking mode will share the task ENI and the network namespace, so they can communicate to each other using localhost (or the equivalent 127.0.0.1 loopback IP address). But it will not be a good design if we want to scale up individual tasks



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
