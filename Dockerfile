FROM node:14
RUN apt-get update 
RUN apt-get install python
RUN apt-get install default-jdk
RUN apt-get install default-jre
RUN apt-get install -y libreoffice 
RUN apt-get install -y unoconv 
COPY . /app
WORKDIR /app
RUN npm install
CMD node ./server/server.js
