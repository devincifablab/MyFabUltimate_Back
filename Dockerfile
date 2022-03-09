FROM node

COPY ./package*.json /home/node/MyFabUltimate_Back/
WORKDIR /home/node/MyFabUltimate_Back/
VOLUME ./logs
VOLUME ./data
RUN npm install
COPY . .
RUN npm run prepareFolders
