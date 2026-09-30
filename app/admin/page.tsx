import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <main className="admin-page">

      <div className="admin-container">

        <div className="admin-header">

          <div>
            <p className="admin-eyebrow">
              DC CLOTHINGS / ADMIN
            </p>

            <h1>
              Dashboard
            </h1>

            <p>
              Welcome back, {user.email}
            </p>
          </div>

        </div>


        <section className="admin-welcome">

          <p className="admin-section-eyebrow">
            ADMINISTRATION
          </p>

          <h2>
            Your dashboard is
            <br />
            ready.
          </h2>

          <p>
            This is the secure administration area
            for DCCClothings. We will build your
            orders, enquiries, products and inventory
            management tools here.
          </p>

        </section>

      </div>

    </main>
  );
}