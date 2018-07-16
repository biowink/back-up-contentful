const fetch = require('isomorphic-fetch')

module.exports = () => {
  return fetch(
    process.env.SLACK_WEBHOOK_URL,
    {
      method: 'POST',
      body: JSON.stringify({
        text: `A new Contentful backup was saved to <https://console.aws.amazon.com/s3/buckets/${process.env.AWS_S3_BUCKET_NAME}|S3>.`,
      }),
    }
  )
}
