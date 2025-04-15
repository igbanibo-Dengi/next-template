import { serve } from "@upstash/workflow/nextjs";
import db from "@/database/drizzle";
import { users } from "@/database/drizzle/schema";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/workflow";
import { getWelcomeEmailHTML } from "@/lib/emails/WelcomeEmail";

type UserState = "non-active" | "active";

type InitialData = {
  email: string;
  name: string;
  token: string;
  productionUrl: string;
};

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
const THREE_DAYS_IN_MS = 3 * ONE_DAY_IN_MS;
const THIRTY_DAYS_IN_MS = 30 * ONE_DAY_IN_MS;

const getUserState = async (email: string): Promise<UserState> => {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (user.length === 0) return "non-active";

  const lastActivityDate = new Date(user[0].lastActivityDate!);
  const now = new Date();
  const timeDifference = now.getTime() - lastActivityDate.getTime();

  if (
    timeDifference > THREE_DAYS_IN_MS &&
    timeDifference <= THIRTY_DAYS_IN_MS
  ) {
    return "non-active";
  }

  return "active";
};

export const { POST } = serve<InitialData>(async (context) => {
  const { email, name, token, productionUrl } = context.requestPayload;


  const verifyEmailData = {
    name,
    token,
    productionUrl,
  }

  // Welcome Email
  await context.run("new-signup", async () => {

    console.log(`Sending email to ${email} with token ${token}, name ${name}, productionUrl ${productionUrl}`);


    await sendEmail({
      email,
      subject: "Welcome to Igbanibo's Platform 🎉",
      message: getWelcomeEmailHTML(verifyEmailData)
    });
  });


  await context.sleep("wait-for-3-days", 60 * 60 * 24 * 3);

  while (true) {
    const state = await context.run("check-user-state", async () => {
      return await getUserState(email);
    });

    if (state === "non-active") {
      await context.run("send-email-non-active", async () => {
        await sendEmail({
          email,
          subject: "Are you still there?",
          message: `Hey ${name}, we miss you!`,
        });
      });
    } else if (state === "active") {
      await context.run("send-email-active", async () => {
        await sendEmail({
          email,
          subject: "Welcome back!",
          message: `Welcome back ${name}!`,
        });
      });
    }

    await context.sleep("wait-for-1-month", 60 * 60 * 24 * 30);
  }
});