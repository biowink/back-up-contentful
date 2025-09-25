"use strict";

require("dotenv").config();
const contentfulExport = require("contentful-export");
const mkdir = require("make-dir");
const path = require("path");

// Get Contentful Management Token from env
const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
if (!managementToken) {
  throw new Error("Missing env variable CONTENTFUL_MANAGEMENT_TOKEN: string");
}

// Get Contentful Space ID to backup
var spaceId = process.env.CONTENTFUL_SPACE_IDS;
if (!spaceId) {
  throw new Error("Missing env variable CONTENTFUL_SPACE_IDS: string");
}

const createExportDir = async () => {
  const exportDir = path.resolve(
    (process.env.EXPORT_DIR || "/tmp/contentful-export") +
      "/" +
      new Date().toISOString()
  );

  try {
    await mkdir(exportDir);
    return exportDir;
  } catch (error) {
    throw new Error(error);
  }
};

const exportContentfulSpace = async () => {
  console.log("Creating export directory...");
  let exportDir;
  try {
    exportDir = await createExportDir();
    console.log(`Created export directory ${exportDir}.`);
  } catch (err) {
    console.error("Failed to create export directory:", err.message);
    throw err;
  }

  console.log(`Exporting space ${spaceId}...`);
  try {
    await contentfulExport({
      spaceId,
      managementToken,
      exportDir,
      includeDrafts: true,
      downloadAssets: true,
      maxAllowedLimit: 10,
      retryLimit: 10,      // Number of retries
      retryDelay: 2000     // Delay in ms between retries
    });
  } catch (e) {
    if (e.message && e.message.includes("rate limit")) {
      console.error("Rate limit error detected. Consider increasing retryDelay, reducing maxAllowedLimit, or running the export at a different time.");
    }
    console.error(
      "The Contentful export failed while exporting from Contentful.\nError: " +
        (e.stack || e.message || e)
    );
    throw e;
  }
  console.log(`Exported space ${spaceId}`);
  return exportDir;
};

module.exports = { exportContentfulSpace };

// Allow running the export directly from CLI
if (require.main === module) {
  exportContentfulSpace()
    .then(dir => {
      console.log(`Export completed. Data saved in: ${dir}`);
    })
    .catch(err => {
      console.error("Export failed:", err);
      process.exit(1);
    });
}
