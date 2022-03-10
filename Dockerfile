FROM node:14-alpine
WORKDIR /application
COPY . /application
RUN npm ci
RUN chmod 755 ./index.js
ENTRYPOINT ["node", "index.js"]
CMD ["-u", "http://localhost", "-p", "80", "-t", "10", "-c", "1000"]