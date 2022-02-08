FROM node:14
RUN apt-get update 
RUN sudo apt install python3.8 
RUN sudo apt-get install -y libreoffice 
RUN sudo apt-get install -y unoconv 
COPY . /app
WORKDIR /app
RUN npm install
CMD node ./server/server.js
