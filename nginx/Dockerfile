FROM nginx:latest
ADD ./static /app/static
RUN rm /etc/nginx/conf.d/default.conf && mkdir /app/logs && touch /app/logs/access.log && touch /app/logs/error.log
COPY crm.conf /etc/nginx/conf.d/crm.conf
