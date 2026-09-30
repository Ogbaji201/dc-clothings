import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      fullName,
      email,
      phone,
      address,
      subject,
      message,
    } = body;

    // Validate required fields
    if (!fullName || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Please complete all required fields." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("contact_messages")
      .insert({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        subject: subject.trim(),
        message: message.trim(),
        status: "new",
      })
      .select()
      .single();

    if (error) {
      console.error("Contact message database error:", error);

      return NextResponse.json(
        { error: "We could not save your message." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Your message has been sent successfully.",
        enquiry: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact API error:", error);

    return NextResponse.json(
      { error: "Something went wrong while sending your message." },
      { status: 500 }
    );
  }
}