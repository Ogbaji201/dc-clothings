import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
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
    const admin = createAdminClient();

    const { data: product, error: productError } =
      await admin
        .from("products")
        .select("id, name")
        .eq("id", id)
        .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    const formData = await request.formData();

    const file = formData.get("image");
    const altText = formData.get("alt_text");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please provide an image." },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Only JPG, PNG and WebP images are supported.",
        },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        {
          error: "Image must not exceed 10MB.",
        },
        { status: 400 }
      );
    }

    const extensionMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };

    const extension = extensionMap[file.type];

    const filePath =
      `products/${id}/${crypto.randomUUID()}.${extension}`;

    const fileBuffer = Buffer.from(
      await file.arrayBuffer()
    );

    const { error: uploadError } = await admin.storage
      .from("product-image")
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error(
        "Product image upload error:",
        uploadError
      );

      return NextResponse.json(
        {
          error: "Unable to upload image to storage.",
        },
        { status: 500 }
      );
    }

    const {
      data: publicUrlData,
    } = admin.storage
      .from("product-image")
      .getPublicUrl(filePath);

    const {
      data: existingImages,
      error: imagesError,
    } = await admin
      .from("product_images")
      .select("id, display_order, is_primary")
      .eq("product_id", id)
      .order("display_order", {
        ascending: true,
      });

    if (imagesError) {
      console.error(
        "Existing product images lookup error:",
        imagesError
      );

      await admin.storage
        .from("product-image")
        .remove([filePath]);

      return NextResponse.json(
        {
          error:
            "Unable to prepare the product image.",
        },
        { status: 500 }
      );
    }

    const imageList = existingImages ?? [];

    const displayOrder =
      imageList.length === 0
        ? 0
        : Math.max(
            ...imageList.map(
              (image) => image.display_order ?? 0
            )
          ) + 1;

    const isPrimary = imageList.length === 0;

    if (isPrimary) {
      await admin
        .from("product_images")
        .update({ is_primary: false })
        .eq("product_id", id);
    }

    if (isPrimary) {
      await admin
        .from("product_images")
        .update({ is_primary: false })
        .eq("product_id", id);
    }

    const { data: image, error: insertError } =
      await admin
        .from("product_images")
        .insert({
          product_id: id,
          image_url: publicUrlData.publicUrl,
          alt_text:
            typeof altText === "string"
              ? altText.trim() || null
              : null,
          display_order: displayOrder,
          is_primary: isPrimary,
        })
        .select(`
          id,
          product_id,
          image_url,
          alt_text,
          display_order,
          is_primary,
          created_at
        `)
        .single();

    if (insertError) {
      console.error(
        "Product image database error:",
        insertError
      );

      await admin.storage
        .from("product-image")
        .remove([filePath]);

      return NextResponse.json(
        {
          error:
            "Image uploaded but could not be saved to the product.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      image,
    });
  } catch (error) {
    console.error(
      "Product image upload request error:",
      error
    );

    return NextResponse.json(
      { error: "Invalid upload request." },
      { status: 400 }
    );
  }
}