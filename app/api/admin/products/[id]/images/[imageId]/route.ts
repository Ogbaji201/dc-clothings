import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = {
  params: Promise<{
    id: string;
    imageId: string;
  }>;
};

function getStoragePath(imageUrl: string) {
  const marker =
    "/storage/v1/object/public/product-image/";

  const index = imageUrl.indexOf(marker);

  if (index === -1) {
    return null;
  }

  return decodeURIComponent(
    imageUrl.substring(index + marker.length)
  );
}

/* =========================================
   SET PRIMARY IMAGE
========================================= */

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  const { id, imageId } = await params;

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

    if (body.is_primary !== true) {
      return NextResponse.json(
        { error: "Invalid image update." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // -----------------------------------------
    // 1. CONFIRM IMAGE BELONGS TO PRODUCT
    // -----------------------------------------

    const {
      data: image,
      error: imageError,
    } = await admin
      .from("product_images")
      .select("id, product_id")
      .eq("id", imageId)
      .eq("product_id", id)
      .single();

    if (imageError || !image) {
      return NextResponse.json(
        { error: "Image not found." },
        { status: 404 }
      );
    }

    // -----------------------------------------
    // 2. REMOVE PRIMARY STATUS FROM ALL IMAGES
    // -----------------------------------------

    const {
      error: clearPrimaryError,
    } = await admin
      .from("product_images")
      .update({
        is_primary: false,
      })
      .eq("product_id", id);

    if (clearPrimaryError) {
      console.error(
        "Clear primary image error:",
        clearPrimaryError
      );

      return NextResponse.json(
        {
          error:
            "Unable to update the primary image.",
        },
        { status: 500 }
      );
    }

    // -----------------------------------------
    // 3. MAKE SELECTED IMAGE PRIMARY
    // -----------------------------------------

    const {
      data: updatedImage,
      error: updateError,
    } = await admin
      .from("product_images")
      .update({
        is_primary: true,
      })
      .eq("id", imageId)
      .eq("product_id", id)
      .select(`
        id,
        product_id,
        image_url,
        alt_text,
        display_order,
        is_primary
      `)
      .single();

    if (updateError || !updatedImage) {
      console.error(
        "Primary image update error:",
        updateError
      );

      return NextResponse.json(
        {
          error:
            "Unable to set the selected image as primary.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      image: updatedImage,
    });
  } catch (error) {
    console.error(
      "Primary image request error:",
      error
    );

    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}

/* =========================================
   DELETE PRODUCT IMAGE
========================================= */

export async function DELETE(
  request: Request,
  { params }: RouteContext
) {
  const { id, imageId } = await params;

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

    // -----------------------------------------
    // 1. FIND IMAGE
    // -----------------------------------------

    const {
      data: image,
      error: imageError,
    } = await admin
      .from("product_images")
      .select(`
        id,
        product_id,
        image_url,
        is_primary,
        display_order
      `)
      .eq("id", imageId)
      .eq("product_id", id)
      .single();

    if (imageError || !image) {
      return NextResponse.json(
        { error: "Image not found." },
        { status: 404 }
      );
    }

    // -----------------------------------------
    // 2. GET STORAGE PATH
    // -----------------------------------------

    const storagePath = getStoragePath(
      image.image_url
    );

    // -----------------------------------------
    // 3. DELETE FROM STORAGE
    // -----------------------------------------

    if (storagePath) {
      const {
        error: storageError,
      } = await admin.storage
        .from("product-image")
        .remove([storagePath]);

      if (storageError) {
        console.error(
          "Storage image deletion error:",
          storageError
        );

        return NextResponse.json(
          {
            error:
              "Unable to remove the image from storage.",
          },
          { status: 500 }
        );
      }
    }

    // -----------------------------------------
    // 4. DELETE DATABASE RECORD
    // -----------------------------------------

    const {
      error: deleteError,
    } = await admin
      .from("product_images")
      .delete()
      .eq("id", imageId)
      .eq("product_id", id);

    if (deleteError) {
      console.error(
        "Product image deletion error:",
        deleteError
      );

      return NextResponse.json(
        {
          error:
            "Unable to remove the image record.",
        },
        { status: 500 }
      );
    }

    // -----------------------------------------
    // 5. IF PRIMARY WAS DELETED,
    //    PROMOTE NEXT IMAGE
    // -----------------------------------------

    if (image.is_primary) {
      const {
        data: nextImage,
        error: nextImageError,
      } = await admin
        .from("product_images")
        .select("id")
        .eq("product_id", id)
        .order("display_order", {
          ascending: true,
        })
        .limit(1)
        .maybeSingle();

      if (nextImageError) {
        console.error(
          "Next primary image lookup error:",
          nextImageError
        );

        return NextResponse.json(
          {
            error:
              "Image was removed, but the next primary image could not be selected.",
          },
          { status: 500 }
        );
      }

      if (nextImage) {
        const {
          error: promoteError,
        } = await admin
          .from("product_images")
          .update({
            is_primary: true,
          })
          .eq("id", nextImage.id)
          .eq("product_id", id);

        if (promoteError) {
          console.error(
            "Primary image promotion error:",
            promoteError
          );

          return NextResponse.json(
            {
              error:
                "Image was removed, but the next primary image could not be selected.",
            },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Product image deletion request error:",
      error
    );

    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}