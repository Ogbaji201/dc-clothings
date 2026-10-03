import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const allowedFields = [
  "name",
  "slug",
  "description",
  "category_id",
  "base_price",
  "stock_quantity",
  "inventory_mode",
  "is_active",
  "is_featured",
];

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  const { id } = await params;

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

    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    if (
      "name" in updateData &&
      (typeof updateData.name !== "string" ||
        !updateData.name.trim())
    ) {
      return NextResponse.json(
        { error: "Product name is required." },
        { status: 400 }
      );
    }

    if (
      "slug" in updateData &&
      (typeof updateData.slug !== "string" ||
        !updateData.slug.trim())
    ) {
      return NextResponse.json(
        { error: "Product slug is required." },
        { status: 400 }
      );
    }

    if (
      "base_price" in updateData &&
      (typeof updateData.base_price !== "number" ||
        !Number.isFinite(updateData.base_price) ||
        updateData.base_price < 0)
    ) {
      return NextResponse.json(
        { error: "Invalid product price." },
        { status: 400 }
      );
    }

    if (
      "stock_quantity" in updateData &&
      (!Number.isInteger(updateData.stock_quantity) ||
        Number(updateData.stock_quantity) < 0)
    ) {
      return NextResponse.json(
        { error: "Invalid stock quantity." },
        { status: 400 }
      );
    }

    if (
      "is_active" in updateData &&
      typeof updateData.is_active !== "boolean"
    ) {
      return NextResponse.json(
        { error: "Invalid active status." },
        { status: 400 }
      );
    }

    if (
      "is_featured" in updateData &&
      typeof updateData.is_featured !== "boolean"
    ) {
      return NextResponse.json(
        { error: "Invalid featured status." },
        { status: 400 }
      );
    }

    if (
      "category_id" in updateData &&
      updateData.category_id !== null &&
      typeof updateData.category_id !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid category." },
        { status: 400 }
      );
    }

    if (
      "inventory_mode" in updateData &&
      updateData.inventory_mode !== "product" &&
      updateData.inventory_mode !== "variant" 
    ) {
      return NextResponse.json(
        { error: "Invalid inventory mode." },
        { status: 400 }
      );
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No changes supplied." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { data: updatedProduct, error } = await admin
      .from("products")
      .update(updateData)
      .eq("id", id)
      .select(`
        id,
        category_id,
        name,
        slug,
        description,
        base_price,
        stock_quantity,
        is_active,
        is_featured
      `)
      .single();

    if (error) {
      console.error(
        "Error updating product:",
        error
      );

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      product: updatedProduct,
    });
  } catch (error) {
    console.error(
      "Product update request error:",
      error
    );

    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}