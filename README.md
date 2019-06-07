# Serverless-APIGW-SQS-Plugin

![npm version](https://badge.fury.io/js/serverless-apigw-sqs-plugin.svg) ![serverless](http://public.serverless.com/badges/v3.svg)

A Serverless plugin that creates an AWS API Gateway resource to connect to an AWS Simple Queue Service (SQS) without the use of a lambda. Without the use of this plugin, any interactions with the queue through public network will need to go through a proxy lambda. AWS does not support FIFO queue to trigger Lambda functions so only standard queues are supported in this plugin.

More info please refer to: https://coderecipe.ai/architectures/17547953


## Installation
`npm install serverless-apigw-sqs-plugin`
## Usage

Add plugin to your serverless.yml file.

    plugins:
     - serverless-apigw-sqs-plugin

Set API endpoint name and SQS Queue name under custom parameters in your serverless.yml file:

    custom:
      apiGwSqs:
        apiEndpoint: '<your api endpoint name goes here>'
        queueName: '<queue name goes here, put .fifo as suffix if queue needs to be a fifo queue>'

Note: The queueName can only include alphanumeric characters, hyphens, or underscores. 1 to 80 in length.
API endpoint that is created will be listed under "endpoints" in the output of sls deploy.
