FROM node

# Install the correct npm version
RUN npm install -g n
COPY ./.nvmrc /app/.nvmrc
RUN n install `cat /app/.nvmrc`

# Install node packages
COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json
RUN cd /app && npm install

# Set up the entry point
WORKDIR /app
COPY ./entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]

# Run the server
CMD ["node", "/app/server.js"]

