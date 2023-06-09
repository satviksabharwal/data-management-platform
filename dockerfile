FROM node:14

# Set an environmental variable
ENV REACT_APP_API_KEY=AIzaSyBy55gxeA4cAyrX2coNh392PalSWBZuSkA \
    REACT_APP_AUTHDOMAIN=planspiel-idm4.firebaseapp.com \
    REACT_APP_PROJECTID=planspiel-idm4 \
    REACT_APP_STORAGEBUCKET=planspiel-idm4.appspot.com \
    REACT_APP_MESSAGINGSENDERID=885128655265 \
    REACT_APP_APPID=1:885128655265:web:b11ba79fdcc9f40c285be0 \
    REACT_APP_MEASUREMENTID=G-ZXH6X6ZMNT \
    DANGEROUSLY_DISABLE_HOST_CHECK=true \
    NODE_OPTIONS="--max_old_space_size=4096" \
    STRIPE_SECRET_KEY="sk_test_51HqX6LEMcYHTtZjOKTPuNhxrhbAdm2cgTPWQIuJifMW1qfdpCpEZhqvfrSsYFFgNNHopjrlPoz9QoQkkwGmrs4DE00ocMhFgU7" \
    STRIPE_WEBHOOK_SECRET="whsec_dbdff2c6ad115875fa67d08eb7572fbf633df1a8b8a0ab5b3e2909d543aa94bd"
# Set the working directory to /app
WORKDIR /app

# Copy the package.json and yarn.lock files to the container
COPY . /app

# Copy the source code to the container
#COPY . .

# Build the project
RUN yarn install
RUN yarn build

# Expose port 3000
EXPOSE 3000

# Start the server
CMD ["yarn", "start"]