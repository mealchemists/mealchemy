FROM node:22-alpine

WORKDIR /app

# Install dependencies before copying everything else
COPY package*.json tsconfig.json ./

RUN npm install

# Copy the entire frontend directory
COPY . .

# Set OpenSSL legacy provider due to typescript versioning issue
ENV NODE_OPTIONS="--openssl-legacy-provider"

CMD ["npm", "start"]
