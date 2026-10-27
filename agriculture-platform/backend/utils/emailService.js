import dotenv from 'dotenv';
dotenv.config();

/**
 * Sends Order Confirmation email to buyer via EmailJS REST API
 * @param {Object} params
 * @param {Object} params.buyer - Buyer User document (name, email, phone)
 * @param {Object} params.order - Order document
 * @param {Object} params.farmer - Farmer User document (name, phone)
 */
export async function sendOrderConfirmedEmail({ buyer, order, farmer }) {
  const serviceId = process.env.EMAILJS_SERVICE_ID || 'service_tv19xmt';
  const templateId = process.env.EMAILJS_TEMPLATE_ID || 'template_zsj3qqw';
  const publicKey = process.env.EMAILJS_PUBLIC_KEY || 'i-VNI8CT5Q83Z-oOg';
  const privateKey = process.env.EMAILJS_PRIVATE_KEY || 'U6y1swFyZn97Q-sXjuQIj';

  if (!buyer || !buyer.email) {
    console.warn('[EmailJS] Cannot send email: Buyer email is missing.');
    return false;
  }

  // Format products list
  const itemsList = (order.products || []).map((item) => {
    const qty = item.quantity || 1;
    const price = item.price || 0;
    return `${item.productName || 'Produce'} × ${qty} (₹${price}/unit) = ₹${qty * price}`;
  });
  const itemsSummary = itemsList.join('\n');

  const firstProduct = order.products?.[0];
  const formattedOrderId = String(order._id || '').slice(-6).toUpperCase();
  const formattedDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  let clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  if (!clientUrl.startsWith('http://') && !clientUrl.startsWith('https://')) {
    clientUrl = `https://${clientUrl}`;
  }

  const templateParams = {
    // Recipient email aliases (ensures whatever variable is in the EmailJS "To Email" field receives buyer's email)
    to_email: buyer.email,
    toEmail: buyer.email,
    email: buyer.email,
    buyer_email: buyer.email,
    buyerEmail: buyer.email,
    user_email: buyer.email,
    userEmail: buyer.email,
    recipient_email: buyer.email,
    recipientEmail: buyer.email,
    reply_to: farmer?.email || buyer.email,

    // Recipient name aliases
    to_name: buyer.name || 'Valued Customer',
    toName: buyer.name || 'Valued Customer',
    buyer_name: buyer.name || 'Valued Customer',
    buyerName: buyer.name || 'Valued Customer',
    customer_name: buyer.name || 'Valued Customer',
    customerName: buyer.name || 'Valued Customer',

    // Order and produce details
    order_id: formattedOrderId,
    orderId: formattedOrderId,
    order_date: formattedDate,
    orderDate: formattedDate,
    farmer_name: farmer?.name || 'Local Farmer',
    farmerName: farmer?.name || 'Local Farmer',
    farmer_phone: farmer?.phone || 'Available in dashboard',
    farmerPhone: farmer?.phone || 'Available in dashboard',
    product_name: firstProduct ? `${firstProduct.productName} (x${firstProduct.quantity})` : 'Farm Fresh Harvest',
    productName: firstProduct ? `${firstProduct.productName} (x${firstProduct.quantity})` : 'Farm Fresh Harvest',
    items_summary: itemsSummary,
    total_amount: order.totalAmount || 0,
    totalAmount: order.totalAmount || 0,
    dashboard_url: `${clientUrl}/buyer/orders`,
    dashboardUrl: `${clientUrl}/buyer/orders`
  };

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': clientUrl,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        accessToken: privateKey,
        template_params: templateParams
      })
    });

    if (response.ok) {
      console.log(`[EmailJS] ✅ Order confirmation email sent to buyer (${buyer.email}) for Order #${formattedOrderId}`);
      return true;
    } else {
      const errText = await response.text();
      console.warn(`[EmailJS] ⚠️ Could not send email (HTTP ${response.status}):`, errText);
      return false;
    }
  } catch (err) {
    console.error('[EmailJS] ❌ Network error while calling EmailJS API:', err.message);
    return false;
  }
}

export default {
  sendOrderConfirmedEmail
};
