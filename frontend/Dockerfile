FROM node:22 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Build-Arg und ENV vor dem Build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
