import { InferenceClient } from "@huggingface/inference";

const hf = new InferenceClient(process.env.HF_API_KEY);

export async function generateEmbeddings(text: string) {
  const embedding = await hf.featureExtraction({
    model: "BAAI/bge-small-en-v1.5",
    inputs: text.replace(/\n/g, " "),
  });

  return embedding as number[];
}
