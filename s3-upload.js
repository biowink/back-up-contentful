"use strict";

const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");

/**
 * Recursively uploads all files in a directory to S3.
 * @param {string} dir - The directory to upload.
 * @param {AWS.S3} s3Client - The AWS S3 client instance.
 * @param {string} bucket - The S3 bucket name.
 * @param {string} [prefix] - Optional prefix for S3 keys.
 */
async function uploadDirectoryToS3(dir, s3Client, bucket, prefix = "") {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      await uploadDirectoryToS3(filePath, s3Client, bucket, path.join(prefix, file));
    } else {
      const fileStream = fs.createReadStream(filePath);
      const s3Key = path.join(prefix, file);
      await s3Client
        .upload({
          Bucket: bucket,
          Key: s3Key,
          Body: fileStream,
        })
        .promise();
      console.log(`Uploaded ${filePath} to S3 as ${s3Key}`);
    }
  }
}

module.exports = { uploadDirectoryToS3 };
