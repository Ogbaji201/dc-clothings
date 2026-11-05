
"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type DashboardRange =
  | "today"
  | "7days"
  | "30days"
  | "90days"
  | "year";

export type DashboardData = {
  period: {
    revenue: number;
    orders: number;
    paidOrders: number;
    pendingOrders: number;
    averageOrderValue: number;
    previousRevenue: number;
    previousOrders: number;
    revenueChange: number;
    orderChange: number;
  };
  orderStatuses: { name: string; value: number }[];
  revenueTrend: { date: string; revenue: number }[];
  topProducts: {
    name: string;
    quantity: number;
    revenue: number;
  }[];
  inventory: {
    variants: number;
    stock: number;
    lowStock: number;
    outOfStock: number;
  };
  customers: {
    total: number;
    newCustomers: number;
    returningCustomers: number;
  };
  enquiries: {
    contact: number;
    bulk: number;
    custom: number;
  };
  fulfilment: {
    delivery: number;
    pickup: number;
  };
  recentOrders: {
    id: string;
    orderNumber: string;
    customerName: string;
    total: number;
    paymentStatus: string;
    orderStatus: string;
    createdAt: string;
  }[];
};

function getPeriod(range: DashboardRange) {
  const end = new Date();
  const start = new Date(end);

  switch (range) {
    case "today":
      start.setHours(0, 0, 0, 0);
      break;

    case "7days":
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      break;

    case "30days":
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      break;

    case "90days":
      start.setDate(start.getDate() - 89);
      start.setHours(0, 0, 0, 0);
      break;

    case "year":
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      break;
  }

  const duration = end.getTime() - start.getTime();
  const previousStart = new Date(start.getTime() - duration);
  const previousEnd = new Date(start);

  return {
    start,
    end,
    previousStart,
    previousEnd,
  };
}

