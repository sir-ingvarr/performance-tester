FROM node:17-alpine
WORKDIR /application
COPY . .
RUN npm ci
RUN chmod 755 ./index.js
ENTRYPOINT ["node", "index.js"]
CMD ["-a", "http://localhost", "-p", "80", "-t", "10", "-c", "1000", "-r", "60", "-m", "http"]