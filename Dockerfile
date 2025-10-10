# This image will be published as dspace/dspace-angular
# See https://github.com/DSpace/dspace-angular/tree/main/docker for usage details

ARG NODE_VERSION=22
ARG DSPACE_VERSION=dspace-cris-2024_02_x
ARG DOCKER_REGISTRY=docker.io

FROM ${DOCKER_REGISTRY:-docker.io}/4science/dspace-cris-angular-dependencies:${DSPACE_VERSION:-dspace-cris-2024_02_x} AS dev

WORKDIR /app
ADD . /app/
EXPOSE 4000

# When running in dev mode, 4GB of memory is required to build & launch the app.
# This default setting can be overridden as needed in your shell, via an env file or in docker-compose.
# See Docker environment var precedence: https://docs.docker.com/compose/environment-variables/envvars-precedence/
ENV NODE_OPTIONS="--max_old_space_size=4096"

# On startup, run in DEVELOPMENT mode (this defaults to live reloading enabled, etc).
# Listen / accept connections from all IP addresses.
# NOTE: At this time it is only possible to run Docker container in Production mode
# if you have a public URL. See https://github.com/DSpace/dspace-angular/issues/1485
ENV NODE_ENV=development
CMD ["yarn", "serve", "--host", "0.0.0.0"]
