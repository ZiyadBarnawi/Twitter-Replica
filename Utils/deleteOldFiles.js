import fs from "fs/promises";

export const deleteOldFiles = (path, ...fileNames) => {
  fileNames.forEach(async (name) => {
    await fs.unlink(`${process.env.ROOT_PATH}/${path}/${name}`);
  });
};
