# ---- Dependencies ----
FROM node:23-alpine AS dependencies

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn

# ---- Build ----
FROM dependencies AS build

WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

RUN yarn build

# ---- Production ----
FROM build AS production

WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/yarn.lock ./yarn.lock

EXPOSE 3000

CMD ["yarn", "start"]
