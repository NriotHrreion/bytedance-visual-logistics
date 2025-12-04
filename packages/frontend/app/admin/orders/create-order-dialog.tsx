"use client";

import type { OrderSubmissionDTO } from "shared";
import { useState, type PropsWithChildren } from "react";
import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormItemInfo,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Field,
  FieldLabel
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText
} from "@/components/ui/input-group";
import { backendAPI } from "@/lib/global";
import { getStorageValue } from "@/lib/storage";
import { useLocationName } from "@/hooks/use-location-name";
import { GeoLocationLabel } from "@/components/geolocation-label";

const AMapContainer = dynamic(() => import("@/components/amap-container"), { ssr: false });

const formSchema = z.object({
  name: z.string().nonempty({ message: "订单名称不能为空" }),
  price: z.number({ error: "请输入价格" }).nonnegative({ error: "价格不能为负" }).nonoptional(),
  receiver: z.string().optional()
});

export function CreateOrderDialog({
  children,
  asChild,
  onCreate
}: PropsWithChildren & {
  asChild?: boolean
  onCreate?: () => void
}) {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const { location: destination, setLocation: setDestination, locationName: destinationName } = useLocationName(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: 0,
      receiver: ""
    }
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if(!destination) {
      toast.error("请设置收货地");
      return;
    }

    try {
      await backendAPI.post("/orders", {
        ...values,
        origin: getStorageValue("store-location"),
        destination
      } as OrderSubmissionDTO);
      toast.success("订单创建成功");
      setDialogOpen(false);
      onCreate && onCreate();
    } catch (e: any) {
      toast.error("创建订单失败：" + e.message);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
      <DialogContent className="min-w-[55vw] p-0 flex overflow-hidden">
        <div className="p-6 pr-4 flex-1 flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>创建订单</DialogTitle>
            <DialogDescription>
              在此创建订单，订单创建后将在用户端显示。
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex-2">
                      <FormItemInfo>
                        <FormLabel required>订单名称</FormLabel>
                        <FormMessage />
                      </FormItemInfo>
                      <FormControl>
                        <Input
                          placeholder="请输入订单名称..."
                          autoComplete="off"
                          {...field}/>
                      </FormControl>
                    </FormItem>
                  )}/>
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => {
                    const { value, onChange, ...props } = field;
                    return (
                      <FormItem className="flex-1">
                        <FormItemInfo>
                          <FormLabel required>价格</FormLabel>
                          <FormMessage />
                        </FormItemInfo>
                        <FormControl>
                          <Input
                            type="number"
                            autoComplete="off"
                            value={isNaN(value) ? "" : value}
                            onChange={(e) => onChange(e.target.valueAsNumber)}
                            {...props}/>
                        </FormControl>
                      </FormItem>
                    );
                  }}/>
              </div>
              <Field>
                <FieldLabel>发货地</FieldLabel>
                <div className="flex items-center gap-2">
                  <MapPin size={17} stroke="var(--color-muted-foreground)"/>
                  <GeoLocationLabel
                    className="text-sm"
                    location={(
                      typeof window !== "undefined"
                      ? getStorageValue("store-location")
                      : null
                    )}/>
                </div>
              </Field>
              <Field>
                <FieldLabel required>收货地</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <MapPin />
                  </InputGroupAddon>
                  <InputGroupInput
                    value={destinationName}
                    className="opacity-100!"
                    disabled
                    autoComplete="off"/>
                  <InputGroupText className="mr-3">
                    点击地图选择
                  </InputGroupText>
                </InputGroup>
              </Field>
              <FormField
                control={form.control}
                name="receiver"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>收货人</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="请输入收货人姓名..."
                        autoComplete="off"
                        {...field}/>
                    </FormControl>
                  </FormItem>
                )}/>
            </form>
          </Form>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">取消</Button>
            </DialogClose>
            <Button onClick={() => form.handleSubmit(handleSubmit)()}>
              创建
            </Button>
          </DialogFooter>
        </div>
        <div className="min-w-[420px] border-l *:h-full">
          <AMapContainer
            width={420}
            markable
            onMark={(e) => setDestination(e)}/>
        </div>
      </DialogContent>
    </Dialog>
  );
}
