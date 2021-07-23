import {
  CloudWatchLogsDecodedData,
  CloudWatchLogsEvent,
  CloudWatchLogsLogEvent,
  Context,
} from "aws-lambda";
import { gunzip } from "zlib";
import { promisify } from "util";
import SNS from "aws-sdk/clients/sns";

const snsClient = new SNS();

const topicArn = process.env["TOPIC_ARN"];
if (topicArn === undefined) {
  throw new Error("TOPIC_ARN must not be empty.");
}

const decodeGzip = (data: string): Promise<CloudWatchLogsDecodedData> =>
  new Promise((resolve, reject) => {
    const gzipBuffer = Buffer.from(data, "base64");
    gunzip(gzipBuffer, (err, res) => {
      if (err) {
        return reject(err);
      }
      const plainText = res.toString("utf-8");
      return resolve(JSON.parse(plainText));
    });
  });

const buildMessage = (
  event: CloudWatchLogsLogEvent,
  data: CloudWatchLogsDecodedData
): { subject: string; message: string } => {
  const isoTimestamp = new Date(event.timestamp).toISOString();

  const url = [
    "https://console.aws.amazon.com/cloudwatch/home",
    `?region=${process.env.AWS_REGION}`,
    `#logsV2:log-groups`,
    `/log-group/${encodeURIComponent(data.logGroup).replace(/%/g, "$25")}`,
    `/log-events/${encodeURIComponent(data.logStream).replace(/%/g, "$25")}`,
  ].join("");

  return {
    subject: `AWS log alert ${event.id} (AWS Account: ${data.owner})`,
    message: `AWS log alert

AWS Account
\t${data.owner}
Log Group
\t${data.logGroup}
Log Stream
\t${data.logStream}
Event Id
\t${event.id}
Timestamp
\t${isoTimestamp} (${event.timestamp})
URL
\t${url}
Message
\t${event.message}`,
  };
};

const publishToSNS = (
  client: SNS,
  params: SNS.Types.PublishInput
): Promise<SNS.Types.PublishResponse> =>
  new Promise((resolve, reject) => {
    client.publish(params, (err, res) => {
      if (err) {
        return reject(err);
      }
      return resolve(res);
    });
  });

export const handler = async (event: CloudWatchLogsEvent, context: Context) => {
  const data = await decodeGzip(event.awslogs.data);
  const messages = data.logEvents.map((event) => buildMessage(event, data));
  await Promise.all(
    messages.map((message) =>
      publishToSNS(snsClient, {
        TopicArn: process.env.TOPIC_ARN,
        Subject: message.subject,
        Message: message.message,
      })
    )
  );
};
