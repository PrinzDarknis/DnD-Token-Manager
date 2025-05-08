import { Log } from "../../../utils";

export async function readFile<T>(
  file: File | undefined,
  validator?: (data: Partial<T>) => boolean
): Promise<T | undefined> {
  if (!file) return;

  return new Promise<T | undefined>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data: T = JSON.parse(reader.result as string);
        if (validator) if (!validator(data)) return resolve(undefined);
        return resolve(data);
      } catch (error) {
        Log.error("readFile", "Error while reading import data", error);
        return resolve(undefined);
      }
    };
    reader.readAsText(file);
  });
}
