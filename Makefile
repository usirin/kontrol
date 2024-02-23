.PHONY: build-dev
build-dev: ## Build the dev docker image.
	docker compose -f docker/dev/docker-compose.yml build

.PHONY: start-dev
start-dev: ## Start the dev docker container.
	docker compose -f docker/dev/docker-compose.yml up --build
