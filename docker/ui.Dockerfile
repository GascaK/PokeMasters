FROM nginx:1.17.1-alpine

COPY ui/dist/ui /usr/share/nginx/html
