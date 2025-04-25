/**
 * Downloads an Object as JSON-File
 * Source: https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
 * @param exportObj Object to download
 * @param exportName proposed filename
 */
export function downloadObjectAsJson(
  exportObj: unknown,
  exportName: string
): void {
  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(exportObj));
  const downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}
