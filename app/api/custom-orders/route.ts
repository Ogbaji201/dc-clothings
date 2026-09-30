import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const fullName = formData.get("fullName")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const phone = formData.get("phone")?.toString().trim();
    const garmentType = formData.get("garmentType")?.toString().trim();
    const preferredColour =
      formData.get("preferredColour")?.toString().trim() || null;
    const preferredSize =
      formData.get("preferredSize")?.toString().trim() || null;
    const quantityValue = formData.get("quantity")?.toString();
    const description = formData.get("description")?.toString().trim();

    const referenceImage = formData.get("referenceImage");

    // Validate required fields
    if (
      !fullName ||
      !email ||
      !phone ||
      !garmentType ||
      !quantityValue ||
      !description
    ) {
      return NextResponse.json(
        {
          error: "Please complete all required fields.",
        },
        { status: 400 }
      );
    }

    const quantity = Number(quantityValue);

    if (!Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json(
        {
          error: "Quantity must be a valid number greater than 0.",
        },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    let referenceImageUrl: string | null = null;

    /*
     * Upload reference image if one was provided.
     */
    if (
      referenceImage instanceof File &&
      referenceImage.size > 0
    ) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (!allowedTypes.includes(referenceImage.type)) {
        return NextResponse.json(
          {
            error:
              "Reference image must be JPG, PNG or WebP.",
          },
          { status: 400 }
        );
      }

      const maxFileSize = 10 * 1024 * 1024;

      if (referenceImage.size > maxFileSize) {
        return NextResponse.json(
          {
            error:
              "Reference image must be smaller than 10MB.",
          },
          { status: 400 }
        );
      }

      const fileExtension =
        referenceImage.name.split(".").pop()?.toLowerCase() ||
        "jpg";

      const safeFileName = `${crypto.randomUUID()}.${fileExtension}`;

      const filePath = `custom-orders/${safeFileName}`;

      const fileBuffer = Buffer.from(
        await referenceImage.arrayBuffer()
      );

      const { error: uploadError } = await supabase.storage
        .from("custom-order-images")
        .upload(filePath, fileBuffer, {
          contentType: referenceImage.type,
          upsert: false,
        });

      if (uploadError) {
        console.error(
          "Reference image upload error:",
          uploadError
        );

        return NextResponse.json(
          {
            error:
              "We could not upload the reference image.",
          },
          { status: 500 }
        );
      }

      referenceImageUrl = filePath;
    }

    /*
     * Save the custom order enquiry.
     */
    const { data, error } = await supabase
      .from("custom_order_requests")
      .insert({
        full_name: fullName,
        email,
        phone,
        garment_type: garmentType,
        preferred_colour: preferredColour,
        preferred_size: preferredSize,
        quantity,
        description,
        reference_image_url: referenceImageUrl,
        status: "new",
      })
      .select()
      .single();

    if (error) {
      console.error(
        "Custom order database error:",
        error
      );

      return NextResponse.json(
        {
          error:
            "We could not save your custom order enquiry.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Your custom order enquiry has been submitted successfully.",
        enquiry: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Custom order API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while submitting your enquiry.",
      },
      { status: 500 }
    );
  }
}