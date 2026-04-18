# Use the official Maven image to build the app
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package -DskipTests

# Use the official Java 21 image for running
FROM eclipse-temurin:21-jdk-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the compiled JAR file into the container from the build stage
COPY --from=build /app/target/*.jar app.jar

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]


#FROM eclipse-temurin:17-jdk-jammy
#
#WORKDIR /app
#
#COPY pom.xml .
#COPY mvnw .
#COPY mvnw.cmd .
#COPY .mvn .mvn
#
#RUN chmod +x mvnw && ./mvnw dependency:go-offline
#
#COPY src src
#
#RUN ./mvnw package -DskipTests
#
#EXPOSE 8083
#
#ENV JAVA_OPTS="-XX:+UseG1GC -XX:+UnlockExperimentalVMOptions -XX:G1NewCollectionIntervalInMS=5 -XX:InitiatingHeapOccupancyPercent=35 -XX:MaxGCPauseMillis=200"
#
#ENTRYPOINT ["java", "-jar", "target/telemedicine-service-1.0.0.jar"]
