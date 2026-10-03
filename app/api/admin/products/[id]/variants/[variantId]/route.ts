import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = {
  params: Promise<{
    id: string;
    variantId: string;
  }>;
};

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  const { id, variantId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const {
      size,
      color,
      price,
      stock_quantity,
      is_active,
    } = body;

    // ---------------------------------------------
    // Validate input
    // ---------------------------------------------

    if (
      typeof size !== "string" ||
      !size.trim()
    ) {
      return NextResponse.json(
        { error: "Size is required." },
        { status: 400 }
      );
    }

    if (
      typeof color !== "string" ||
      !color.trim()
    ) {
      return NextResponse.json(
        { error: "Colour is required." },
        { status: 400 }
      );
    }

    if (
      typeof price !== "number" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      return NextResponse.json(
        { error: "Invalid variant price." },
        { status: 400 }
      );
    }

    if (
      stock_quantity !== null &&
      (!Number.isInteger(stock_quantity) ||
        stock_quantity < 0)
    ) {
      return NextResponse.json(
        { error: "Invalid stock quantity." },
        { status: 400 }
      );
    }

    if (typeof is_active !== "boolean") {
      return NextResponse.json(
        { error: "Invalid active status." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // ---------------------------------------------
    // Get the product inventory mode
    // ---------------------------------------------

    const { data: product, error: productError } =
      await admin
        .from("products")
        .select("id, inventory_mode")
        .eq("id", id)
        .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    // ---------------------------------------------
    // Make sure the variant belongs to this product
    // ---------------------------------------------

    const {
      data: existingVariant,
      error: lookupError,
    } = await admin
      .from("product_variants")
      .select("id")
      .eq("id", variantId)
      .eq("product_id", id)
      .single();

    if (lookupError || !existingVariant) {
      return NextResponse.json(
        { error: "Variant not found." },
        { status: 404 }
      );
    }

    // ---------------------------------------------
    // Update the variant
    // ---------------------------------------------

    const {
      data: updatedVariant,
      error,
    } = await admin
      .from("product_variants")
      .update({
        size: size.trim(),
        color: color.trim(),
        price,
        stock_quantity,
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", variantId)
      .eq("product_id", id)
      .select(`
        id,
        product_id,
        size,
        color,
        price,
        stock_quantity,
        is_active,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      console.error(
        "Error updating variant:",
        error
      );

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // ---------------------------------------------
    // Recalculate product stock when using
    // Variant Stock mode
    // ---------------------------------------------

    if (product.inventory_mode === "variant") {
      const {
        data: activeVariants,
        error: stockLookupError,
      } = await admin
        .from("product_variants")
        .select("stock_quantity")
        .eq("product_id", id)
        .eq("is_active", true);

      if (stockLookupError) {
        console.error(
          "Error calculating variant stock:",
          stockLookupError
        );

        return NextResponse.json(
          {
            error:
              "Variant updated, but product stock could not be recalculated.",
          },
          { status: 500 }
        );
      }

      const totalStock = (activeVariants ?? []).reduce(
        (total, variant) =>
          total + (variant.stock_quantity ?? 0),
        0
      );

      const { error: productStockError } =
        await admin
          .from("products")
          .update({
            stock_quantity: totalStock,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

      if (productStockError) {
        console.error(
          "Error updating product stock:",
          productStockError
        );

        return NextResponse.json(
          {
            error:
              "Variant updated, but product stock could not be updated.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        variant: updatedVariant,
        product_stock: totalStock,
      });
    }

    // ---------------------------------------------
    // Product Stock mode
    // ---------------------------------------------
    // Do not touch products.stock_quantity.
    // It remains controlled directly from the
    // Product Stock field.

    return NextResponse.json({
      success: true,
      variant: updatedVariant,
    });
  } catch (error) {
    console.error(
      "Variant update request error:",
      error
    );

    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}