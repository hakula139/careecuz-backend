#!/bin/bash

# Use Node.js 16

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 16

# Start the server in production mode using pm2

export PATH="$(yarn global bin):$PATH"
pm2 start yarn --name careecuz-backend -- run start
pm2 save
