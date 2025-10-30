import nodemailer from 'nodemailer'
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'
import { OrderWithDetails, FuneralHome, Supplier } from '@/types'

// Create email transporter (SMTP) or use Resend when available
const createTransporter = (override?: {
  host?: string
  port?: number
  secure?: boolean
  user?: string
  password?: string
}) => {
  const host = override?.host ?? process.env.EMAIL_SERVER_HOST ?? 'smtp.gmail.com'
  const port = override?.port ?? parseInt(process.env.EMAIL_SERVER_PORT || '587')
  const secure = override?.secure ?? false
  const user = override?.user ?? process.env.EMAIL_SERVER_USER
  const password = override?.password ?? process.env.EMAIL_SERVER_PASSWORD
  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass: password },
  })
}

async function getOrgEmailOverrides(organizationId?: string) {
  if (!organizationId) return undefined
  try {
  // TODO: Replace any-cast once Prisma Client is regenerated to include EmailSettings
  const settings = await (prisma as any).emailSettings.findUnique({ where: { organizationId } })
    if (!settings) return undefined
    return {
      host: settings.host,
      port: settings.port,
      secure: settings.secure,
      user: settings.user,
      password: settings.password,
      fromAddress: settings.fromAddress,
    }
  } catch {
    return undefined
  }
}

const hasResend = !!process.env.RESEND_API_KEY
const resendClient = hasResend ? new Resend(process.env.RESEND_API_KEY) : undefined

// --- Template helpers ---
type TemplateType = 'STANDARD' | 'URGENT' | 'CUSTOM'

async function getActiveTemplate(organizationId?: string, type: TemplateType = 'STANDARD', templateId?: string) {
  try {
    if (!organizationId) return null
    if (templateId) {
      const t = await (prisma as any).emailTemplate.findUnique({ where: { id: templateId } })
      if (t && t.organizationId === organizationId) return t
      return null
    }
    // For STANDARD / URGENT, unique per org by schema
    const t = await (prisma as any).emailTemplate.findUnique({
      where: { organizationId_type: { organizationId, type } },
    })
    if (t && t.isActive) return t
    return null
  } catch {
    return null
  }
}

function renderItemsTableHTML(order: any) {
  const rows = (order.orderItems || []).map((item: any) => `
    <tr>
      <td>${item.product?.name ?? ''}</td>
      <td>${item.product?.sku ?? ''}</td>
      <td>${item.quantity}</td>
      <td>$${Number(item.unitPrice ?? 0).toFixed(2)}</td>
      <td>$${Number(item.total ?? 0).toFixed(2)}</td>
    </tr>
  `).join('')
  return `
    <table style="width:100%;border-collapse:collapse;margin:16px 0;font-family:Arial,sans-serif;font-size:14px;">
      <thead>
        <tr>
          <th style="border:1px solid #ddd;padding:8px;text-align:left;">Product</th>
          <th style="border:1px solid #ddd;padding:8px;text-align:left;">SKU</th>
          <th style="border:1px solid #ddd;padding:8px;text-align:left;">Qty</th>
          <th style="border:1px solid #ddd;padding:8px;text-align:left;">Unit Price</th>
          <th style="border:1px solid #ddd;padding:8px;text-align:left;">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `
}

function renderItemsText(order: any) {
  const lines = (order.orderItems || []).map((item: any) => {
    return `- ${item.product?.name ?? ''} (${item.product?.sku ?? ''}) x${item.quantity} @ $${Number(item.unitPrice ?? 0).toFixed(2)} = $${Number(item.total ?? 0).toFixed(2)}`
  })
  return lines.join('\n')
}

function renderTemplateString(tpl: string, order: any) {
  const map: Record<string, string> = {
    orderNumber: order?.orderNumber ?? '',
    funeralHome: order?.funeralHome?.name ?? '',
    supplier: order?.supplier?.name ?? '',
    total: String((order?.total ?? 0).toFixed ? order.total.toFixed(2) : order?.total ?? ''),
    date: new Date().toLocaleDateString(),
    itemsTable: renderItemsTableHTML(order),
    itemsText: renderItemsText(order),
    notes: order?.notes ?? '',
  }
  let out = String(tpl ?? '')
  for (const [key, val] of Object.entries(map)) {
    const re = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    out = out.replace(re, val)
  }
  return out
}

