FROM alpine:3.12
COPY app /app
RUN apk add nodejs npm && \
    cd /app && npm install
ENTRYPOINT ["node", "/app/index.js"]
