require("dotenv").config();

import contributors from "./src/index";
import fs from "fs/promises";
import path from "path";

const token = process.env.TOKEN;
const excludedAccounts = [
  "verdacciobot",
  "github-actions[bot]",
  "dependabot-preview[bot]",
  "dependabot[bot]",
  "64b2b6d12bfe4baae7dad3d01",
  "greenkeeper[bot]",
  "snyk-bot",
  "allcontributors[bot]",
  "renovate[bot]",
  "undefined",
  "renovate-bot",
];

(async () => {
  try {
    const result = await contributors({
      token: token as string,
      organization: "verdaccio",
      excludedAccounts,
      allowFork: false,
      allowPrivateRepo: false,
    });
    const pathContributorsFile = path.join(__dirname, "contributors.json");
    // for the website
    await fs.writeFile(pathContributorsFile, JSON.stringify(result, null, 4));
    const contributorsListId = result.contributors.map((contributor: any) => {
      return { username: contributor?.login, id: contributor.id };
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("error on update", err);
    process.exit(1);
  }
})();
