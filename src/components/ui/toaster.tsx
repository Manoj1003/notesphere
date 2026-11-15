"use client";

import { ToastProvider, ToastViewport } from "./toast";

export const Toaster = () => (
  <ToastProvider>
    <ToastViewport />
  </ToastProvider>
);

