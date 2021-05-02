FROM alpine:3.13.5 AS builder

# COPY APP SOURCES
COPY app /app
WORKDIR /app

# DEFINE NPM AND PKG VERSIONS
ENV NPM_VERSION=7.11.2
ENV PKG_VERSION=v5.1.0

# INSTALL DEPENDENCIES
RUN apk add --no-cache npm && \
    npm i -g npm@$NPM_VERSION && \
    npm i -g pkg@$PKG_VERSION && \
    npm install

# BUNDLE INTO SINGLE EXECUTABLE
RUN pkg .

# USE LEAN CONTAINER
FROM alpine:3.13.5
COPY --from=builder /app/dist/qark-cli /usr/local/bin/qark-cli
ENTRYPOINT [ "/usr/local/bin/qark-cli" ]
