# ==========================================
# STAGE 1: The Builder (Compiles the code)
# ==========================================
# We use a heavy image that has Maven and the JDK installed
FROM maven:3.9.5-eclipse-temurin-21 AS build
WORKDIR /app

# Copy the project files INTO the container
COPY pom.xml .
COPY src ./src

# Let Docker run Maven to compile the code (No laptop required!)
RUN mvn clean package -DskipTests

# ==========================================
# STAGE 2: The Runner (Production Image)
# ==========================================
# We use a tiny, lightweight JRE (Java Runtime Environment) image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# The Magic: Copy ONLY the compiled .jar file from the "build" stage above
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
#EXPOSE 8085
#
#ENV JAVA_OPTS="-XX:+UseG1GC -XX:+UnlockExperimentalVMOptions -XX:G1NewCollectionIntervalInMS=5 -XX:InitiatingHeapOccupancyPercent=35 -XX:MaxGCPauseMillis=200"
#
#ENTRYPOINT ["java", "-jar", "target/notification-service-1.0.0.jar"]
