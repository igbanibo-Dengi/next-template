import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { after } from "next/server";
import db from "@/database/drizzle";
import { users } from "@/database/drizzle/schema";
import { eq } from "drizzle-orm";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const session = await auth();

  after(async () => {
    if (!session?.user?.id) return;

    //check if last activity date is today
    const lastActivityDate = await db
      .select({ lastActivityDate: users.lastActivityDate })
      .from(users)
      .where(eq(users.id, session.user.id))
      .then((res) => res[0]?.lastActivityDate);
    if (lastActivityDate === new Date().toISOString().slice(0, 10)) return;

    //update last activity date
    await db
      .update(users)
      .set({ lastActivityDate: new Date().toISOString().slice(0, 10) })
      .where(eq(users.id, session.user.id));
  });

  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </main>
  );
}
