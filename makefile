.PHONY: buildnrun bnr help

# The default goal is 'help'
.DEFAULT_GOAL := help

# Main build and run target
buildnrun:
	@$(MAKE) -s _buildnrun CMD=$(filter-out $@,$(MAKECMDGOALS))

# Alias for buildnrun
bnr:
	@$(MAKE) -s _buildnrun CMD=$(filter-out $@,$(MAKECMDGOALS))

# Internal buildnrun target
_buildnrun:
ifeq ($(CMD),admin/wss)
	docker build -f apps/admin/docker/wss.Dockerfile -t animadate/admin-wss --network host .
	docker run -e PORT=8080 --network host animadate/admin-wss
else ifeq ($(CMD),admin/app)
	docker build -f apps/admin/docker/app.Dockerfile -t animadate/admin-app --network host .
	docker run -e PORT=8080 --network host animadate/admin-app
else ifeq ($(CMD),app)
	docker build -f apps/app/Dockerfile -t animadate/app --network host .
	docker run -e PORT=8080 --network host animadate/app
else ifeq ($(CMD),landing)
	docker build -f apps/landing/Dockerfile -t animadate/landing --network host .
	docker run -e PORT=8080 --network host animadate/landing
else ifeq ($(CMD),cron)
	docker build -f apps/cron/Dockerfile -t animadate/cron --network host .
	docker run --network host animadate/cron
else
	@echo "Please provide a valid target. List of available targets:"
	@echo "  - admin/wss"
	@echo "  - admin/app"
	@echo "  - app"
	@echo "  - landing"
	@echo "  - cron
endif

# Help message
help:
	@echo "Available commands:"
	@echo "  make buildnrun <target>   - Build and run the Docker container for <targt>"
	@echo "  make bnr <target>         - Alias for buildnrun <target>"
	@echo "  make help                 - Display this help message"