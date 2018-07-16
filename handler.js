'use strict';

const AWS = require('aws-sdk')
const contentfulExport = require('contentful-export')
const mkdir = require('make-dir')
const path = require('path')
const s3 = require('s3')

const postToSlack = require('./post-to-slack')
const uploadToS3 = require('./contentful-backup/lib/upload-to-s3')

// Get Contentful Management Token from env
const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
if (!managementToken) {
  throw new Error('Missing env variable CONTENTFUL_MANAGEMENT_TOKEN: string')
}

// Get array of Contentful Space IDs to backup
var spaceIds = process.env.CONTENTFUL_SPACE_IDS
if (!spaceIds) {
  throw new Error('Missing env variable CONTENTFUL_SPACE_IDS: string[]')
}
spaceIds = spaceIds.split(',')

const createExportDir = async () => {
  const exportDir = path.resolve((process.env.EXPORT_DIR || '/tmp/contentful-export') + '/' + new Date().toISOString())

  try {
    await mkdir(exportDir)
    return exportDir
  } catch (error) {
    throw new Error(error)
  }
}

module.exports.runBackup = async (event, context, callback) => {
  console.log('Creating export directory...')
  const exportDir = await createExportDir()
  console.log(`Created export directory ${exportDir}.`)

  for (const spaceId of spaceIds) {
    console.log(`Exporting space ${spaceId}...`)
    await contentfulExport({
      spaceId,
      managementToken,
      exportDir,
      includeDrafts: true,
      downloadAssets: true,
    })
    console.log(`Exported space ${spaceId}`)
  }

  console.log('Initializing S3 client...')
  const s3Client = s3.createClient({
    s3Client: new AWS.S3({
      region: process.env.AWS_REGION,
      signatureVersion: 'v4'
    }),
  })

  console.log('Uploading files to S3...')
  await uploadToS3(s3Client)
  console.log('Finished uploading files to S3.')

  console.log('Posting notification to Slack webhook...')
  await postToSlack()
  console.log('Finished posting notification to Slack webhook.')
}
