# --------------------------------------------------
# 1. Build stage
# --------------------------------------------------
FROM golang:1.25-alpine AS builder

# Install git (needed for go modules)
RUN apk add --no-cache git

WORKDIR /app

# Cache modules first
COPY go.mod go.sum ./
RUN go mod download

# Copy source
COPY . .

# Only un-comment these if you want to modify the port (and host)
# ENV HOST localhost
# ENV PORT 8088

# Build binary (static)
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o server .

# --------------------------------------------------
# 2. Final runtime image
# --------------------------------------------------
FROM alpine:3.22.2

# Create user (non-root)
RUN adduser -D tonyq

WORKDIR /app

# Copy binary
COPY --from=builder /app/server .

# Use unprivileged user
USER tonyq

# Expose port
EXPOSE 8088

CMD ["./server"]
