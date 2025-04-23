import { versionUpdata_0_1_0 } from "./0.1.0";

export async function versionUpdata(ready: Promise<void>): Promise<void> {
  await versionUpdata_0_1_0(ready);
}
