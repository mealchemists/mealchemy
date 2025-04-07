FROM node:22-alpine

WORKDIR /app
# Set environment variables
# ENV REACT_APP_API_URL="https://backend-service-102081122635.us-west1.run.app/api"
# Install dependencies before copying everything else
COPY package*.json tsconfig.json ./
# COPY .env .env
RUN npm install

# Copy the entire frontend directory
COPY . .

# Set OpenSSL legacy provider due to typescript versioning issue
ENV NODE_OPTIONS="--openssl-legacy-provider"

CMD ["npm", "start"]