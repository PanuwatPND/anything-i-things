interface Option {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  params?: Record<string, any>;
  data?: Record<string, any>;
  headers?: Record<string, string>;
}

export const client = async (ops: Option) => {
  const config: any = useRuntimeConfig();
  const refToken = useCookie("refToken");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  const headers: any = {
    Authorization: (refToken.value && `Bearer ${refToken.value}`) || undefined,
    ...ops.headers,
  };

  try {
    return await $fetch(ops.url, {
      baseURL: config?.public?.WEB_API + "/api/v1" || "",
      signal: controller.signal,
      method: ops?.method?.toUpperCase() as any,
      body: ops?.data || undefined,
      params: ops?.params || undefined,
      headers,
    });
  } catch (err: any) {
    if (err.data?.code == "401") {
      alert("Your session has expired. Please login again.");

      throw null;
    }

    throw (
      err.data || {
        code: "404",
        message: "Something went wrong",
        data: null,
      }
    );
  } finally {
    clearTimeout(timeoutId);
  }
};
