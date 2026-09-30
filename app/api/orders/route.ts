import { NextResponse } from "next/server";
// import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type CartItem = {
  productId: string;
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

    // --------------------------------------------------
    // 1. BASIC VALIDATION
    // --------------------------------------------------

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        {
          error: "Your cart is empty.",
        },
        { status: 400 }
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
          error: "Please provide all required customer details.",
        },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // --------------------------------------------------
    // 2. GET PRODUCT IDS
    // --------------------------------------------------

    const productIds = [
      ...new Set(
        cartItems.map((item) => item.productId)
      ),
    ];

    // --------------------------------------------------
    // 3. GET PRODUCTS FROM DATABASE
    // --------------------------------------------------

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
        is_active,
        product_variants (
          id,
          size,
          color,
          price,
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
          error: "Unable to verify your products.",
        },
        { status: 500 }
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
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 4. VERIFY CART ITEMS
    // --------------------------------------------------

    let subtotal = 0;

    const verifiedItems = [];

    for (const item of cartItems) {
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
          { status: 400 }
        );
      }

      // Product must still be active
      if (!product.is_active) {
        return NextResponse.json(
          {
            error:
              `${product.name} is no longer available.`,
          },
          { status: 400 }
        );
      }

      // Validate quantity
      if (
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return NextResponse.json(
          {
            error:
              `Invalid quantity for ${product.name}.`,
          },
          { status: 400 }
        );
      }

      // Check total product stock
      if (
        Number(product.stock_quantity) <
        item.quantity
      ) {
        return NextResponse.json(
          {
            error:
              `Sorry, ${product.name} does not have enough stock.`,
          },
          { status: 400 }
        );
      }

      // Find selected size + colour
      const variants =
        product.product_variants || [];

      const variant = variants.find(
        (variant) =>
          variant.size === item.size &&
          variant.color === item.color &&
          variant.is_active
      );

      if (!variant) {
        return NextResponse.json(
          {
            error:
              `The selected size or colour for ${product.name} is not available.`,
          },
          { status: 400 }
        );
      }

      // Use the DATABASE price
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

    // --------------------------------------------------
    // 5. DELIVERY FEE
    // --------------------------------------------------

    // Temporary delivery fee.
    // We will build the actual delivery calculation later.

    const deliveryFee = 0;

    const totalAmount =
      subtotal + deliveryFee;

    // --------------------------------------------------
    // 6. FIND EXISTING CUSTOMER
    // --------------------------------------------------

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
        { status: 500 }
      );
    }

    let customerId =
      existingCustomer?.id ?? null;

    // --------------------------------------------------
    // 7. CREATE CUSTOMER IF NEW
    // --------------------------------------------------

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
          { status: 500 }
        );
      }

      customerId =
        newCustomer.id;
    }

    // --------------------------------------------------
    // 8. GENERATE ORDER NUMBER
    // --------------------------------------------------

    const orderNumber =
      `DCC-${Date.now()}`;

    // --------------------------------------------------
    // 9. CREATE ORDER
    // --------------------------------------------------

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
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 10. CREATE ORDER ITEMS
    // --------------------------------------------------

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
        .eq("id", order.id);

      return NextResponse.json(
        {
          error:
            "Unable to create your order items.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 11. RETURN SUCCESS
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
      { status: 500 }
    );
  }
}