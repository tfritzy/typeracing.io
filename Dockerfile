# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy solution file first
COPY lightspeedtyping.sln .

# Copy project files first
COPY backend/src/*.csproj backend/src/
COPY backend/schema/*.csproj backend/schema/

# Restore dependencies for all projects
RUN dotnet restore

# Copy everything else
COPY backend/ backend/

# Build and publish
WORKDIR /app/backend/src
RUN dotnet publish -c Release -o /app/out

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .

# Create non-root user
RUN useradd -r -s /bin/false typeracingio && \
    chown -R typeracingio:typeracingio /app
USER typeracingio

# Set environment variable
ENV ENVIRONMENT=Production

# Expose the WebSocket port
EXPOSE 8080
ENTRYPOINT ["dotnet", "lightspeedtyping.dll"]