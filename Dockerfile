FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY tsconfig.json ./
COPY src ./src

RUN npm install -D typescript @types/node @types/ws && \
    npm run build && \
    npm prune --production

EXPOSE 8080

ENTRYPOINT ["node", "dist/cli.js"]
CMD ["--help"]
