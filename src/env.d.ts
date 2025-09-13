import "../.astro/types.d.ts";

declare namespace App {
  interface Locals {
    user: import('./lib/types').UserWithoutPassword | null;
    session: import('./lib/types').Session | null;
  }
}
