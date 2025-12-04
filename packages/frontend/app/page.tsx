import Link from "next/link";
import { Store, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="flex flex-col items-center gap-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">25字节跳动工程训练营课题项目</h1>
          <span className="text-lg text-muted-foreground">电商物流配送可视化平台</span>
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            asChild>
            <Link href="/admin/orders">
              <Store />
              商家
            </Link>
          </Button>
          <Button
            variant="outline"
            asChild>
            <Link href="/client">
              <UserRound />
              客户
            </Link>
          </Button>
        </div>
        <span>南京邮电大学 - 陈立</span>
      </div>
    </div>
  );
}
