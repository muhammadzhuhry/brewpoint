import { ok } from "@/lib/api-response";
import { withErrorHandling } from "@/lib/api-handler";

export const POST = withErrorHandling(async () => {
  const response = ok({ message: "Logged out." });
  response.cookies.delete("session");
  return response;
});
