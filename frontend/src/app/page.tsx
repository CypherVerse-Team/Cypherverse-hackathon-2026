import { API_BASE_URL, cleanName } from '@/lib/api';
import HomePageClient from '@/components/HomePageClient';

async function getCategories() {
  try {
    const res = await fetch(`${API_BASE_URL}/categories`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    return [];
  }
}

async function getWorkers() {
  try {
    const res = await fetch(`${API_BASE_URL}/workers`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((worker: any) => ({
      id: worker.user_id,
      name: worker.full_name,
      profession: cleanName(worker.worker_profile?.skills?.length > 0 ? worker.worker_profile.skills[0].profession.name : (worker.worker_profile?.short_description || "Worker")),
      rawSkills: worker.worker_profile?.skills?.map((s: any) => s.profession?.name) || [],
      rating: worker.worker_profile?.average_rating || 4.8,
      jobs: worker.worker_profile?.completed_jobs || 12,
      distance: 3.5, 
      verified: worker.verification_status === "VERIFIED",
      hourly_rate: worker.worker_profile?.hourly_rate || 350,
      home_city: worker.worker_profile?.home_city || "Delhi NCR",
      status: worker.worker_profile?.availability_status || "AVAILABLE_NOW"
    }));
  } catch (error) {
    console.error("Failed to fetch workers:", error);
    return [];
  }
}

function getFirstString(val: string | string[] | undefined): string {
  if (Array.isArray(val)) return val[0] || '';
  if (typeof val === 'string') return val;
  return '';
}

export default async function Home({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedSearchParams = await searchParams;
  const [workers, categories] = await Promise.all([
    getWorkers(),
    getCategories()
  ]);

  const initialCategory = getFirstString(resolvedSearchParams?.category);
  const initialQuery = getFirstString(resolvedSearchParams?.q) || getFirstString(resolvedSearchParams?.keyword);
  const initialCity = getFirstString(resolvedSearchParams?.city) || getFirstString(resolvedSearchParams?.location);
  const initialVerified = getFirstString(resolvedSearchParams?.verified) === 'true';

  return (
    <HomePageClient
      initialWorkers={workers}
      categories={categories}
      initialCategory={initialCategory}
      initialQuery={initialQuery}
      initialCity={initialCity}
      initialVerified={initialVerified}
    />
  );
}
