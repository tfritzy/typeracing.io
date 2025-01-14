# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /build

# Copy solution file first
COPY lightspeedtyping.sln .

# Copy all project files first
COPY backend/src/*.csproj backend/src/
COPY backend/schema/*.csproj backend/schema/
COPY backend/test/*.csproj backend/test/
COPY backend/api/*.csproj backend/api/

# Restore dependencies for all projects
RUN dotnet restore

# Copy everything else
COPY backend/ backend/

# Build and publish
WORKDIR /build/backend/src
RUN dotnet publish -c Release -o /dist

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /dist
COPY --from=build /dist .

# Create non-root user
RUN useradd -r -s /bin/false typeracingio && \
    chown -R typeracingio:typeracingio /dist
USER typeracingio

# Set environment variable
ENV ENVIRONMENT=Production

# Expose the WebSocket port
EXPOSE 8080
ENTRYPOINT ["dotnet", "lightspeedtyping.dll"]