FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
RUN apk add --no-cache maven
COPY . .
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-Duser.timezone=UTC", "-jar", "app.jar"]