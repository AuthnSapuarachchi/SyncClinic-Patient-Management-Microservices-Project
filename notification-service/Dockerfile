FROM openjdk:17-jdk-slim

WORKDIR /app

COPY pom.xml .
COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn

RUN chmod +x mvnw && ./mvnw dependency:go-offline

COPY src src

RUN ./mvnw package -DskipTests

EXPOSE 8085

ENV JAVA_OPTS="-XX:+UseG1GC -XX:+UnlockExperimentalVMOptions -XX:G1NewCollectionIntervalInMS=5 -XX:InitiatingHeapOccupancyPercent=35 -XX:MaxGCPauseMillis=200"

ENTRYPOINT ["java", "-jar", "target/notification-service-1.0.0.jar"]
