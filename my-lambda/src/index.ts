import "dd-trace/init";
import { SQSBatchItemFailure, SQSEvent, SQSHandler } from "aws-lambda";
import * as aws from "aws-sdk";
import { ECS } from "aws-sdk";
import { PutEventsRequestEntry } from "aws-sdk/clients/eventbridge";

const eventBusName = process.env.PROPERTY_DATA_PIPELINE_EVENTBUS_NAME

export const handler: SQSHandler = async (e: SQSEvent) => {
  const eventbridge = new aws.EventBridge();
  const ecs = new ECS();

  const publishEvent = (req: PutEventsRequestEntry) => {
    const eventBridgeParams = {
      Entries: [req],
    };
    return eventbridge
      .putEvents(eventBridgeParams)
      .promise()
      .then((e) => {
        console.log("event sent!", e);
        return e;
      })
      .catch((error: any) => {
        throw new Error(error);
      });
  };

  const records = e.Records;

  const batchItemFailures: SQSBatchItemFailure[] = [];



  for (const record of records) {
    console.log("processing s3 events " + record.body);

    const payload = JSON.parse(record.body);

    let s3eventRecords = payload.Records;
    if(!s3eventRecords)
    {
      console.log(`s3eventRecords is invalid: ${payload}`);
      return;
    }

    console.log("records ", s3eventRecords);

    for (const s3event of s3eventRecords) {
      console.log("s3 event ", s3event);
      //Extract variables from event
      const objectKey = s3event?.s3?.object?.key;
      const bucketName = s3event?.s3?.bucket?.name;
      const bucketARN = s3event?.s3?.bucket?.arn;

      console.log("Object Key - " + objectKey);
      console.log("Bucket Name - " + bucketName);
      console.log("Bucket ARN - " + bucketARN);

      if (
        typeof objectKey === "undefined" ||
        typeof bucketName === "undefined" ||
        typeof bucketARN === "undefined"
      ) {
        console.log("not an s3 event...");
        return;
      }

      params.overrides = {
        containerOverrides: [
          {
            environment: [
              {
                name: "S3_BUCKET_NAME",
                value: bucketName,
              },
              {
                name: "S3_OBJECT_KEY",
                value: objectKey,
              },
            ],
            name: CONTAINER_NAME,
          },
        ],
      };

      const ecsResponse = await ecs
        .runTask(params)
        .promise()
        .catch((error: any) => {
          batchItemFailures.push({
            itemIdentifier: record.messageId,
          });
          publishEvent({
            DetailType: "exception",
            EventBusName: eventBusName,
            Source: "properties-data-pipeline.the-shredder-invoker",
            Time: new Date(),
            // Main event body
            Detail: JSON.stringify({
              error,
              originalEvent: e,
            }),
          });
        });

      console.log("ECS Response", ecsResponse);

      // Building our ecs started event for EventBridge
      publishEvent({
        DetailType: "the-shredder-started",
        EventBusName: eventBusName,
        Source: "properties-data-pipeline.the-shredder-invoker",
        Time: new Date(),
        // Main event body
        Detail: JSON.stringify({
          status: "success",
          data: ecsResponse,
          bucket: bucketName,
          objectKey: objectKey,
        }),
      });
    }
  }

  console.log("Batch Item Failures", batchItemFailures);

  return {
    batchItemFailures,
  };
};
