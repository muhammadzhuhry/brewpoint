import { AppError } from "@/lib/app-error";
import { fail } from "@/lib/api-response";

export function withErrorHandling<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>,
) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof AppError) {
        return fail(error.code, error.message, error.status);
      }
      console.error(error);
      return fail("INTERNAL", "Something went wrong.", 500);
    }
  };
}
