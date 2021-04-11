## Snort

### Serverless URL shortening service

![Screenshot](docs/assets/screenshot.png)

https://snort.cc

#### Getting started

1. Deploy the AWS infrastructure by running: `cd ./cdk && npm run deploy:app`. The /cdk folder contains a standard AWS
   CDK project for defining the Infrastructure as Code (IaC).
2. Take the deployed API Gateway URL from the AWS CDK output and put it in the Angular (frontend) configuration
   file: `frontend/src/environments/environment.dev.ts`. The middleware that the Angular app uses to communicate with
   the backend (`BackendInterceptor.ts`) will take advantage of that value later on.
3. Start the frontend using `cd frontend && npm run start:dev`

#### Technology used

- AWS CDK - for Infrastructure as Code
- AWS API Gateway - for the REST APIs
- AWS Lambda - for handling backend requests and business logic (validation, etc)
- AWS S3 - for storing the frontend compiled artifacts (HTML, CSS, JS)
- AWS CloudFront - as the global CDN and traffic distribution proxy (frontend or backend)
- Angular - for the Frontend app
- TypeScript - for the Frontend app and Lambdas
- BrowserSync - for the lite-server that helps with local frontend development
