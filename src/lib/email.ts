import nodemailer from 'nodemailer'
import { OrderWithDetails, FuneralHome, Supplier } from '@/types'

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  })
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
export async function sendOrderEmail(order: any): Promise<boolean> {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@businessmanager.com',
      to: order.supplier.email,
      subject: `New Order Request - ${order.orderNumber}`,
      text: generateOrderEmailText(order),
      html: generateOrderEmailHTML(order),
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Order email sent successfully:', result.messageId)
    return true
  } catch (error) {
    console.error('Error sending order email:', error)
    return false
  }
}

// Send order confirmation email to funeral home
export async function sendOrderConfirmationEmail(order: any): Promise<boolean> {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@businessmanager.com',
      to: order.funeralHome.email || 'orders@businessmanager.com',
      subject: `Order Sent - ${order.orderNumber}`,
      html: `
        <h2>Order Sent Successfully</h2>
        <p>Your order <strong>${order.orderNumber}</strong> has been sent to <strong>${order.supplier.name}</strong>.</p>
        <p>You will receive a confirmation when the supplier acknowledges the order.</p>
        <p>Order Total: <strong>$${order.total.toFixed(2)}</strong></p>
      `,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Confirmation email sent successfully:', result.messageId)
    return true
  } catch (error) {
    console.error('Error sending confirmation email:', error)
    return false
  }
}
