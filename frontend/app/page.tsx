// Server component wrapper — forces dynamic rendering so the client
// component below can read session state correctly at request time.
export const dynamic = "force-dynamic";

export { default } from "./HomeClient";
