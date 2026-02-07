import { createFileRoute } from '@tanstack/react-router'
import { getDB } from '~/utils/cloudflare'

interface ContactData {
  name: string
  email: string
  company: string
  message: string
}

export const Route = createFileRoute('/api/contact')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const data: ContactData = await request.json()

          // Validate
          if (!data.name || !data.email || !data.company || !data.message) {
            return Response.json(
              { error: 'Missing required fields' },
              { status: 400 }
            )
          }

          // Get D1 database
          const db = getDB()

          if (!db) {
            console.error('D1 database not available')
            console.log('Contact submission:', data)
            return Response.json({ success: true })
          }

          // Insert into database
          await db
            .prepare(
              `INSERT INTO contacts (name, email, company, message) 
               VALUES (?, ?, ?, ?)`
            )
            .bind(data.name, data.email, data.company, data.message)
            .run()

          return Response.json({ success: true })
        } catch (error) {
          console.error('Contact form error:', error)
          return Response.json(
            { error: 'Failed to process request' },
            { status: 500 }
          )
        }
      },
    },
  },
})
