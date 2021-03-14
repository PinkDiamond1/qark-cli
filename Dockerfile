FROM alpine:3.13.2 AS builder

# COPY APP SOURCES
COPY app /app
WORKDIR /app

# DEFINE NODE, NPM AND NEXE VERSIONS
ENV NODE_VERSION=12.9.1
ENV NPM_VERSION=7.6.3
ENV NEXE_VERSION=v3.3.7

# INSTALL DEPENDENCIES
RUN apk add --no-cache npm && \
    npm i -g npm@$NPM_VERSION && \
    npm i -g nexe@$NEXE_VERSION

# BUNDLE INTO SINGLE EXECUTABLE
RUN nexe -i "/app/index.js" -r "./contract/**/*" -t "alpine-x64-$NODE_VERSION" -o "/tmp/qark-cli" && \
    chmod +x /tmp/qark-cli

# USE LEAN CONTAINER
FROM alpine:3.13.2
COPY --from=builder /tmp/qark-cli /usr/local/bin/qark-cli
ENTRYPOINT [ "/usr/local/bin/qark-cli" ]
