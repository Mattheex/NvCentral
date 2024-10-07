# Use the stain/jena-fuseki as the base image
FROM stain/jena-fuseki:latest


USER root

COPY Database /jena-fuseki/

# Install necessary dependencies
RUN apk update && \
    apk add --no-cache supervisor nodejs npm apt sudo vim 
#mutt msmtp ca-certificates tzdata alpine-conf python3 make g++

# Create directories for client, server, and supervisor logs
RUN mkdir -p /app/client /app/server /var/log/supervisor

# Set the timezone to Europe/Paris

#RUN export ADMIN_PASSWORD=$(cat /run/secrets/secretKEY)

ARG secretKEY
ARG smtpPass

ENV ADMIN_PASSWORD=${secretKEY}
ENV secretKEY=${secretKEY}
ENV smtpPass=${smtpPass}

# RUN --mount=type=secret,id=key \
#     --mount=type=secret,id=smtpPass \
#     ls /run/secrets \
#     export ADMIN_PASSWORD=$(cat /run/secrets/key) \
#     cat /run/secrets/key


ENV NODE_ENV=production

# Set up SSH
#RUN mkdir /var/run/sshd && \
#    echo 'root:root' | chpasswd && \
#    sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config && \
#    sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config && \
#    ssh-keygen -A



# Copy and build client
COPY client/package*.json /app/client/
WORKDIR /app/client
RUN npm install
COPY client /app/client
#RUN npm run build

# Copy and install server
COPY server/package*.json /app/server/
WORKDIR /app/server
#RUN npm rebuild bcrypt --build-from-source
RUN npm install
COPY server /app/server


# Supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh 


#ENV ADMIN_PASSWORD ${secretKEY}

# Expose necessary ports
EXPOSE 3000 5000 3030

# Set entrypoint for Fuseki and command to start supervisor
ENTRYPOINT ["sh", "/docker-entrypoint.sh"]
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
