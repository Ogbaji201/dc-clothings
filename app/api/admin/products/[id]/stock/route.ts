import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const supabase = await createClient();

    // Make sure the person making the request is authenticated.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    const stockQuantity = Number(
      body.stock_quantity
    );

    // Validate the stock value.
    if (
      !Number.isInteger(stockQuantity) ||
      stockQuantity < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Stock quantity must be a whole number greater than or equal to 0.",
        },
        {
          status: 400,
        }
      );
    }

    const adminSupabase = createAdminClient();

    // Get the product and its inventory mode.
    const { data: product, error: productError } =
      await adminSupabase
        .from("products")
        .select(
          "id, name, stock_quantity, inventory_mode"
        )
        .eq("id", id)
        .single();

    if (productError || !product) {
      return NextResponse.json(
        {
          error: "Product not found.",
        },
        {
          status: 404,
        }
      );
    }

    // Variant-managed products must have their stock
    // controlled through product variants.
    if (product.inventory_mode === "variant") {
      return NextResponse.json(
        {
          error:
            "This product uses Variant Stock. Update stock through the product variants instead.",
        },
        {
          status: 400,
        }
      );
    }

    // Product-managed stock can be updated directly.
    const { data: updatedProduct, error: updateError } =
      await adminSupabase
        .from("products")
        .update({
          stock_quantity: stockQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select(
          "id, name, stock_quantity, inventory_mode"
        )
        .single();

    if (updateError) {
      console.error(
        "Error updating stock:",
        updateError
      );

      return NextResponse.json(
        {
          error:
            "Unable to update product stock.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      product: updatedProduct,
    });
  } catch (error) {
    console.error(
      "Unexpected stock update error:",
      error
    );

    return NextResponse.json(
      {
        error: "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
}