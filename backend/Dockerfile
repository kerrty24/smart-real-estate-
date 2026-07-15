FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy solution and restore dependencies
COPY *.slnx ./
COPY SmartRealEstate.Api/*.csproj ./SmartRealEstate.Api/
COPY SmartRealEstate.Core/*.csproj ./SmartRealEstate.Core/
COPY SmartRealEstate.Infrastructure/*.csproj ./SmartRealEstate.Infrastructure/
RUN dotnet restore SmartRealEstate.Api/SmartRealEstate.Api.csproj

# Copy everything and build
COPY . .
RUN dotnet publish SmartRealEstate.Api/SmartRealEstate.Api.csproj -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /out .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "SmartRealEstate.Api.dll"]
