FROM node:20-alpine

WORKDIR /app

# Install backend dependencies first for better Docker layer caching
COPY backend/package*.json ./backend/
RUN npm --prefix backend ci --omit=dev

# Copy backend source
COPY backend ./backend

WORKDIR /app/backend

ENV NODE_ENV=production
EXPOSE 5000

CMD ["npm", "start"]
