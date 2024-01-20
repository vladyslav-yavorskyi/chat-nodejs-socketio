FROM node:18-alpine as builder

WORKDIR /usr/src/app

COPY package.json ./package.json
COPY package-lock.json ./package-lock.json


# Install dependencies
#RUN npm set progress=false \
#    && npm config set depth 0 \
#    && npm i install
RUN npm ci

COPY . .

EXPOSE 8080

CMD ["npm", "start", "dev", "redis-server"]