import { Resend } from "resend";

const resend = new Resend(

  process.env.RESEND_API_KEY

);

type OrderItem = {

  product_name: string;

  size: string;

  color: string;

  quantity: number;

  unit_price: number;

  total_price: number;

};

type OrderConfirmationData = {

  orderNumber: string;

  customerName: string;

  customerEmail: string;

  subtotal: number;

  deliveryFee: number;

  totalAmount: number;

  items: OrderItem[];

  idempotencyKey: string;

};

function escapeHtml(value: string | number | null | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatNaira(amount: number) {

  return `₦${Number(amount).toLocaleString("en-NG")}`;

}

export async function sendOrderConfirmationEmail(

  order: OrderConfirmationData

) {

  if (!process.env.RESEND_API_KEY) {

    throw new Error(

      "RESEND_API_KEY is not configured."

    );

  }

  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!fromEmail) {
    throw new Error(
      "RESEND_FROM_EMAIL is not configured. Use an address on a domain verified in Resend."
    );
  }

  const itemsHtml = order.items

    .map(

      (item) => `

        <tr>

          <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">

            <strong>${escapeHtml(item.product_name)}</strong>

            <br />

            <span style="color: #777777; font-size: 13px;">

              ${escapeHtml(item.color)} / ${escapeHtml(item.size)}

            </span>

          </td>

          <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; text-align: center;">

            ${escapeHtml(item.quantity)}

          </td>

          <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; text-align: right;">

            ${formatNaira(item.total_price)}

          </td>

        </tr>

      `

    )

    .join("");

  const { data, error } =

    await resend.emails.send({

      from: fromEmail,

      to: [order.customerEmail],

      subject:

        `Order Confirmed — ${order.orderNumber}`,

      html: `

        <!DOCTYPE html>

        <html>

          <head>

            <meta charset="UTF-8" />

            <meta

              name="viewport"

              content="width=device-width, initial-scale=1.0"

            />

          </head>

          <body

            style="

              margin: 0;

              padding: 0;

              background: #f7f6f3;

              font-family: Arial, Helvetica, sans-serif;

              color: #171717;

            "

          >

            <div

              style="

                max-width: 640px;

                margin: 0 auto;

                padding: 40px 20px;

              "

            >

              <div

                style="

                  background: #ffffff;

                  padding: 40px;

                  border: 1px solid #e5e5e5;

                "

              >

                <div

                  style="

                    text-align: center;

                    margin-bottom: 36px;

                  "

                >

                  <h1

                    style="

                      margin: 0;

                      font-size: 28px;

                      letter-spacing: 1px;

                    "

                  >

                    DC CLOTHINGS

                  </h1>

                  <p

                    style="

                      margin: 8px 0 0;

                      color: #777777;

                      font-size: 12px;

                      letter-spacing: 2px;

                    "

                  >

                    NIGERIAN MADE. DESIGNED TO LAST.

                  </p>

                </div>

                <p

                  style="

                    margin: 0 0 8px;

                    font-size: 12px;

                    color: #777777;

                    letter-spacing: 1px;

                  "

                >

                  ORDER CONFIRMED

                </p>

                <h2

                  style="

                    margin: 0 0 20px;

                    font-size: 30px;

                    font-weight: 500;

                  "

                >

                  Thank you, ${escapeHtml(order.customerName)}.

                </h2>

                <p

                  style="

                    color: #555555;

                    line-height: 1.7;

                    font-size: 15px;

                  "

                >

                  We've received your payment and your

                  order has been confirmed.

                </p>

                <div

                  style="

                    margin: 28px 0;

                    padding: 18px;

                    background: #f7f6f3;

                  "

                >

                  <p

                    style="

                      margin: 0;

                      color: #777777;

                      font-size: 12px;

                    "

                  >

                    ORDER NUMBER

                  </p>

                  <p

                    style="

                      margin: 6px 0 0;

                      font-size: 18px;

                      font-weight: 600;

                    "

                  >

                    ${escapeHtml(order.orderNumber)}

                  </p>

                </div>

                <h3

                  style="

                    margin: 32px 0 14px;

                    font-size: 16px;

                  "

                >

                  Order Summary

                </h3>

                <table

                  width="100%"

                  cellpadding="0"

                  cellspacing="0"

                  style="

                    border-collapse: collapse;

                    font-size: 14px;

                  "

                >

                  <thead>

                    <tr>

                      <th

                        style="

                          padding: 10px 0;

                          text-align: left;

                          color: #777777;

                          font-size: 12px;

                          font-weight: normal;

                        "

                      >

                        ITEM

                      </th>

                      <th

                        style="

                          padding: 10px 0;

                          text-align: center;

                          color: #777777;

                          font-size: 12px;

                          font-weight: normal;

                        "

                      >

                        QTY

                      </th>

                      <th

                        style="

                          padding: 10px 0;

                          text-align: right;

                          color: #777777;

                          font-size: 12px;

                          font-weight: normal;

                        "

                      >

                        TOTAL

                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    ${itemsHtml}

                  </tbody>

                </table>

                <div

                  style="

                    margin-top: 28px;

                    border-top: 1px solid #dddddd;

                    padding-top: 20px;

                  "

                >

                  <div

                    style="

                      display: flex;

                      justify-content: space-between;

                      margin-bottom: 10px;

                    "

                  >

                    <span>Subtotal</span>

                    <strong>

                      ${formatNaira(order.subtotal)}

                    </strong>

                  </div>

                  <div

                    style="

                      display: flex;

                      justify-content: space-between;

                      margin-bottom: 14px;

                    "

                  >

                    <span>Delivery</span>

                    <strong>

                      ${formatNaira(order.deliveryFee)}

                    </strong>

                  </div>

                  <div

                    style="

                      border-top: 1px solid #dddddd;

                      padding-top: 14px;

                      display: flex;

                      justify-content: space-between;

                      font-size: 17px;

                    "

                  >

                    <strong>Total</strong>

                    <strong>

                      ${formatNaira(order.totalAmount)}

                    </strong>

                  </div>

                </div>

                <div

                  style="

                    margin-top: 40px;

                    padding-top: 25px;

                    border-top: 1px solid #eeeeee;

                  "

                >

                  <p

                    style="

                      margin: 0;

                      color: #555555;

                      line-height: 1.7;

                      font-size: 14px;

                    "

                  >

                    We'll keep you updated as your order

                    moves through fulfilment and delivery.

                  </p>

                </div>

              </div>

              <p

                style="

                  text-align: center;

                  color: #999999;

                  font-size: 12px;

                  line-height: 1.6;

                  margin-top: 24px;

                "

              >

                DCClothings<br />

                Nigerian Made. Designed to Last.

              </p>

            </div>

          </body>

          </html>

    `,

        },

        {

        idempotencyKey: order.idempotencyKey,

        },

    );

  if (error) {

    console.error(

      "Resend order confirmation error:",

      error

    );

    throw error;

  }

  return data;

}