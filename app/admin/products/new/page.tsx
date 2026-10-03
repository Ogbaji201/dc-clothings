import { createAdminClient } from "@/lib/supabase/admin";
import NewProductForm from "../../components/NewProductForm";

export default async function NewProductPage() {
  const supabase = createAdminClient();

  const {
    data: categories,
    error,
  } = await supabase
    .from("categories")
    .select("id, name")
    .order("name", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Error loading product categories:",
      error
    );
  }

  return (
    <NewProductForm
      categories={categories ?? []}
    />
  );
}