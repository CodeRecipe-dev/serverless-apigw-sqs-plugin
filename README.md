# Serverless-APIGW-SQS-Plugin

![npm version](https://badge.fury.io/js/serverless-apigw-sqs-plugin.svg) ![serverless](http://public.serverless.com/badges/v3.svg)
## Installation
`npm install serverless-apigw-sqs-plugin`
## Usage

Add plugin to your serverless.yml file.

    plugins:
     - serverless-apigw-sqs-plugin

Set API endpoint name and SQS Queue name under custom parameters in your serverless.yml file:

    custom:
      apiGwSqs:
        apiEndpoint: 'buy-order'
        queueName: 'OrderQueue'

API endpoint connected to the Queue that is created will be listed under "endpoints" in the output of sls deploy.
