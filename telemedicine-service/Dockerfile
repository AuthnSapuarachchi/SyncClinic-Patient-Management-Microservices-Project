# Use the official Java 21 image
FROM eclipse-temurin:21-jdk-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the compiled JAR file into the container
# (Maven creates this in the /target folder)
COPY target/*.jar app.jar

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
