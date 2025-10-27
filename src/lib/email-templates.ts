import { OrderWithDetails } from '@/types'

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  htmlTemplate: string
  textTemplate: string
  isDefault: boolean
}

// Default email templates
export const defaultEmailTemplates: EmailTemplate[] = [
  {
    id: 'standard-order',
    name: 'Standard Order Template',
    subject: 'New Order Request - {{orderNumber}}',
    htmlTemplate: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order {{orderNumber}}</title>
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
          <p><strong>Order Number:</strong> {{orderNumber}}</p>
          <p><strong>Date:</strong> {{orderDate}}</p>
        </div>

        <div class="order-info">
          <h3>Store Information</h3>
          <p><strong>Store:</strong> {{storeName}}</p>
          <p><strong>Address:</strong> {{storeAddress}}</p>
          {{storePhone}}
          {{storeEmail}}
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
            {{orderItems}}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" style="text-align: right; font-weight: bold;">Total:</td>
              <td class="total">$\{\{orderTotal\}\}</td>
            </tr>
          </tfoot>
        </table>

        {{specialInstructions}}

        <div class="footer">
          <p>Please confirm receipt of this order and provide an estimated delivery date.</p>
          <p>If you have any questions, please contact us immediately.</p>
          <p>Thank you for your business!</p>
        </div>
      </body>
      </html>
    `,
    textTemplate: `
NEW ORDER REQUEST
================

Order Number: {{orderNumber}}
Date: {{orderDate}}

STORE INFORMATION
================
Store: {{storeName}}
Address: {{storeAddress}}
{{storePhone}}
{{storeEmail}}

ORDER ITEMS
===========
{{orderItemsText}}

TOTAL: $\{\{orderTotal\}\}

{{specialInstructionsText}}

Please confirm receipt of this order and provide an estimated delivery date.
If you have any questions, please contact us immediately.
Thank you for your business!
    `,
    isDefault: true
  },
  {
    id: 'urgent-order',
    name: 'Urgent Order Template',
    subject: 'URGENT: Order Request - {{orderNumber}}',
    htmlTemplate: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>URGENT Order {{orderNumber}}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .urgent-header { background-color: #dc3545; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .order-info { background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #ffc107; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .items-table th { background-color: #f8f9fa; font-weight: bold; }
          .total { font-size: 18px; font-weight: bold; color: #dc3545; }
        </style>
      </head>
      <body>
        <div class="urgent-header">
          <h1>🚨 URGENT ORDER REQUEST 🚨</h1>
          <p><strong>Order Number:</strong> {{orderNumber}}</p>
          <p><strong>Date:</strong> {{orderDate}}</p>
        </div>

        <div class="order-info">
          <h3>⚠️ URGENT DELIVERY NEEDED</h3>
          <p>This order requires immediate attention and expedited processing.</p>
        </div>

        <div class="order-info">
          <h3>Store Information</h3>
          <p><strong>Store:</strong> {{storeName}}</p>
          <p><strong>Address:</strong> {{storeAddress}}</p>
          {{storePhone}}
          {{storeEmail}}
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
            {{orderItems}}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" style="text-align: right; font-weight: bold;">Total:</td>
              <td class="total">$\{\{orderTotal\}\}</td>
            </tr>
          </tfoot>
        </table>

        {{specialInstructions}}

        <div class="order-info">
          <h3>⚠️ URGENT PROCESSING REQUIRED</h3>
          <p>Please process this order immediately and provide expedited delivery options.</p>
          <p>Contact us immediately if there are any issues with fulfilling this order.</p>
        </div>
      </body>
      </html>
    `,
    textTemplate: `
🚨 URGENT ORDER REQUEST 🚨
==========================

Order Number: {{orderNumber}}
Date: {{orderDate}}

⚠️ URGENT DELIVERY NEEDED
This order requires immediate attention and expedited processing.

STORE INFORMATION
================
Store: {{storeName}}
Address: {{storeAddress}}
{{storePhone}}
{{storeEmail}}

ORDER ITEMS
===========
{{orderItemsText}}

TOTAL: $\{\{orderTotal\}\}

{{specialInstructionsText}}

⚠️ URGENT PROCESSING REQUIRED
Please process this order immediately and provide expedited delivery options.
Contact us immediately if there are any issues with fulfilling this order.
    `,
    isDefault: true
  }
]

// Template variable replacement
export function processEmailTemplate(template: string, order: OrderWithDetails): string {
  const { funeralHome, supplier, orderItems, orderNumber, total, notes } = order
  
  const variables = {
    '{{orderNumber}}': orderNumber,
    '{{orderDate}}': new Date().toLocaleDateString(),
    '{{storeName}}': funeralHome.name,
    '{{storeAddress}}': `${funeralHome.address}, ${funeralHome.city}, ${funeralHome.state} ${funeralHome.zipCode}`,
    '{{storePhone}}': funeralHome.phone ? `<p><strong>Phone:</strong> ${funeralHome.phone}</p>` : '',
    '{{storeEmail}}': funeralHome.email ? `<p><strong>Email:</strong> ${funeralHome.email}</p>` : '',
    '{{orderTotal}}': total.toFixed(2),
    '{{orderItems}}': orderItems.map(item => `
      <tr>
        <td>${item.product.name}</td>
        <td>${item.product.sku}</td>
        <td>${item.quantity}</td>
        <td>$${item.unitPrice.toFixed(2)}</td>
        <td>$${item.total.toFixed(2)}</td>
      </tr>
    `).join(''),
    '{{orderItemsText}}': orderItems.map(item => 
      `${item.product.name} (${item.product.sku})\n  Quantity: ${item.quantity}\n  Unit Price: $${item.unitPrice.toFixed(2)}\n  Total: $${item.total.toFixed(2)}\n\n`
    ).join(''),
    '{{specialInstructions}}': notes ? `
      <div class="order-info">
        <h3>Special Instructions</h3>
        <p>${notes}</p>
      </div>
    ` : '',
    '{{specialInstructionsText}}': notes ? `
SPECIAL INSTRUCTIONS
===================
${notes}

` : ''
  }

  let processedTemplate = template
  Object.entries(variables).forEach(([key, value]) => {
    processedTemplate = processedTemplate.replace(new RegExp(key, 'g'), value)
  })

  return processedTemplate
}
