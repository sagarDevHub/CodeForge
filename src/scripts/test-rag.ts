import "dotenv/config";

import { indexGithubRepo } from "@/lib/github/github-loader";

async function main() {
  await indexGithubRepo(
    "test-project",
    "https://github.com/sagarDevHub/Learning-git",
  );
}

main()
  .then(() => {
    console.log("Done");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
