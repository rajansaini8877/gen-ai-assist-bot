const { BedrockAgentRuntimeClient, InvokeAgentCommand  } = require("@aws-sdk/client-bedrock-agent-runtime");

const config = {
    region: "eu-west-1"
};

const invokeBedrockAgentKB = async (prompt, sessionId) => {
    try {
        const client = new BedrockAgentRuntimeClient(config);
       
        const params = {
            agentId: '1VGGIAXJHZ',
            agentAliasId: '52GQYQOYYV',
            inputText: prompt,
            sessionId: sessionId,
        };

        const command = new InvokeAgentCommand(params);
        const response = await client.send(command);

        if (response.completion === undefined) {
            throw new Error("Completion is undefined");
        }

        let completion = "";
        for await (const chunkEvent of response.completion) {
            const chunk = chunkEvent.chunk;
            const decodedResponse = new TextDecoder("utf-8").decode(chunk.bytes);
            completion += decodedResponse;
        }

        return { sessionId, completion };
    } catch (error) {
        console.error("Error invoking the model:", error);
        throw error;
    }
}

module.exports = {
    invokeBedrockAgentKB
}
