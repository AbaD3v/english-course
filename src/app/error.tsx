"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900 dark:border-red-950 dark:bg-red-950/30 dark:text-red-100">
      <h2 className="text-xl font-semibold">Что-то пошло не так</h2>
      <p className="mt-2 text-sm opacity-80">Попробуйте перезагрузить страницу или повторить попытку.</p>
      <Button onClick={reset} className="mt-4">Повторить</Button>
    </div>
  );
}
