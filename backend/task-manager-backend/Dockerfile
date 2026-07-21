# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-21-jammy AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies (this step is cached unless pom.xml changes)
RUN mvn dependency:go-offline -B
COPY src ./src
# Build the application
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
# Copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Run the jar file
ENTRYPOINT ["java", "-jar", "app.jar"]
