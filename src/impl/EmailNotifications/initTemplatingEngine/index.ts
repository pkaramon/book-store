import { join as joinPaths, parse as parsePath } from "path";
import fs from "fs/promises";
import hbs from "handlebars";

export default async function initTemplatingEngine(templatesDirPath: string) {
  const partialsDirPath = joinPaths(templatesDirPath, "partials/");
  const allHandleBarsFilePaths = await readdirrec(templatesDirPath);
  const partialsFilePaths = allHandleBarsFilePaths.filter((p) =>
    isFilePathPartial(p)
  );
  const templatesFilePaths = allHandleBarsFilePaths.filter(
    (p) => !isFilePathPartial(p)
  );

  await initPartials(partialsFilePaths);
  const templates = await initTemplates(templatesFilePaths);

  return { templates };

  async function initPartials(partialsFilePaths: string[]) {
    function getPartialNameFromPath(filePath: string) {
      const relative = filePath.replace(partialsDirPath, "");
      return removeExt(relative);
    }

    const promises = partialsFilePaths.map(async (fp) => {
      const partialName = getPartialNameFromPath(fp);
      const content = await fs.readFile(fp, "utf8");
      hbs.registerPartial(partialName, content);
    });
    await Promise.all(promises);
  }

  async function initTemplates(templatesFilePaths: string[]) {
    function getTemplateNameFromPath(filePath: string) {
      const relative = filePath.replace(templatesDirPath, "").slice(1);
      return removeExt(relative);
    }

    const templates = new Map<string, (context: any) => string>();
    const promises = templatesFilePaths.map(async (fp) => {
      const templateName = getTemplateNameFromPath(fp);
      const content = await fs.readFile(fp, "utf8");
      templates.set(templateName, hbs.compile(content));
    });
    await Promise.all(promises);
    return templates;
  }
}

function removeExt(filePath: string) {
  const { name, dir } = parsePath(filePath);
  return joinPaths(dir, name);
}

async function readdirrec(rootPath: string): Promise<string[]> {
  const childrenPaths = (await fs.readdir(rootPath)).map((path) =>
    joinPaths(rootPath, path)
  );

  const children = await Promise.all(
    childrenPaths.map(async (p) => {
      const stats = await fs.lstat(p);
      return {
        path: p,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
      };
    })
  );

  const filePaths = children.filter((c) => c.isFile).map((c) => c.path);
  const directoryPaths = children
    .filter((c) => c.isDirectory)
    .map((c) => c.path);

  const rest = await Promise.all(
    directoryPaths.map((path) => readdirrec(path))
  );
  return filePaths.concat(...rest);
}

function isFilePathPartial(filePath: string) {
  return /partials\/.*?.hbs/.test(filePath);
}
