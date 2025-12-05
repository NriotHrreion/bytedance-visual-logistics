import Link from "next/link";
import { Truck } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="h-screen flex flex-col">
      <NavigationMenu className="max-w-full w-full flex-none px-[15%] py-2 border-b justify-between *:list-none [&_a]:rounded-sm">
        <div className="flex items-center gap-4">
          <Truck size={18}/>
          <h1 className="font-semibold">物流可视化管理端</h1>
        </div>
        <div className="flex gap-2">
          <NavigationMenuItem>
            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
              <Link href="/admin/orders">订单列表</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
              <Link href="/admin/statistics">数据看板</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </div>
      </NavigationMenu>
      {children}
    </main>
  );
}
