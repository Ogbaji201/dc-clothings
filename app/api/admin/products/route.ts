import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    // --------------------------------------------------
    // 1. Verify that the user is authenticated
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
    // 2. Read the submitted form data
    // --------------------------------------------------
    const body = await request.json();

    const {
      name,
      slug,
      description,
      category_id,
      base_price,
      stock_quantity,
      is_active,
      is_featured,
    } = body;

    // --------------------------------------------------
    // 3. Validate required fields
    // --------------------------------------------------
    if (!name || !slug || !category_id) {
      return NextResponse.json(
        {
          error: "Product name, slug and category are required.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // 4. Validate price
    // --------------------------------------------------
    const price = Number(base_price);

    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        {
          error: "Please enter a valid product price.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // 5. Validate stock
    // --------------------------------------------------
    const stock = Number(stock_quantity);

    if (!Number.isInteger(stock) || stock < 0) {
      return NextResponse.json(
        {
          error: "Stock quantity must be a whole number of 0 or more.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // 6. Create admin Supabase client
    // --------------------------------------------------
    const adminSupabase = createAdminClient();

    // --------------------------------------------------
    // 7. Check whether the slug already exists
    // --------------------------------------------------
    const { data: existingProduct, error: slugCheckError } =
      await adminSupabase
        .from("products")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

    if (slugCheckError) {
      console.error("Slug check error:", slugCheckError);

      return NextResponse.json(
        {
          error: "Unable to validate the product slug.",
        },
        {
          status: 500,
        }
      );
    }

    if (existingProduct) {
      return NextResponse.json(
        {
          error:
            "A product with this slug already exists. Please use a different slug.",
        },
        {
          status: 409,
        }
      );
    }

    // --------------------------------------------------
    // 8. Confirm that the category exists
    // --------------------------------------------------
    const { data: category, error: categoryError } =
      await adminSupabase
        .from("categories")
        .select("id")
        .eq("id", category_id)
        .maybeSingle();

    if (categoryError) {
      console.error("Category lookup error:", categoryError);

      return NextResponse.json(
        {
          error: "Unable to validate the selected category.",
        },
        {
          status: 500,
        }
      );
    }

    if (!category) {
      return NextResponse.json(
        {
          error: "The selected category does not exist.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // 9. Insert the new product
    // --------------------------------------------------
    const { data: product, error: insertError } =
      await adminSupabase
        .from("products")
        .insert({
          name: String(name).trim(),
          slug: String(slug).trim(),
          description:
            description && String(description).trim()
              ? String(description).trim()
              : null,
          category_id,
          base_price: price,
          stock_quantity: stock,
          is_active: Boolean(is_active),
          is_featured: Boolean(is_featured),
        })
        .select(
          `
          id,
          name,
          slug,
          description,
          category_id,
          base_price,
          stock_quantity,
          is_active,
          is_featured
        `
        )
        .single();

    if (insertError) {
      console.error("Product creation error:", insertError);

      return NextResponse.json(
        {
          error: "Unable to create the product.",
        },
        {
          status: 500,
        }
      );
    }

    // --------------------------------------------------
    // 10. Return the newly created product
    // --------------------------------------------------
    return NextResponse.json(
      {
        message: "Product created successfully.",
        product,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Unexpected product creation error:", error);

    return NextResponse.json(
      {
        error: "An unexpected error occurred while creating the product.",
      },
      {
        status: 500,
      }
    );
  }
}   