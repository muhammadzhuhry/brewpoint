export const ROUTE_ROLES: Record<string, ("admin" | "cashier")[]> = {
  "/dashboard": ["admin"],
  "/checkout": ["admin", "cashier"],
  "/products": ["admin", "cashier"],
  "/categories": ["admin", "cashier"],
  "/users": ["admin"],
  "/stock": ["admin"],
  "/transactions": ["admin", "cashier"],
};
