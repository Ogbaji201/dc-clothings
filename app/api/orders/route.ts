import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type CartItem = {
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
};

type CustomerDetails = {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  address: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const cartItems: CartItem[] = body.cartItems;
    const customer: CustomerDetails = body.customer;

    // ==================================================
    // 1. BASIC VALIDATION
    // ==================================================

    if (
      !Array.isArray(cartItems) ||
      cartItems.length === 0
    ) {
      return NextResponse.json(
        {
          error: "Your cart is empty.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !customer ||
      !customer.fullName ||
      !customer.email ||
      !customer.phone ||
      !customer.country ||
      !customer.state ||
      !customer.city ||
      !customer.address
    ) {
      return NextResponse.json(
        {
          error:
            "Please provide all required customer details.",
        },
        {
          status: 400,
        }
      );
    }

    const supabase = createAdminClient();

    // ==================================================
    // 2. GET UNIQUE PRODUCT IDS
    // ==================================================

    const productIds = [
      ...new Set(
        cartItems.map(
          (item) => item.productId
        )
      ),
    ];

    // ==================================================
    // 3. GET PRODUCTS FROM DATABASE
    // ==================================================

    const {
      data: products,
      error: productsError,
    } = await supabase
      .from("products")
      .select(`
        id,
        name,
        slug,
        base_price,
        stock_quantity,
        inventory_mode,
        is_active,
        product_variants (
          id,
          size,
          color,
          price,
          stock_quantity,
          is_active
        )
      `)
      .in("id", productIds);

    if (productsError) {
      console.error(
        "Product lookup error:",
        productsError
      );

      return NextResponse.json(
        {
          error:
            "Unable to verify your products.",
        },
        {
          status: 500,
        }
      );
    }

    if (
      !products ||
      products.length !== productIds.length
    ) {
      return NextResponse.json(
        {
          error:
            "One or more products in your cart could not be found.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // 4. VERIFY CART ITEMS
    // ==================================================

    let subtotal = 0;

    const verifiedItems = [];

    for (const item of cartItems) {
      // -----------------------------------------------
      // Find product
      // -----------------------------------------------

      const product = products.find(
        (product) =>
          product.id === item.productId
      );

      if (!product) {
        return NextResponse.json(
          {
            error:
              `Product ${item.name} could not be found.`,
          },
          {
            status: 400,
          }
        );
      }

      // -----------------------------------------------
      // Product must still be active
      // -----------------------------------------------

      if (!product.is_active) {
        return NextResponse.json(
          {
            error:
              `${product.name} is no longer available.`,
          },
          {
            status: 400,
          }
        );
      }

      // -----------------------------------------------
      // Validate quantity
      // -----------------------------------------------

      if (
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return NextResponse.json(
          {
            error:
              `Invalid quantity for ${product.name}.`,
          },
          {
            status: 400,
          }
        );
      }

      // -----------------------------------------------
      // Find selected variant
      // -----------------------------------------------

      const variants =
        product.product_variants ?? [];

      const variant = variants.find(
        (variant) =>
          variant.id === item.variantId &&
          variant.size === item.size &&
          variant.color === item.color &&
          variant.is_active
      );

      if (!variant) {
        return NextResponse.json(
          {
            error:
              `The selected size or colour for ${product.name} is no longer available.`,
          },
          {
            status: 400,
          }
        );
      }

      // ==================================================
      // STOCK VALIDATION
      // ==================================================

      if (
        product.inventory_mode ===
        "variant"
      ) {
        // -----------------------------------------------
        // Variant-managed stock
        // -----------------------------------------------

        const variantStock = Number(
          variant.stock_quantity ?? 0
        );

        if (
          variantStock < item.quantity
        ) {
          return NextResponse.json(
            {
              error:
                `Sorry, ${product.name} (${item.color} / ${item.size}) does not have enough stock. Only ${variantStock} ${
                  variantStock === 1
                    ? "unit"
                    : "units"
                } available.`,
            },
            {
              status: 400,
            }
          );
        }
      } else {
        // -----------------------------------------------
        // Product-managed stock
        // -----------------------------------------------

        const productStock = Number(
          product.stock_quantity ?? 0
        );

        if (
          productStock < item.quantity
        ) {
          return NextResponse.json(
            {
              error:
                `Sorry, ${product.name} does not have enough stock. Only ${productStock} ${
                  productStock === 1
                    ? "unit"
                    : "units"
                } available.`,
            },
            {
              status: 400,
            }
          );
        }
      }

      // ==================================================
      // USE DATABASE PRICE
      // ==================================================

      const actualPrice = Number(
        variant.price ??
          product.base_price
      );

      const itemTotal =
        actualPrice * item.quantity;

      subtotal += itemTotal;

      verifiedItems.push({
        product_id: product.id,
        variant_id: variant.id,
        product_name: product.name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unit_price: actualPrice,
        total_price: itemTotal,
      });
    }

    // ==================================================
    // 5. DELIVERY FEE
    // ==================================================

    // Temporary static delivery fee.
    // This will be replaced with location-based
    // delivery calculation later.

    const deliveryFee = 5000;

    const totalAmount =
      subtotal + deliveryFee;

    // ==================================================
    // 6. FIND EXISTING CUSTOMER
    // ==================================================

    const {
      data: existingCustomer,
      error: customerLookupError,
    } = await supabase
      .from("customers")
      .select("id")
      .eq("email", customer.email)
      .maybeSingle();

    if (customerLookupError) {
      console.error(
        "Customer lookup error:",
        customerLookupError
      );

      return NextResponse.json(
        {
          error:
            "Unable to verify customer information.",
        },
        {
          status: 500,
        }
      );
    }

    let customerId =
      existingCustomer?.id ?? null;

    // ==================================================
    // 7. CREATE CUSTOMER IF NEW
    // ==================================================

    if (!customerId) {
      const {
        data: newCustomer,
        error: customerError,
      } = await supabase
        .from("customers")
        .insert({
          full_name:
            customer.fullName,
          email:
            customer.email,
          phone:
            customer.phone,
          address:
            customer.address,
        })
        .select("id")
        .single();

      if (customerError) {
        console.error(
          "Customer creation error:",
          customerError
        );

        return NextResponse.json(
          {
            error:
              "Unable to create customer record.",
          },
          {
            status: 500,
          }
        );
      }

      customerId =
        newCustomer.id;
    }

    // ==================================================
    // 8. GENERATE ORDER NUMBER
    // ==================================================

    const orderNumber =
      `DCC-${Date.now()}`;

    // ==================================================
    // 9. CREATE ORDER
    // ==================================================

    const {
      data: order,
      error: orderError,
    } = await supabase
      .from("orders")
      .insert({
        order_number:
          orderNumber,

        customer_id:
          customerId,

        customer_name:
          customer.fullName,

        customer_email:
          customer.email,

        customer_phone:
          customer.phone,

        delivery_address:
          customer.address,

        delivery_city:
          customer.city,

        delivery_state:
          customer.state,

        subtotal:
          subtotal,

        delivery_fee:
          deliveryFee,

        total_amount:
          totalAmount,

        order_status:
          "pending",

        payment_status:
          "pending",
      })
      .select(
        "id, order_number"
      )
      .single();

    if (orderError) {
      console.error(
        "Order creation error:",
        orderError
      );

      return NextResponse.json(
        {
          error:
            "Unable to create your order.",
        },
        {
          status: 500,
        }
      );
    }

    // ==================================================
    // 10. CREATE ORDER ITEMS
    // ==================================================

    const orderItems =
      verifiedItems.map(
        (item) => ({
          order_id:
            order.id,

          product_id:
            item.product_id,

          variant_id:
            item.variant_id,

          product_name:
            item.product_name,

          size:
            item.size,

          color:
            item.color,

          quantity:
            item.quantity,

          unit_price:
            item.unit_price,

          total_price:
            item.total_price,
        })
      );

    const {
      error: orderItemsError,
    } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (orderItemsError) {
      console.error(
        "Order items creation error:",
        orderItemsError
      );

      // Remove incomplete order
      await supabase
        .from("orders")
        .delete()
        .eq(
          "id",
          order.id
        );

      return NextResponse.json(
        {
          error:
            "Unable to create your order items.",
        },
        {
          status: 500,
        }
      );
    }

    // --------------------------------------------------
    // 11. INITIALIZE PAYSTACK PAYMENT
    // --------------------------------------------------

    const paymentReference =
      `${order.order_number}-PAY`;

    const callbackUrl =
      new URL(
        "/payment/callback",
        request.url
      ).toString();

    const paystackResponse =
      await fetch(
        "https://api.paystack.co/transaction/initialize",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,

            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email:
              customer.email,

            // Paystack expects NGN in kobo
            amount:
              String(
                Math.round(
                  Number(totalAmount) * 100
                )
              ),

            currency:
              "NGN",

            reference:
              paymentReference,

            callback_url:
              callbackUrl,

            metadata: {
              order_id:
                order.id,

              order_number:
                order.order_number,
            },
          }),
        }
      );

    const paystackData =
      await paystackResponse.json();

    if (
      !paystackResponse.ok ||
      !paystackData.status ||
      !paystackData.data?.authorization_url
    ) {
      console.error(
        "Paystack initialization error:",
        paystackData
      );

      // Remove incomplete order
      await supabase
        .from("orders")
        .delete()
        .eq("id", order.id);

      return NextResponse.json(
        {
          error:
            "Unable to initialize payment. Please try again.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 12. SAVE PAYMENT REFERENCE
    // --------------------------------------------------

    const {
      error: paymentReferenceError,
    } = await supabase
      .from("orders")
      .update({
        payment_reference:
          paystackData.data.reference,

        updated_at:
          new Date().toISOString(),
      })
      .eq("id", order.id);

    if (paymentReferenceError) {
      console.error(
        "Payment reference update error:",
        paymentReferenceError
      );

      return NextResponse.json(
        {
          error:
            "Unable to save payment information.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 13. RETURN PAYSTACK CHECKOUT URL
    // --------------------------------------------------

    return NextResponse.json({
      success: true,

      orderId:
        order.id,

      orderNumber:
        order.order_number,

      subtotal:
        subtotal,

      deliveryFee:
        deliveryFee,

      totalAmount:
        totalAmount,

      paymentReference:
        paystackData.data.reference,

      authorizationUrl:
        paystackData.data.authorization_url,
    });



  } catch (error) {
    console.error(
      "Unexpected order API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while creating your order.",
      },
      {
        status: 500,
      }
    );
  }
}