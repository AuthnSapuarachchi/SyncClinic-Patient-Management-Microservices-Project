# Build stage
FROM eclipse-temurin:17-alpine AS build
WORKDIR /workspace

COPY .mvn .mvn
COPY mvnw pom.xml ./
COPY src ./src

RUN chmod +x mvnw && ./mvnw -B package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=build /workspace/target/medisphere-AIsymptomcheck-service-0.0.1-SNAPSHOT.jar /app/app.jar

EXPOSE 8088
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
