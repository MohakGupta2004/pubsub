# pubsub

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.5. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.


```index.ts
const functions = require('@google-cloud/functions-framework');
const { RetellService } = require('./retell.js');

functions.cloudEvent('helloPubSub', async (cloudEvent) => {

  const base64data = cloudEvent.data?.message?.data;
  const data = base64data
    ? Buffer.from(base64data, "base64").toString()
    : "{}";

  const job = JSON.parse(data);
    console.log(data)

  const { metadata, from_number, agentId, dynamicVariables = {} } = job;

  console.log(`AgentId: ${agentId}`);

  const to_number = dynamicVariables?.phone_number;

  // Avoid mutating original object reference
  const vars = {
    ...dynamicVariables,
    followBackCall: "true",
  };

  try {
    const phoneCall = await RetellService.createPhoneCall({
      from_number,
      to_number,
      override_agent_id: agentId,
      retell_llm_dynamic_variables: vars,
      metadata,
    });

    console.log("Phone call created:", phoneCall);

    return phoneCall;

  } catch (e) {
    console.error(`error Retell: ${e}`);
    throw e;   // important so PubSub can retry
  }
});
```

```retell.ts

const Retell = require('retell-sdk');

const RETELL_API_KEY = process.env.RETELL_API_KEY;

if (!RETELL_API_KEY) {
  throw new Error("RETELL_API_KEY is not defined");
}

const retellClient = new Retell({ apiKey: RETELL_API_KEY });

class RetellService {
  static async createPhoneCall(params) {
    return await retellClient.call.createPhoneCall(params);
  }

  static async getCallDetails(callId) {
    return await retellClient.call.retrieve(callId);
  }

  static async createBatchCall(params) {
    return await retellClient.batchCall.createBatchCall(params);
  }
}

module.exports = { RetellService };
```

This is the worker code. Deployed on cloud functions.
