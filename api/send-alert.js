export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { to, asset, ticker, price, change, threshold } = req.body

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'AlgoVest <onboarding@resend.dev>',
      to: ['fosuafia08@gmail.com'],
      subject: `Alert: ${asset} dropped ${Math.abs(change).toFixed(1)}%`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0a0a0a; color: #f5f5f5; border-radius: 16px;">
          <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px; color: #f5f5f5;">
            AlgoVest Alert
          </h1>
          <p style="color: #6b7280; margin-bottom: 24px;">Market signal detected</p>

          <div style="background: #1a1a1a; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <p style="font-size: 18px; font-weight: 700; color: #f5f5f5;">${asset} (${ticker})</p>
                <p style="color: #f87171; font-size: 14px;">Dropped ${Math.abs(change).toFixed(1)}% in 24h</p>
              </div>
              <div style="text-align: right;">
                <p style="font-size: 20px; font-weight: 700; color: #f5f5f5; font-family: monospace;">${price}</p>
                <p style="color: #6b7280; font-size: 12px;">Current price</p>
              </div>
            </div>
          </div>

          <div style="background: #1a1a1a; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
            <p style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">YOUR THRESHOLD</p>
            <p style="color: #f5f5f5; font-size: 14px;">You set an alert for a <strong>${threshold}%</strong> drop — this has been triggered.</p>
          </div>

          <a href="https://algo-vest-b864.vercel.app" 
             style="display: block; background: #22c55e; color: #0a0a0a; text-align: center; padding: 14px; border-radius: 12px; font-weight: 700; text-decoration: none; margin-bottom: 20px;">
            Open AlgoVest to review
          </a>

          <p style="color: #4b5563; font-size: 12px; text-align: center;">
            Not financial advice. Always do your own research.<br/>
            AlgoVest · Unsubscribe
          </p>
        </div>
      `,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    return res.status(400).json({ error: data })
  }

  return res.status(200).json({ success: true })
}