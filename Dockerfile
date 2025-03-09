# setting baseline image
FROM node:18-alpine
# specifying my working directory
WORKDIR /srv
# installing system dependencies
RUN apk add --no-cache python3 make g++ nano curl
# copying the package.json file
COPY package.json ./
# installing all dependencies
RUN npm install
# copying the rest of the files
COPY . .
# starting the server
CMD ["tail", "-f", "/dev/null"]