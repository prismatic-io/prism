import fs from "fs";
import path from "path";
import InitializeComponent from ".";

const tempPath = "src/commands/components/init/temp";
if (!fs.existsSync(tempPath)) {
  fs.mkdirSync(tempPath);
}
process.chdir(tempPath);

const componentGenerationTimeout = 5 * 60 * 1000; // 5 minutes

interface SpecMeta {
  specName: string;
  componentName: string;
}

const specFiles = fs.readdirSync("../fixtures/specs");
const specs = specFiles.reduce(
  (result, fileName) => {
    if (fileName.endsWith(".wsdl")) {
      const [componentName] = fileName.toLowerCase().split(".");
      result.wsdl.push({
        specName: fileName,
        componentName,
      });
    }
    return result;
  },
  { wsdl: [] as SpecMeta[] }
);

const generatedFiles = {
  wsdl: ["actions.ts", "triggers.ts", "index.ts", "inputs.ts"],
};

// NOTE: OpenAPI and basic scaffolding tests are moved to the spectral repo under the generator package
describe("component generation tests", () => {
  describe("wsdl", () => {
    for (const { specName, componentName } of specs.wsdl) {
      describe(`${specName} generation`, () => {
        it(
          "should generate successfully",
          async () => {
            await InitializeComponent.run([
              componentName,
              `--wsdl-path=../fixtures/specs/${specName}`,
            ]);
          },
          componentGenerationTimeout
        );

        for (const filename of generatedFiles.wsdl) {
          it(`should match ${filename} snapshot`, async () => {
            const contents = fs
              .readFileSync(path.join(componentName, "src", filename))
              .toString();
            expect(contents).toMatchSnapshot(`${componentName}-${filename}`);
          });
        }
      });
    }
  });
});
