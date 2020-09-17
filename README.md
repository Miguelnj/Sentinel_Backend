# Sentinel_Backend
This repository contains all the necessary files that compose the Backend of the Sentinel project.

  - emailTemplates --> Contains the template for the email to be sent to the user with the event details.
  - flask_api_fdp --> Provisional flask api which processes a video.
  - Lambda --> Necessary code for all the lambda functions.

The services used for this project are all from AWS:
  - Elastic Beanstalk for flask_api_fdp
  - Lambda
  - CloudWatch
  - API Gateway
  - SES
  - S3
  - Cognito
  - DynamoDB
  - IAM
  - Rekognition
  
For next iterations, it is planned to wrap all the services with Serverless Framework.
