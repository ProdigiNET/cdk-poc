import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import { Bucket, IBucket } from 'aws-cdk-lib/aws-s3';
import { SqsDestination } from 'aws-cdk-lib/aws-s3-notifications';
import { IQueue, Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

export interface TheBridgeConstructProps {
  isProd: boolean;
}

export class TheBridgeConstruct extends Construct {
  readonly queue: IQueue;
  readonly bucket: IBucket;
  readonly processedBucket: IBucket;

  constructor(scope: Construct, id: string, props: TheBridgeConstructProps) {
    super(scope, id);

    const { isProd } = props;

    const suffix = isProd ? 'prod' : 'test';

    this.bucket = new Bucket(this, `${id}-bucket`, {
      bucketName: `destination-bucket-${suffix}`,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.processedBucket = new Bucket(this, `${id}-processed-bucket`, {
      bucketName: `processed-bucket-${suffix}`,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    this.queue = new Queue(this, `${id}-queue`, {
      visibilityTimeout: Duration.hours(2),
    });



    this.bucket.addObjectCreatedNotification(new SqsDestination(this.queue));

    // create the lambda
    const environment = {};
    const dockerfileDir = path.join(__dirname, '../Dockerfile');

    const processingTimeout = Duration.minutes(1);
    const corelogicPropertyBasicLambda = new lambda.DockerImageFunction(this, `${id}-lambda`, {
      functionName: `my-lambda-${suffix}`,
      code: lambda.DockerImageCode.fromImageAsset(dockerfileDir),
      timeout: processingTimeout,
      allowPublicSubnet: true,
      environment,
    });

    // add lambda as a processor of the queue
  }
}
