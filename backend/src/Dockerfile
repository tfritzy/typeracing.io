# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /backend

# Copy project files first
COPY src/*.csproj src/
COPY schema/*.csproj schema/

# Copy solution file from parent directory
COPY ../lightspeedtyping.sln .

# Restore dependencies for all projects
RUN dotnet restore

# Copy everything else
COPY . .

# Build and publish
WORKDIR /backend/src
RUN dotnet publish -c Release -o /app

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app .

# Create non-root user
RUN useradd -r -s /bin/false typeracingio && \
    chown -R typeracingio:typeracingio /app
USER typeracingio

# Set environment variable
ENV ENVIRONMENT=Production

# Expose the WebSocket port
EXPOSE 8080
ENTRYPOINT ["dotnet", "lightspeedtyping.dll"]