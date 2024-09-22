import { redirect } from "@remix-run/server-runtime";
import { url, status } from "../__generated__/[hello]._index";

export const loader = () => {
  return redirect(url, status);
};
