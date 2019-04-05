const fetch = require('isomorphic-fetch')

module.exports = (text) => {
  return fetch(
    process.env.SLACK_WEBHOOK_URL,
    {
      method: 'POST',
      body: JSON.stringify({ text }),
    }
  )
}
