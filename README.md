Webhook Debugger
A full-stack developer tool for capturing, inspecting, and replaying HTTP webhook requests in real time.
Built with React + Vite on the frontend and Spring Boot (Java 17) on the backend, with WebSockets for live streaming, PostgreSQL for persistence, and Redis for caching.
🔗 Live Demo: webhook-debugger.vercel.app <!-- update with your actual URL -->

Features

Live request streaming — incoming webhook requests appear instantly via WebSockets (STOMP/SockJS), no refresh needed
Payload inspection — view headers, body, and query params for every request
Request replay — resend any captured request with one click
Mock responses — configure custom status codes and response bodies per endpoint
Persistent history — all requests stored in PostgreSQL via JPA/Hibernate
Redis caching — reduces redundant DB reads on frequently accessed endpoints


Tech Stack
LayerTechnologyFrontendReact, Vite, JavaScriptBackendSpring Boot 3, Java 17, Spring REST, Spring MVCReal-timeWebSockets, STOMP, SockJSDatabasePostgreSQL, JPA / HibernateCachingRedisDeploymentRailway (backend), Vercel (frontend)ContainerisationDocker

Project Structure
webhook-debugger/
├── frontend/          # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   └── ...
│   └── package.json
│
├── backend/           # Spring Boot app
│   ├── src/main/java/
│   │   └── com/webhookdebugger/
│   │       ├── controller/
│   │       ├── service/
│   │       ├── model/
│   │       └── config/
│   └── pom.xml
│
└── README.md

Getting Started
Prerequisites

Java 17+
Node.js 18+
PostgreSQL
Redis

Backend
bashcd backend
# Configure your DB and Redis in src/main/resources/application.properties
./mvnw spring-boot:run
Frontend
bashcd frontend
npm install
npm run dev
The app will be running at http://localhost:5173, backend at http://localhost:8080.

Environment Variables
Backend (application.properties)
propertiesspring.datasource.url=jdbc:postgresql://localhost:5432/webhookdb
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.redis.host=localhost
spring.redis.port=6379
Frontend (.env)
envVITE_API_BASE_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080/ws

Deployment

Backend is containerised with Docker and deployed on Railway
Frontend is deployed on Vercel
