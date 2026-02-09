import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "@/lib/utils/uploadthing";

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
