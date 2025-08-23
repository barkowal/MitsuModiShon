import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Inserts number into sorted array, returns index
export function insertSort(arr: number[], num: number): number {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (arr[mid] === num) {
      return mid;
    } else if (arr[mid] < num) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  arr.splice(left, 0, num);
  return left;
}

export function formatDateString(dateString: string) {
  const date = new Date(dateString);

  const day: string = String(date.getUTCDate()).padStart(2, "0");
  const month: string = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year: string = String(date.getUTCFullYear());

  const formattedDate: string = `${day}.${month}.${year}`;

  return formattedDate;
}
