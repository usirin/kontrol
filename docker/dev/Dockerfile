FROM node:20-alpine as base
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

RUN pnpm install --global turbo
WORKDIR /app

FROM base as builder
ARG WORKSPACE

COPY . .
RUN turbo prune $WORKSPACE --docker

FROM base AS installer
ARG WORKSPACE
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN pnpm install

COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

