"use strict";

require("dotenv").config();

const AWS = require("aws-sdk");
const contentfulExport = require("contentful-export");
const mkdir = require("make-dir");
const path = require("path");
const s3 = require("s3");

const postToSlack = require("./post-to-slack");
const uploadToS3 = require("./contentful-backup/lib/upload-to-s3");

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

const runBackup = async () => {
  console.log("Creating export directory...");
  const exportDir = await createExportDir();
  console.log(`Created export directory ${exportDir}.`);

  console.log(`Exporting space ${spaceId}...`);
  try {
    await contentfulExport({
      spaceId,
      managementToken,
      exportDir,
      includeDrafts: true,
      downloadAssets: true,
      maxAllowedLimit: 10,
    });
  } catch (e) {
    postToSlack(
      "The Contentful backup failed while exporting from Contentful. " +
        e.message
    );
  }
  console.log(`Exported space ${spaceId}`);

  console.log("Initializing S3 client...");
  const s3Client = s3.createClient({
    s3Client: new AWS.S3({
      region: process.env.AWS_REGION,
      signatureVersion: "v4",
    }),
  });

  console.log("Uploading files to S3...");
  await uploadToS3(s3Client);
  console.log("Finished uploading files to S3.");

  console.log("Posting notification to Slack webhook...");
  await postToSlack(
    `A new Contentful backup was saved to <https://console.aws.amazon.com/s3/buckets/${process.env.AWS_S3_BUCKET_NAME}|S3>.`
  );
  console.log("Finished posting notification to Slack webhook.");
};

runBackup();
