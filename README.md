# backUpContentful Node.js App

This repo contains Node.js app for backing up Contentful content and assets to S3. It is written in JavaScript, and deployed as a Kubernetes cronjob.

Much of the backup code in this function was based on (or uses) the [contentful-backup repo](https://github.com/iiroj/contentful-backup).

The app is configured to run every hour between 08:00-20:00 on weekdays (Monday-Friday). This ensures that backups are running during the times that Contentful data is most likely to be changed.

## Prerequisites

### Environment variables

Environment variables for the app are gotten from a k8s secret in the `web` namespace. To run the app locally, you'd need to create a `.env` file and pass it the following variables.

- `AWS_ACCESS_KEY_ID`: The access key ID for an AWS user. This is for authenticating with the S3 bucket.
- `CONTENTFUL_MANAGEMENT_TOKEN`: The Contentful management token, used for authenticating to the [Content Management API](https://www.contentful.com/developers/docs/references/content-management-api/). Unlike the Content Delivery API, this API allows full exports of Contentful data and assets.
- `CONTENTFUL_SPACE_IDS`: A comma-separated list of Contentful space IDs to back up.
- `EXPORT_DIR`: The directory to use for the Contentful export. Note that, since this is running in AWS Lambda, the directory must be located under `/tmp`. (Default: `/tmp/contentful-export`.)
- `SLACK_WEBHOOK_URL`: A URL for a Slack webhook, using the [Incoming WebHooks Slack app](https://clue.slack.com/apps/A0F7XDUAZ-incoming-webhooks). When you create a new webhook for Contentful backups, set this environment variable so that the lambda function will post its results to Slack.

## Usage

Deploy the app via the `yarn deploy:docker` command.
