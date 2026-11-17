import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — CHVMPBUZZ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <section className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="font-display text-4xl font-black uppercase">Admin</h1>
      <p className="mt-4 text-sm text-muted-foreground">The admin panel is not finished yet.</p>
    </section>
  ),
});