function percentageChange(
  current: number,
  previous: number
) {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return Number(
    (((current - previous) / previous) * 100).toFixed(1)
  );
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatDateLabel(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(
    "en-GB",
    {
      day: "numeric",
      month: "short",
    }
  );
}

export async function getAdminDashboardData(
  range: DashboardRange = "30days"
): Promise<DashboardData> {
  // Verify the authenticated administrator.
  const authClient = await createClient();

  const {
    data: { user },
  } = await authClient.auth.getUser();

  const adminEmail = process.env.ADMIN_EMAIL
    ?.trim()
    .toLowerCase();

  if (
    !user?.email ||
    !adminEmail ||
    user.email.trim().toLowerCase() !== adminEmail
  ) {
    throw new Error("Unauthorised dashboard access.");
  }

  // Service-role client is used only on the server.
  const supabase = createAdminClient();

  const {
    start,
    end,
    previousStart,
    previousEnd,
  } = getPeriod(range);

  const startISO = start.toISOString();
  const endISO = end.toISOString();
  const previousStartISO = previousStart.toISOString();
  const previousEndISO = previousEnd.toISOString();

  // Current period orders.
  const { data: currentOrders, error: currentError } =
    await supabase
      .from("orders")
      .select(
        "id, order_number, customer_id, customer_name, customer_email, total_amount, payment_status, order_status, fulfillment_method, created_at"
      )
      .gte("created_at", startISO)
      .lte("created_at", endISO)
      .order("created_at", { ascending: false });

  if (currentError) {
    throw new Error(
      `Could not load orders: ${currentError.message}`
    );
  }

  // Previous period orders for comparison.
  const { data: previousOrders, error: previousError } =
    await supabase
      .from("orders")
      .select("id, total_amount, payment_status")
      .gte("created_at", previousStartISO)
      .lt("created_at", previousEndISO);

  if (previousError) {
    throw new Error(
      `Could not load previous orders: ${previousError.message}`
    );
  }

  const orders = currentOrders ?? [];
  const oldOrders = previousOrders ?? [];

  const paidOrders = orders.filter(
    (order) => order.payment_status === "paid"
  );

  const pendingOrders = orders.filter(
    (order) => order.payment_status === "pending"
  );

  const revenue = paidOrders.reduce(
    (sum, order) => sum + Number(order.total_amount || 0),
    0
  );

  const previousRevenue = oldOrders
    .filter((order) => order.payment_status === "paid")
    .reduce(
      (sum, order) => sum + Number(order.total_amount || 0),
      0
    );

  const previousPaidOrders = oldOrders.filter(
    (order) => order.payment_status === "paid"
  );

  // Order status breakdown.
  const statusMap = new Map<string, number>();

  orders.forEach((order) => {
    const status = order.order_status || "unknown";

    statusMap.set(
      status,
      (statusMap.get(status) || 0) + 1
    );
  });

  const orderStatuses = Array.from(
    statusMap.entries()
  ).map(([name, value]) => ({
    name: name.replace(/_/g, " "),
    value,
  }));

  // Daily revenue trend.
  const trendMap = new Map<string, number>();

  const currentDate = new Date(start);

  while (currentDate <= end) {
    trendMap.set(formatDateKey(currentDate), 0);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  paidOrders.forEach((order) => {
    const date = formatDateKey(
      new Date(order.created_at)
    );

    trendMap.set(
      date,
      (trendMap.get(date) || 0) +
        Number(order.total_amount || 0)
    );
  });

  const revenueTrend = Array.from(
    trendMap.entries()
  ).map(([date, amount]) => ({
    date: formatDateLabel(date),
    revenue: amount,
  }));

  // Product performance from paid orders only.
  const paidOrderIds = paidOrders.map(
    (order) => order.id
  );

  let topProducts: DashboardData["topProducts"] = [];

  if (paidOrderIds.length > 0) {
    const { data: items, error: itemsError } =
      await supabase
        .from("order_items")
        .select(
          "product_id, product_name, quantity, total_price"
        )
        .in("order_id", paidOrderIds);

    if (itemsError) {
      throw new Error(
        `Could not load product sales: ${itemsError.message}`
      );
    }

    const productMap = new Map<
      string,
      {
        name: string;
        quantity: number;
        revenue: number;
      }
    >();

    (items ?? []).forEach((item) => {
      const key = item.product_id || item.product_name;

      const existing = productMap.get(key) || {
        name: item.product_name,
        quantity: 0,
        revenue: 0,
      };

      existing.quantity += Number(item.quantity || 0);
      existing.revenue += Number(item.total_price || 0);

      productMap.set(key, existing);
    });

    topProducts = Array.from(productMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }

  // Inventory.
  const { data: variants, error: inventoryError } =
    await supabase
      .from("product_variants")
      .select("stock_quantity")
      .eq("is_active", true);

  if (inventoryError) {
    throw new Error(
      `Could not load inventory: ${inventoryError.message}`
    );
  }

  const activeVariants = variants ?? [];

  const inventory = {
    variants: activeVariants.length,
    stock: activeVariants.reduce(
      (sum, item) =>
        sum + Number(item.stock_quantity || 0),
      0
    ),
    lowStock: activeVariants.filter(
      (item) =>
        Number(item.stock_quantity) > 0 &&
        Number(item.stock_quantity) <= 5
    ).length,
    outOfStock: activeVariants.filter(
      (item) => Number(item.stock_quantity) === 0
    ).length,
  };

  // Customer metrics.
  const { count: totalCustomers, error: customerError } =
    await supabase
      .from("customers")
      .select("id", {
        count: "exact",
        head: true,
      });

  if (customerError) {
    throw new Error(
      `Could not load customers: ${customerError.message}`
    );
  }

  const { count: newCustomers, error: newCustomerError } =
    await supabase
      .from("customers")
      .select("id", {
        count: "exact",
        head: true,
      })
      .gte("created_at", startISO)
      .lte("created_at", endISO);

  if (newCustomerError) {
    throw new Error(
      `Could not load new customers: ${newCustomerError.message}`
    );
  }

  const customerOrderCounts = new Map<string, number>();

  paidOrders.forEach((order) => {
    const key = order.customer_id || order.customer_email;

    if (key) {
      customerOrderCounts.set(
        key,
        (customerOrderCounts.get(key) || 0) + 1
      );
    }
  });

  const returningCustomers = Array.from(
    customerOrderCounts.values()
  ).filter((count) => count > 1).length;

  // Enquiry counts.
  const [
    contactResult,
    bulkResult,
    customResult,
  ] = await Promise.all([
    supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("bulk_order_requests")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("custom_order_requests")
      .select("id", { count: "exact", head: true }),
  ]);

  if (contactResult.error) {
    throw new Error(
      `Could not load contact enquiries: ${contactResult.error.message}`
    );
  }

  if (bulkResult.error) {
    throw new Error(
      `Could not load bulk enquiries: ${bulkResult.error.message}`
    );
  }

  if (customResult.error) {
    throw new Error(
      `Could not load custom enquiries: ${customResult.error.message}`
    );
  }

  // Fulfilment breakdown.
  const fulfilment = {
    delivery: orders.filter(
      (order) => order.fulfillment_method === "delivery"
    ).length,
    pickup: orders.filter(
      (order) => order.fulfillment_method === "pickup"
    ).length,
  };

  // Recent orders.
  const recentOrders = orders.slice(0, 8).map((order) => ({
    id: order.id,
    orderNumber: order.order_number,
    customerName: order.customer_name,
    total: Number(order.total_amount || 0),
    paymentStatus: order.payment_status,
    orderStatus: order.order_status,
    createdAt: order.created_at,
  }));

  return {
    period: {
      revenue,
      orders: orders.length,
      paidOrders: paidOrders.length,
      pendingOrders: pendingOrders.length,
      averageOrderValue:
        paidOrders.length > 0
          ? revenue / paidOrders.length
          : 0,
      previousRevenue,
      previousOrders: previousPaidOrders.length,
      revenueChange: percentageChange(
        revenue,
        previousRevenue
      ),
      orderChange: percentageChange(
        paidOrders.length,
        previousPaidOrders.length
      ),
    },
    orderStatuses,
    revenueTrend,
    topProducts,
    inventory,
    customers: {
      total: totalCustomers ?? 0,
      newCustomers: newCustomers ?? 0,
      returningCustomers,
    },
    enquiries: {
      contact: contactResult.count ?? 0,
      bulk: bulkResult.count ?? 0,
      custom: customResult.count ?? 0,
    },
    fulfilment,
    recentOrders,
  };
}
