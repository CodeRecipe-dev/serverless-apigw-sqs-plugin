'use strict';
var AWS = require('aws-sdk');
var fs = require('fs');

class ServerlessApiGWSqsPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.apiEndpointUrl = "";

    this.hooks = {
      'before:deploy:deploy': this.beforeDeployResources.bind(this),
      'before:remove:remove': this.deleteStack.bind(this),
      'after:aws:info:displayEndpoints': this.setApiEndpoint.bind(this)
    };
  }
  setCloudFormation() {
    AWS.config.update({region:this.serverless.service.provider.region});
    this.cloudformation = new AWS.CloudFormation();
  }
  setApiEndpoint() {
    this.setCloudFormation()
    var stackName = this.getStackName(this.options.stage, this.serverless.service.service)
    var queueName = this.serverless.service.custom.apiGwSqs.queueName
    if (!queueName.includes(".")) {
      return new Promise((resolve, reject) => {
        this.cloudformation.describeStacks({StackName: stackName}, function(err, data) {
          if(!err) {
            console.log("  POST - "+data["Stacks"][0]["Outputs"][0]["OutputValue"]);
            resolve();
          }
        });
      });
    }
  }
  deleteStack() {
    this.setCloudFormation()
    var stackName = this.getStackName(this.options.stage, this.serverless.service.service)
    
    this.cloudformation.deleteStack({StackName: stackName}, function (err, data) {
      if (err) {
        this.serverless.cli.log("[CodeRecipe ApiGW SQS Plugin] Error: ", err.message);
      }
    }.bind(this));
  }
  getStackName(stage, serviceName) {
    return stage + "-" + serviceName + "-APIGW-SQS";
  }
  beforeDeployResources() {
    this.setCloudFormation()
    return new Promise((resolve, reject) => {
      fs.readFile(__dirname + '/' + 'template.yml', 'utf8', (err, contents) => {
        var stackName = this.getStackName(this.options.stage, this.serverless.service.service)
        var apiEndpoint = this.serverless.service.custom.apiGwSqs.apiEndpoint
        var queueName = this.serverless.service.custom.apiGwSqs.queueName
        var replaceStageName = new RegExp('STAGE_NAME', 'g');
        var replaceApiEndpoint = new RegExp('API_ENDPOINT', 'g');
        var replaceQueueName = new RegExp('QUEUE_NAME', 'g');
        contents = contents.replace(replaceStageName, this.options.stage);
        contents = contents.replace(replaceApiEndpoint, apiEndpoint);
        contents = contents.replace(replaceQueueName, queueName);
        var params = {
          Capabilities: [
            'CAPABILITY_IAM'
          ],
          StackName: stackName,
          TemplateBody: contents,
        };
        if (queueName.includes(".")) {
          console.log("[CodeRecipe ApiGW SQS Plugin] QueueName Error: Can only include alphanumeric characters, hyphens, or underscores. 1 to 80 in length")
          reject()
        }
        this.cloudformation.createStack(params, (err, data) => {
          if (err) {
            if(err.code == 'AlreadyExistsException') {
                // update stack instead
                this.cloudformation.updateStack(params, (err, data) => {
                  if (err) {
                    if (err.message == "No updates are to be performed.") {
                      this.serverless.cli.log("[CodeRecipe ApiGW SQS Plugin] No changes to ApiGW -> SQS")
                      resolve();
                    }
                  } else {
                    this.cloudformation.waitFor('stackCreateComplete', {StackName: stackName}, (err, data) => {
                      if (err) {
                        console.log(err.message);
                      } 
                      else {
                        this.serverless.cli.log("[CodeRecipe ApiGW SQS Plugin] Updated ApiGW -> SQS")
                      }
                      resolve();
                    });
                  }
                });
              } else {
                this.serverless.cli.log("[CodeRecipe ApiGW SQS Plugin] Error: ", err.message);
                resolve();
              }
            }
          else {
            this.serverless.cli.log("[CodeRecipe ApiGW SQS Plugin] Creating Api GW -> SQS")
            this.cloudformation.waitFor('stackCreateComplete', {StackName: stackName}, (err, data) => {
              if (err) {
                console.log(err.message);
              } 
              else {
                this.serverless.cli.log("[CodeRecipe ApiGW SQS Plugin] Created Api GW -> SQS")
              }
              resolve();
            });
          }
        });
      });
    })
  }
}

module.exports = ServerlessApiGWSqsPlugin;