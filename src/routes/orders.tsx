import { createFileRoute, Link } from "@tanstack/react-router";
import { formatPrice, useShop } from "@/lib/shop-store";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Order History — MishraClothings" },
      { name: "description", content: "View your MishraClothings order history, delivery status and returns." },
      { property: "og:title", content: "Order History — MishraClothings" },
      { property: "og:description", content: "Order history, delivery status and returns." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const { orders } = useShop();

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Order history"
        description="Every order, with tracking and prepaid return labels."
        crumbs={[{ label: "Account", to: "/profile" }, { label: "Orders" }]}
      />
      <div className="container-editorial py-12 md:py-16">
        <ul className="space-y-6">
          {orders.map((order) => (
            <li key={order.id} className="rounded-[10px] border border-border p-7">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
                <div>
                  <p className="text-sm">{order.id}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Placed {order.date}</p>
                </div>
                <span className="rounded-full border border-border px-3 py-1 text-[10px] uppercase tracking-[0.12em]">
                  {order.status}
                </span>
                <span className="text-sm">{formatPrice(order.total)}</span>
              </div>
              <ul className="mt-5 space-y-4">
                {order.items.map((item) => (
                  <li key={item.name} className="flex items-center gap-4">
                    <img src={item.image} alt="" width={900} height={1200} loading="lazy" className="h-20 w-16 rounded-[6px] object-cover" />
                    <div className="flex-1 text-sm">
                      <p>{item.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Quantity {item.quantity}</p>
                    </div>
                    <span className="text-sm">{formatPrice(item.price)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <Link to="/faq" className="link-underline">
                  Start a return
                </Link>
                <Link to="/contact" className="link-underline">
                  Contact care team
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
