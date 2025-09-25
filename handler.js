"use strict";

require("dotenv").config();

const AWS = require("aws-sdk");
const { exportContentfulSpace } = require("./contentful-export");
const path = require("path");
const s3 = require("s3");

const postToSlack = require("./post-to-slack");
const { uploadDirectoryToS3 } = require("./s3-upload");

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

// Export logic moved to contentful-export.js

const runBackup = async () => {
  let exportDir;
  try {
    exportDir = await exportContentfulSpace();
  } catch (e) {
    let slackMsg = `:x: *Contentful backup failed during export.*\n`;
    slackMsg += `*Error:* ${e.name || 'Error'}: ${e.message || e}`;
    if (e.stack) {
      slackMsg += `\n*Stack Trace:*\n\`${e.stack}\``;
    }
    if (e.message && e.message.toLowerCase().includes('rate limit')) {
      slackMsg += `\n:warning: *Rate limit detected.* Consider increasing retryDelay, reducing maxAllowedLimit, or running the export at a different time.`;
    }
    await postToSlack(slackMsg);
    throw e;
  }

  console.log("Initializing S3 client...");
  const s3Client = s3.createClient({
    s3Client: new AWS.S3({
      region: process.env.AWS_REGION,
      signatureVersion: "v4",
    }),
  });

  console.log("Uploading files to S3...");
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("Missing env variable AWS_S3_BUCKET_NAME: string");
  }

  // Use the extracted S3 upload module
  const prefix = `${new Date().toISOString()}/`;
  await uploadDirectoryToS3(exportDir, s3Client.s3Client, bucketName, prefix);
  console.log("Finished uploading files to S3.");

  console.log("Posting notification to Slack webhook...");
  await postToSlack(
    `A new Contentful backup was saved to <https://console.aws.amazon.com/s3/buckets/${process.env.AWS_S3_BUCKET_NAME}|S3>.`
  );
  console.log("Finished posting notification to Slack webhook.");
};

runBackup();
