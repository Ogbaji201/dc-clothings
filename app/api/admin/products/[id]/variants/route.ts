import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type VariantInput = {
  color: string;
  size: string;
};

export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    // --------------------------------------------------
    // 1. Verify authentication
    // --------------------------------------------------

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // --------------------------------------------------
    // 2. Get product ID
    // --------------------------------------------------

    const { id: productId } = await params;

    if (!productId) {
      return NextResponse.json(
        {
          error: "Product ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // 3. Read request body
    // --------------------------------------------------

    const body = await request.json();

    const variants = body.variants as VariantInput[];

    if (!Array.isArray(variants) || variants.length === 0) {
      return NextResponse.json(
        {
          error: "At least one variant is required.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // 4. Validate each variant
    // --------------------------------------------------

    for (const variant of variants) {
      if (
        !variant ||
        typeof variant.color !== "string" ||
        typeof variant.size !== "string" ||
        !variant.color.trim() ||
        !variant.size.trim()
      ) {
        return NextResponse.json(
          {
            error:
              "Each variant must have a valid colour and size.",
          },
          {
            status: 400,
          }
        );
      }
    }

    // --------------------------------------------------
    // 5. Create admin Supabase client
    // --------------------------------------------------

    const admin = createAdminClient();

    // --------------------------------------------------
    // 6. Confirm product exists
    // --------------------------------------------------

    const { data: product, error: productError } =
      await admin
        .from("products")
        .select("id, base_price")
        .eq("id", productId)
        .maybeSingle();

    if (productError) {
      console.error(
        "Product lookup error:",
        productError
      );

      return NextResponse.json(
        {
          error: "Unable to find the product.",
        },
        {
          status: 500,
        }
      );
    }

    if (!product) {
      return NextResponse.json(
        {
          error: "Product not found.",
        },
        {
          status: 404,
        }
      );
    }

    // --------------------------------------------------
    // 7. Normalise submitted combinations
    // --------------------------------------------------

    const requestedVariants = variants.map(
      (variant) => ({
        color: variant.color.trim(),
        size: variant.size.trim(),
      })
    );

    // Remove duplicates inside the request itself
    const uniqueRequestedVariants =
      Array.from(
        new Map(
          requestedVariants.map((variant) => [
            `${variant.color.toLowerCase()}::${variant.size.toLowerCase()}`,
            variant,
          ])
        ).values()
      );

    // --------------------------------------------------
    // 8. Get existing variants for this product
    // --------------------------------------------------

    const { data: existingVariants, error: existingError } =
      await admin
        .from("product_variants")
        .select("color, size")
        .eq("product_id", productId);

    if (existingError) {
      console.error(
        "Existing variants lookup error:",
        existingError
      );

      return NextResponse.json(
        {
          error:
            "Unable to check the product's existing variants.",
        },
        {
          status: 500,
        }
      );
    }

    // --------------------------------------------------
    // 9. Build existing variant lookup
    // --------------------------------------------------

    const existingKeys = new Set(
      (existingVariants ?? []).map(
        (variant) =>
          `${variant.color.toLowerCase()}::${variant.size.toLowerCase()}`
      )
    );

    // --------------------------------------------------
    // 10. Only keep genuinely new combinations
    // --------------------------------------------------

    const newVariants =
      uniqueRequestedVariants.filter(
        (variant) =>
          !existingKeys.has(
            `${variant.color.toLowerCase()}::${variant.size.toLowerCase()}`
          )
      );

    if (newVariants.length === 0) {
      return NextResponse.json(
        {
          error:
            "All selected variants already exist for this product.",
        },
        {
          status: 409,
        }
      );
    }

    // --------------------------------------------------
    // 11. Prepare database records
    // --------------------------------------------------

    const records = newVariants.map(
      (variant) => ({
        product_id: productId,
        size: variant.size,
        color: variant.color,
        price: Number(product.base_price),
        stock_quantity: 0,
        is_active: true,
      })
    );

    // --------------------------------------------------
    // 12. Insert variants
    // --------------------------------------------------

    const {
      data: createdVariants,
      error: insertError,
    } = await admin
      .from("product_variants")
      .insert(records)
      .select(
        `
        id,
        product_id,
        size,
        color,
        price,
        stock_quantity,
        is_active
        `
      );

    if (insertError) {
      console.error(
        "Variant creation error:",
        insertError
      );

      return NextResponse.json(
        {
          error:
            "Unable to create the product variants.",
        },
        {
          status: 500,
        }
      );
    }

    // --------------------------------------------------
    // 13. Return result
    // --------------------------------------------------

    return NextResponse.json(
      {
        success: true,
        message: `${createdVariants.length} variant${
          createdVariants.length === 1 ? "" : "s"
        } created successfully.`,
        variants: createdVariants,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Variant creation request error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "An unexpected error occurred while creating variants.",
      },
      {
        status: 500,
      }
    );
  }
}