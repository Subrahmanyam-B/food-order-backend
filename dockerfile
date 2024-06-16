FROM node:18-alpine

WORKDIR /app

COPY package.json ./
COPY tsconfig.json ./
COPY src/ ./src/

RUN npm install

COPY . .

RUN npm run build

# Define a build-time argument for the port
ARG PORT=3001

# Set the environment variable for the port
ENV PORT $PORT

# Expose the port using the build-time argument
EXPOSE $PORT

CMD ["npm", "start"]
