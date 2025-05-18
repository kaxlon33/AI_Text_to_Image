# ================= FRONTEND =================
FROM node:18 AS client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ .

# ================= BACKEND ==================
FROM node:18 AS server
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ .

# ============ FINAL COMBINED IMAGE ==========
FROM node:18

WORKDIR /app

# Install pm2 globally
RUN npm install -g pm2

# Copy frontend and backend code
COPY --from=client /app/client ./client
COPY --from=server /app/server ./server

# Create pm2 config file
COPY ecosystem.config.js .

# Expose ports
EXPOSE 5137
EXPOSE 4000

# Start both services
CMD ["pm2-runtime", "ecosystem.config.js"]
