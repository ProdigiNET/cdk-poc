FROM --platform=linux/amd64 460727315916.dkr.ecr.us-west-1.amazonaws.com/ecr-public/datadog/lambda-extension:latest as dd

FROM --platform=linux/amd64 460727315916.dkr.ecr.us-west-1.amazonaws.com/ecr-public/lambda/nodejs:16.2022.08.17.10 as build
WORKDIR /build
COPY package*.json ./
COPY .npmrc ./
RUN npm ci
COPY . .
RUN npm run build

FROM --platform=linux/amd64 460727315916.dkr.ecr.us-west-1.amazonaws.com/ecr-public/lambda/nodejs:16.2022.08.17.10
WORKDIR ${LAMBDA_TASK_ROOT}
COPY package*.json ./
COPY .npmrc ./
RUN npm ci --production
COPY --from=build /build/dist .
# DATADOG setup https://docs.datadoghq.com/serverless/installation/nodejs/?tab=containerimage
RUN npm install datadog-lambda-js dd-trace
COPY --from=dd /opt/extensions/ /opt/extensions
# override the original handler with the datadog handler
ENV DD_LAMBDA_HANDLER=index.handler
ENV DD_SITE=datadoghq.com
CMD ["node_modules/datadog-lambda-js/dist/handler.handler"]
