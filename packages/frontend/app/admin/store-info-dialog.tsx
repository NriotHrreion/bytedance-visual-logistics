"use client";

import { useState, type PropsWithChildren } from "react";
import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldLabel
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText
} from "@/components/ui/input-group";
import { getStorageValue, setStorageValue } from "@/lib/storage";
import { useLocationName } from "@/hooks/use-location-name";

const AMapContainer = dynamic(() => import("@/components/amap-container"), { ssr: false });

export function StoreInfoDialog({
  children,
  asChild
}: PropsWithChildren & {
  asChild?: boolean
}) {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const { location, setLocation, locationName } = useLocationName(
    typeof window !== "undefined"
    ? getStorageValue("store-location")
    : null
  );

  const handleCancel = () => {
    setDialogOpen(false);
    setLocation(getStorageValue("store-location"));
  };

  const handleSave = () => {
    if(!location) return;

    setStorageValue("store-location", location);
    toast.success("已保存店铺信息");
    setDialogOpen(false);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
      <DialogContent className="min-w-[55vw] h-96 p-0 flex overflow-hidden">
        <div className="p-6 pr-4 flex-1 flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>店铺信息</DialogTitle>
            <DialogDescription>
              在此修改店铺信息，这些信息将保存在本地。
            </DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel required>发货地</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <MapPin />
              </InputGroupAddon>
              <InputGroupInput
                value={locationName}
                className="opacity-100!"
                disabled
                autoComplete="off"/>
              <InputGroupText className="mr-3">
                点击地图选择
              </InputGroupText>
            </InputGroup>
          </Field>
          <DialogFooter className="mt-auto">
            <Button
              variant="outline"
              onClick={() => handleCancel()}>
              取消
            </Button>
            <Button onClick={() => handleSave()}>
              保存
            </Button>
          </DialogFooter>
        </div>
        <div className="min-w-[420px] border-l *:h-full">
          <AMapContainer
            width={420}
            location={location}
            markable
            onMark={(e) => setLocation(e)}/>
        </div>
      </DialogContent>
    </Dialog>
  );
}
