# Platform CDK Project 🚀

## Pre-requisites

1. An aws account is required
2. AWS CLI needs to be installed on our system [MAC OSX pkg](https://awscli.amazonaws.com/AWSCLIV2.pkg)
3. Set up the aws cli with your aws account
4. Learn about CDK [Video Tutorial/Example by Nader Dabit](https://www.youtube.com/watch?v=pXd9BCwpjhA&t=1522s)

## Usage

Before beginning CDK development, in order to do the synths and diffs and deploys, you first need to **bootstrap**.

```
npm run bootstrap # for Test env
npm run bootstrap:prod # for Prod env
```

After bootstraping you are free to use CDK as you please, but whenever you need to switch **Environments** you need to remember to re-bootstrap for that environment.

Deploy Test:

```
npm run deploy TheStackName # Deploys single stack
npm run deploy:all # Deploys all stacks
npm run d:a # Deploys all stacks
```

Deploy Prod:

```
npm run deploy:prod TheStackName # Deploys single stack
npm run deploy:prod:all # Deploys all stacks
npm run d:p:a # Also deploys all stacks
```

Diff Test:

```
npm run diff
```

Diff Prod:

```
npm run diff:prod
```
# Gotcha's

## CDK Pipeline issues | Docker too many requests

_Error_

> fail: docker build
>
> too many requests: Rate exceeded

We were recieving this error because we were pulling docker images from the public repository at too frequent a rate.

To solve this we wanted to cache images in our [private ECR repository](https://us-west-1.console.aws.amazon.com/ecr/private-registry?region=us-west-1) and then referrence them in our docker files
eg:

```Docker
FROM --platform=linux/amd64 460727315916.dkr.ecr.us-west-1.amazonaws.com/ecr-public/lambda/nodejs:16.2022.08.17.10
```

In order to allow the CDK iam role which is assumed during our pipeline to access our own ECR registery we manually updated the
auto generated policy for the [cdk generated iam role](arn:aws:sts::460727315916:assumed-role/cdk-hnb659fds-image-publishing-role-460727315916-us-west-1/aws-cdk-vsts)... from only
having access to the prive CDK generated repository to all of our private repositories which inlcude our pull through caches.
