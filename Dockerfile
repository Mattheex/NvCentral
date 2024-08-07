# Use the stain/jena-fuseki as the base image
FROM stain/jena-fuseki:latest

USER root

# Install necessary dependencies
RUN apk update && \
    apk add --no-cache supervisor nodejs npm openssh apt sudo mutt vim msmtp ca-certificates tzdata alpine-conf

# Create directories for client, server, and supervisor logs
RUN mkdir -p /app/client /app/server /var/log/supervisor

# Set the timezone to Europe/Paris

RUN export ADMIN_PASSWORD=$(cat /run/secrets/secretKEY)

ARG secretKEY

ENV ADMIN_PASSWORD=${secretKEY}
ENV secretKEY=${secretKEY}
ENV NODE_ENV development

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
RUN npm run build

# Copy and install server
COPY server/package*.json /app/server/
WORKDIR /app/server
RUN npm install
COPY server /app/server

# Supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

#ENV ADMIN_PASSWORD ${secretKEY}

# Expose necessary ports
EXPOSE 3000 5000 3030 25

# Set entrypoint for Fuseki and command to start supervisor
ENTRYPOINT ["sh", "/docker-entrypoint.sh"]
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
