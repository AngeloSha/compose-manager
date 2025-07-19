##########  build Go server  ##########
FROM golang:1.24 AS backend
WORKDIR /src
COPY backend/ .
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o /server .

##########  build React UI  ##########
FROM node:22 AS ui
WORKDIR /ui
RUN corepack enable && corepack prepare pnpm@8 --activate
COPY web/ .
RUN pnpm install --frozen-lockfile && pnpm run build

##########  final runtime image  ######
FROM gcr.io/distroless/static:nonroot
LABEL org.opencontainers.image.title="Compose Manager"
COPY --from=backend /server /usr/local/bin/server
COPY --from=ui /ui/dist /opt/web
VOLUME ["/data"]
EXPOSE 8080
USER nonroot
ENTRYPOINT ["/usr/local/bin/server", "--web", "/opt/web"]

