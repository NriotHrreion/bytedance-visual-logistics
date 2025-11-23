"use client";

import { useState, type PropsWithChildren } from "react";
import dynamic from "next/dynamic";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const AMapContainer = dynamic(() => import("@/components/amap-container"), { ssr: false });

const formSchema = z.object({
  name: z.string().nonempty(),
  price: z.number().nonnegative().nonoptional(),
  origin: z.array(z.number()).length(2),
  destination: z.array(z.number()).length(2)
});

export function CreateOrderDialog({
  children,
  asChild
}: PropsWithChildren & {
  asChild?: boolean
}) {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: 0,
      origin: [0, 0],
      destination: [0, 0]
    }
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
      <DialogContent className="min-w-[60vw] p-0 flex overflow-hidden">
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
                    <FormItem className="flex-3">
                      <FormLabel>订单名称</FormLabel>
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
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>价格</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          autoComplete="off"
                          {...field}/>
                      </FormControl>
                    </FormItem>
                  )}/>
              </div>
              <FormField
                control={form.control}
                name="origin"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>发出地</FormLabel>
                    <FormControl>
                      <Input
                        value="江苏省 南京市 玄武区"
                        disabled
                        autoComplete="off"/>
                    </FormControl>
                  </FormItem>
                )}/>
              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>收货地</FormLabel>
                    <FormControl>
                      <Input
                        value=""
                        disabled
                        autoComplete="off"/>
                    </FormControl>
                  </FormItem>
                )}/>
            </form>
          </Form>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">取消</Button>
            </DialogClose>
            <Button>
              创建
            </Button>
          </DialogFooter>
        </div>
        <AMapContainer width={450}/>
      </DialogContent>
    </Dialog>
  );
}
