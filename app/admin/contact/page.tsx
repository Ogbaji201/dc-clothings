import { createAdminClient } from "@/lib/supabase/admin";
import ContactMessageFilters from "../components/ContactMessageFilters";

export default async function AdminContactPage() {
  const supabase = createAdminClient();

  const { data: messages, error } = await supabase
    .from("contact_messages")
    .select(
      `
      id,
      full_name,
      email,
      phone,
      address,
      subject,
      message,
      status,
      created_at
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Contact messages fetch error:", error);
  }

  const messageList = messages ?? [];

  return (
    <main className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">
            DC CLOTHINGS / ADMINISTRATION
          </p>

          <h1>Contact Messages</h1>

          <p className="admin-page-introduction">
            Manage enquiries and messages submitted
            through your website.
          </p>
        </div>
      </div>

      <section className="admin-section">
        <div className="admin-section-header">
          <div>
            <p className="admin-eyebrow">
              CUSTOMER COMMUNICATION
            </p>

            <h2>All Messages</h2>
          </div>

          <span className="admin-record-count">
            {messageList.length}{" "}
            {messageList.length === 1
              ? "message"
              : "messages"}
          </span>
        </div>

        {error ? (
          <div className="admin-empty-state">
            <h3>Unable to load messages</h3>

            <p>
              There was a problem retrieving contact
              messages from the database. Please refresh
              the page and try again.
            </p>
          </div>
        ) : (
          <ContactMessageFilters messages={messageList} />
        )}
      </section>
    </main>
  );
}