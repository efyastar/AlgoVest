export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { to, asset, ticker, price, change, threshold } = req.body

  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_PHONE_NUMBER

  const message = `AlgoVest Alert: ${asset} (${ticker}) dropped ${Math.abs(change).toFixed(1)}% in 24h and is now at ${price}. You set a ${threshold}% threshold. Open AlgoVest to review: https://algo-vest-b864.vercel.app`

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: fromNumber,
        To: to,
        Body: message,
      }).toString(),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    return res.status(400).json({ error: data })
  }

  return res.status(200).json({ success: true })
}