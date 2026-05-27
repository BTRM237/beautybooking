import { revalidatePath } from "next/cache";
import { CACHE_TAGS, invalidateCacheTags } from "@/lib/cache";

function revalidateSite() {
  try {
    revalidatePath("/", "layout");
  } catch (error) {
    console.warn("Next.js path revalidation failed:", error);
  }
}

export async function invalidateServicesCache() {
  await invalidateCacheTags(CACHE_TAGS.public, CACHE_TAGS.services, CACHE_TAGS.availability);
  revalidateSite();
}

export async function invalidateStaffCache() {
  await invalidateCacheTags(CACHE_TAGS.public, CACHE_TAGS.staff, CACHE_TAGS.availability);
  revalidateSite();
}

export async function invalidateContentCache(...tags: string[]) {
  await invalidateCacheTags(CACHE_TAGS.public, ...tags);
  revalidateSite();
}

export async function invalidateAvailabilityCache() {
  await invalidateCacheTags(CACHE_TAGS.availability, CACHE_TAGS.bookings);
}
