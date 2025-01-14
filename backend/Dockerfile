# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY *.csproj .
RUN dotnet restore

# Copy everything else and build
COPY . .
RUN dotnet publish -c Release -o /app

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app .

# Create non-root user
RUN useradd -r -s /bin/false typeracer && \
    chown -R typeracer:typeracer /app

USER typeracer

# Set environment variable
ENV ENVIRONMENT=Production

# Expose the WebSocket port
EXPOSE 8080

ENTRYPOINT ["dotnet", "lightspeedtyping.dll"]