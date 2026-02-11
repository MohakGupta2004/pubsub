//   projectId = "realtygenie", // Your Google Cloud Platform project ID
//   topicNameOrId = "test", // Name for the new topic to create
//
//AGENT_ID=agent_a858e4ad7d62bcc74758c9946c
//FROM_NUMBER=+17787190711
//   subscriptionName = "test-sub", // Name for the new subscription to create
// /**
//  * TODO(developer): Uncomment these variables before running the sample.
// */
// const topicNameOrId = 'YOUR_TOPIC_NAME_OR_ID';
// const data = JSON.stringify({foo: 'bar'});

// Imports the Google Cloud client library
import { Message, PubSub } from "@google-cloud/pubsub";
import { CloudTasksClient, protos } from "@google-cloud/tasks";
import express from "express";
// Creates a client; cache this for further use
const pubSubClient = new PubSub({
  projectId: "realtygenie",
});

const client = new CloudTasksClient({});
async function publishMessage(topicNameOrId: string, data: string) {
  // Publishes the message as a string, e.g. "Hello, world!" or JSON.stringify(someObject)
  const dataBuffer = Buffer.from(data);

  // Cache topic objects (publishers) and reuse them.
  const topic = pubSubClient.topic(topicNameOrId);
  try {
    const messageId = await topic.publishMessage({ data: dataBuffer });
    console.log(`Message ${messageId} published.`);
  } catch (error) {
    console.error(
      `Received error while publishing: ${(error as Error).message}`,
    );
    process.exitCode = 1;
  }
}

const app = express();
app.use(express.json());

app.post("/publish", (req, res) => {
  const { number } = req.body;
  publishMessage(
    "test",
    JSON.stringify({
      metadata: {},
      from_number: "+17787190711",
      agentId: "agent_e14bce1fdc6d24606adcd83211",
      dynamicVariables: {
        phone_number: number,
      },
    }),
  );
  res.status(200).json({
    message: "yo",
  });
});

app.post("/schedule", async (req, res) => {
  const { number } = req.body;
  const project = "realtygenie";
  const location = "us-west1";
  const queue = "test-queue";
  const parent = client.queuePath(project, location, queue);
  const payload = JSON.stringify({
    numer: number,
  });
  const task : protos.google.cloud.tasks.v2.ITask = {
    httpRequest: {
      httpMethod: "POST",
      url: "http://localhost:3000/publish",
      body: Buffer.from(payload).toString("base64"),
    },
    scheduleTime: {
        seconds: Math.floor(Date.now() / 1000) + 120,
    },
  };

  const [response] = await client.createTask({ parent, task });
  res.status(200).json({
    message: "yo",
    response,
  });
});
const port = process.env.PORT || 8080; 

app.listen(port,  () => {
  console.log(`Service started on port ${port}`);
});