// Email template for order
export function generateOrderEmailHTML(order: any): string {
  const { funeralHome, supplier, orderItems, orderNumber, total, notes } = order
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order ${orderNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .order-info { background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .items-table th { background-color: #f8f9fa; font-weight: bold; }
        .total { font-size: 18px; font-weight: bold; color: #007bff; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>New Order Request</h1>
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>

      <div class="order-info">
        <h3>Funeral Home Information</h3>
        <p><strong>Funeral Home:</strong> ${funeralHome.name}</p>
        <p><strong>Address:</strong> ${funeralHome.address}, ${funeralHome.city}, ${funeralHome.state} ${funeralHome.zipCode}</p>
        ${funeralHome.phone ? `<p><strong>Phone:</strong> ${funeralHome.phone}</p>` : ''}
        ${funeralHome.email ? `<p><strong>Email:</strong> ${funeralHome.email}</p>` : ''}
      </div>

      <h3>Order Items</h3>
      <table class="items-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>SKU</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${orderItems.map((item: any) => `
            <tr>
              <td>${item.product.name}</td>
              <td>${item.product.sku}</td>
              <td>${item.quantity}</td>
              <td>$${item.unitPrice.toFixed(2)}</td>
              <td>$${item.total.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" style="text-align: right; font-weight: bold;">Total:</td>
            <td class="total">$${total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      ${notes ? `
        <div class="order-info">
          <h3>Special Instructions</h3>
          <p>${notes}</p>
        </div>
      ` : ''}

      <div class="footer">
        <p>Please confirm receipt of this order and provide an estimated delivery date.</p>
        <p>If you have any questions, please contact us immediately.</p>
        <p>Thank you for your business!</p>
      </div>
    </body>
    </html>
  `
}

// Plain text version for email clients that don't support HTML
export function generateOrderEmailText(order: any): string {
  const { funeralHome, supplier, orderItems, orderNumber, total, notes } = order
  
  let text = `NEW ORDER REQUEST\n`
  text += `================\n\n`
  text += `Order Number: ${orderNumber}\n`
  text += `Date: ${new Date().toLocaleDateString()}\n\n`
  
  text += `FUNERAL HOME INFORMATION\n`
  text += `=======================\n`
  text += `Funeral Home: ${funeralHome.name}\n`
  text += `Address: ${funeralHome.address}, ${funeralHome.city}, ${funeralHome.state} ${funeralHome.zipCode}\n`
  if (funeralHome.phone) text += `Phone: ${funeralHome.phone}\n`
  if (funeralHome.email) text += `Email: ${funeralHome.email}\n`
  text += `\n`
  
  text += `ORDER ITEMS\n`
  text += `===========\n`
  orderItems.forEach((item: any) => {
    text += `${item.product.name} (${item.product.sku})\n`
    text += `  Quantity: ${item.quantity}\n`
    text += `  Unit Price: $${item.unitPrice.toFixed(2)}\n`
    text += `  Total: $${item.total.toFixed(2)}\n\n`
  })
  
  text += `TOTAL: $${total.toFixed(2)}\n\n`
  
  if (notes) {
    text += `SPECIAL INSTRUCTIONS\n`
    text += `===================\n`
    text += `${notes}\n\n`
  }
  
  text += `Please confirm receipt of this order and provide an estimated delivery date.\n`
  text += `If you have any questions, please contact us immediately.\n`
  text += `Thank you for your business!\n`
  
  return text
}

// Send order email
export async function sendOrderEmail(order: any, options?: { type?: TemplateType; templateId?: string }): Promise<boolean> {
  try {
    const orgOverrides = await getOrgEmailOverrides(order?.funeralHome?.organizationId)
    const from = orgOverrides?.fromAddress || process.env.EMAIL_FROM || 'noreply@businessmanager.com'
    const to = order.supplier.email
    const type = options?.type ?? 'STANDARD'

    // Try to use active template if available
    const tpl = await getActiveTemplate(order?.funeralHome?.organizationId, type, options?.templateId)
    const subject = tpl ? renderTemplateString(tpl.subject, order) : `New Order Request - ${order.orderNumber}`
    const html = tpl ? renderTemplateString(tpl.htmlContent, order) : generateOrderEmailHTML(order)
    const text = tpl ? (tpl.textContent ? renderTemplateString(tpl.textContent, order) : undefined) : generateOrderEmailText(order)

    if (resendClient) {
      const { data, error } = await resendClient.emails.send({ from, to, subject, html, text })
      if (error) throw error
      console.log('Order email sent successfully (Resend):', data?.id)
    } else {
      const transporter = createTransporter(orgOverrides)
      const result = await transporter.sendMail({ from, to, subject, text, html })
      console.log('Order email sent successfully (SMTP):', result.messageId)
    }
    return true
  } catch (error) {
    console.error('Error sending order email:', error)
    return false
  }
}

// Send order confirmation email to funeral home
export async function sendOrderConfirmationEmail(order: any): Promise<boolean> {
  try {
    const orgOverrides = await getOrgEmailOverrides(order?.funeralHome?.organizationId)
    const from = orgOverrides?.fromAddress || process.env.EMAIL_FROM || 'noreply@businessmanager.com'
    const to = order.funeralHome.email || 'orders@businessmanager.com'
    const subject = `Order Sent - ${order.orderNumber}`
    const html = `
      <h2>Order Sent Successfully</h2>
      <p>Your order <strong>${order.orderNumber}</strong> has been sent to <strong>${order.supplier.name}</strong>.</p>
      <p>You will receive a confirmation when the supplier acknowledges the order.</p>
      <p>Order Total: <strong>$${order.total.toFixed(2)}</strong></p>
    `

    if (resendClient) {
      const { data, error } = await resendClient.emails.send({ from, to, subject, html })
      if (error) throw error
      console.log('Confirmation email sent successfully (Resend):', data?.id)
    } else {
      const transporter = createTransporter(orgOverrides)
      const result = await transporter.sendMail({ from, to, subject, html })
      console.log('Confirmation email sent successfully (SMTP):', result.messageId)
    }
    return true
  } catch (error) {
    console.error('Error sending confirmation email:', error)
    return false
  }
}

// Send a simple test email to verify configuration
export async function sendTestEmail(to: string, organizationId?: string): Promise<{ ok: boolean; id?: string; error?: string }> {
  try {
    const orgOverrides = await getOrgEmailOverrides(organizationId)
    const from = orgOverrides?.fromAddress || process.env.EMAIL_FROM || 'noreply@businessmanager.com'
    const subject = 'Test Email from Business Management App'
    const html = `
      <h2>Test Email</h2>
      <p>If you received this, your email configuration is working ✅</p>
    `
    const text = 'Test Email - your configuration is working.'

    if (resendClient) {
      const { data, error } = await resendClient.emails.send({ from, to, subject, html, text })
      if (error) throw error
      return { ok: true, id: data?.id }
    } else {
      const transporter = createTransporter(orgOverrides)
      const result = await transporter.sendMail({ from, to, subject, text, html })
      return { ok: true, id: result.messageId }
    }
  } catch (error: any) {
    console.error('Error sending test email:', error)
    return { ok: false, error: error?.message || 'Unknown error' }
  }
}

// Send password reset email
export async function sendPasswordResetEmail(to: string, resetLink: string, organizationId?: string): Promise<boolean> {
  try {
    const orgOverrides = await getOrgEmailOverrides(organizationId)
    const from = orgOverrides?.fromAddress || process.env.EMAIL_FROM || 'noreply@businessmanager.com'
    const subject = 'Reset your password'
    const html = `
      <h2>Password Reset Request</h2>
      <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
      <p>To reset your password, click the link below:</p>
      <p><a href="${resetLink}" target="_blank" rel="noreferrer noopener" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;">Reset Password</a></p>
      <p>Or copy and paste this URL into your browser:</p>
      <p><a href="${resetLink}" target="_blank" rel="noreferrer noopener">${resetLink}</a></p>
      <p style="color:#6b7280;font-size:12px;margin-top:16px;">This link will expire in 1 hour.</p>
    `
    const text = `Reset your password:\n${resetLink}\n\nIf you didn't request this, ignore this email. Link expires in 1 hour.`

    if (resendClient) {
      const { error } = await resendClient.emails.send({ from, to, subject, html, text })
      if (error) throw error
    } else {
      const transporter = createTransporter(orgOverrides)
      await transporter.sendMail({ from, to, subject, text, html })
    }
    return true
  } catch (error) {
    console.error('Error sending password reset email:', error)
    return false
  }
}
