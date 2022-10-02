import yeoman from "yeoman-environment";

// TODO: Derive this from the generator package
const generatorTypes = [
  "component",
  "action",
  "trigger",
  "dataSource",
  "connection",
  "formats",
] as const;
type GeneratorType = typeof generatorTypes[number];

export const runGenerator = async (
  generatorName: GeneratorType,
  options?: Record<string, unknown>
): Promise<void> => {
  if (!generatorTypes.includes(generatorName)) {
    throw new Error(`Invalid generator type specified: ${generatorName}`);
  }

  const env = yeoman.createEnv();
  env.register(
    require.resolve(
      `@prismatic-io/generator-spectral/generators/${generatorName}`
    ),
    generatorName
  );
  await env.run(generatorName, options);
};
