#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/core/aspnet:3.1-buster-slim AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/core/sdk:3.1-buster AS build
WORKDIR /src
COPY ["SyncCookies.Api/SyncCookies.Api.csproj", "SyncCookies.Api/"]
COPY ["SyncCookies.Services/SyncCookies.Services.csproj", "SyncCookies.Services/"]
COPY ["SyncCookies.Data/SyncCookies.Data.csproj", "SyncCookies.Data/"]
COPY ["SyncCookies.Models/SyncCookies.Models.csproj", "SyncCookies.Models/"]
RUN dotnet restore "SyncCookies.Api/SyncCookies.Api.csproj"
COPY . .
WORKDIR "/src/SyncCookies.Api"
RUN dotnet build "SyncCookies.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "SyncCookies.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "SyncCookies.Api.dll"]
