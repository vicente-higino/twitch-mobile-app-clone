export function getTimePassed(time: string) {
  const date = new Date(time);
  return formatTimeFromSeconds((Date.now() - date.getTime()) / 1000);

}
export function formatTimeFromSeconds(time: number) {
  const hours = Math.floor(time / 60 / 60).toString().padStart(2, "0");
  const mins = Math.floor((time / 60) % 60).toString().padStart(2, "0");
  const secs = Math.floor(time % 60).toString().padStart(2, "0");
  return `${hours}:${mins}:${secs}`;
}