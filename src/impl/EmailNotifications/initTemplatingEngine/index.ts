import path from "path";
import fs from "fs/promises";
import hbs from "handlebars";

export default async function initTemplatingEngine(templatesDirPath: string) {
  const partialsDirPath = path.join(templatesDirPath, "partials/");
  const templatesFilePaths = await getHandlebarsFilePaths(templatesDirPath);
  const partialsFilePaths = await getHandlebarsFilePaths(partialsDirPath);

  await initPartials(partialsDirPath, partialsFilePaths);
  const templates = await initTemplates(templatesDirPath, templatesFilePaths);

  return { templates };

  async function getHandlebarsFilePaths(dirPath: string) {
    return (await fs.readdir(dirPath)).filter((fp) => fp.endsWith(".hbs"));
  }

  async function initPartials(
    partialsDirPath: string,
    partialsFilePaths: string[]
  ) {
    const promises = partialsFilePaths.map(async (fp) => {
      const partialName = path.parse(fp).name;
      const content = await fs.readFile(path.join(partialsDirPath, fp), "utf8");
      hbs.registerPartial(partialName, content);
    });
    await Promise.all(promises);
  }

  async function initTemplates(
    templatesDirPath: string,
    templatesFilePaths: string[]
  ) {
    const templates = new Map<string, (context: any) => string>();
    const promises = templatesFilePaths.map(async (fp) => {
      const templateName = path.parse(fp).name;
      const content = await fs.readFile(
        path.join(templatesDirPath, fp),
        "utf8"
      );
      templates.set(templateName, hbs.compile(content));
    });
    await Promise.all(promises);
    return templates;
  }
}
