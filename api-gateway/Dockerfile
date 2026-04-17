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
RUN mvn clean package -Dmaven.test.skip=true

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