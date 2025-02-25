import { CreateExampleInput, Example } from "../types/example.type";

const examples: Example[] = [
  {
    id: "1",
    title: "Example 1",
    description: "This is an example description.",
  },
  {
    id: "2",
    title: "Example 2",
    description: "This is another example description.",
  },
];

export const getExamples = async (): Promise<Example[]> => {
  return examples;
};

export const createExample = async (
  example: CreateExampleInput,
): Promise<Example> => {
  const curIndexes = examples.map((example) => Number(example.id)).sort();

  const newExample: Example = {
    id: `${curIndexes[curIndexes.length - 1] + 1}`,
    title: example.title,
    description: example.description,
  };
  examples.push(newExample);
  return newExample;
};
