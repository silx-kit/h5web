# 
# Build stage 1.
#
FROM node:16-alpine

COPY . ./h5web/
WORKDIR /h5web
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm build
EXPOSE 80
CMD pnpm serve

#
# Build stage 2.
#

FROM nginx:alpine
COPY --from=0 /h5web/apps/demo/dist/ /usr/share/nginx/html/
