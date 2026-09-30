import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      contactPerson,
      organisationName,
      email,
      phone,
      country,
      city,
      organisationType,
      garmentNeeded,
      estimatedQuantity,
      deliveryDeadline,
      brandingRequired,
      notes,
    } = body;

    // Validate required fields
    if (
      !contactPerson ||
      !organisationName ||
      !email ||
      !phone ||
      !country ||
      !city ||
      !organisationType ||
      !garmentNeeded ||
      !estimatedQuantity
    ) {
      return NextResponse.json(
        {
          error:
            "Please complete all required fields.",
        },
        { status: 400 }
      );
    }

    // Validate quantity
    const quantity = Number(estimatedQuantity);

    if (!Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json(
        {
          error:
            "Estimated quantity must be a valid number greater than 0.",
        },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Insert bulk order enquiry
    const { data, error } = await supabase
      .from("bulk_order_requests")
      .insert({
        contact_person: contactPerson.trim(),
        organisation_name: organisationName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        country: country.trim(),
        city: city.trim(),
        organisation_type: organisationType.trim(),
        garment_needed: garmentNeeded.trim(),
        estimated_quantity: quantity,
        delivery_deadline:
          deliveryDeadline || null,
        branding_required:
          brandingRequired === true,
        notes: notes?.trim() || null,
        status: "new",
      })
      .select()
      .single();

    if (error) {
      console.error(
        "Bulk order database error:",
        error
      );

      return NextResponse.json(
        {
          error:
            "We could not save your bulk order enquiry.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Your bulk order enquiry has been submitted successfully.",
        enquiry: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Bulk order API error:",
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