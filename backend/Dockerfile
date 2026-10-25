
# Build the Spring Boot application with Java 21 and Maven
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

# Run the application using Java 21
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/target/campushub-backend-1.0.0.jar app.jar

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar --spring.profiles.active=${SPRING_PROFILES_ACTIVE:-mysql}"]
