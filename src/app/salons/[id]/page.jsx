import SalonDetailsPage from "@/features/salons/components/SalonDetailsPage";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function getSalon(id) {
  const res = await fetch(`${API_BASE_URL}/businesses/${id}`, {
    next: { revalidate: 300 }
  });
  if (!res.ok) return null;
  return res.json();
}

async function getStaff(id) {
  const res = await fetch(`${API_BASE_URL}/staff/business/${id}`, {
    next: { revalidate: 300 }
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data?.body?.content || [];
}

async function getReviews(id) {
  const res = await fetch(`${API_BASE_URL}/reviews/business/${id}?page=0&size=10&sortBy=rating&sortDir=DESC`, {
    next: { revalidate: 60 }
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.content || [];
}

async function getTimings(id) {
  const res = await fetch(`${API_BASE_URL}/business-timings/business/${id}`, {
    next: { revalidate: 600 }
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function Page({ params }) {
  const { id } = await params;

  const [salon, staff, reviews, timings] = await Promise.all([
    getSalon(id),
    getStaff(id),
    getReviews(id),
    getTimings(id)
  ]);

  if (!salon) {
    return <div className="min-h-screen about-section-bg flex items-center justify-center">Salon not found</div>;
  }

  return (
    <SalonDetailsPage
      salon={salon}
      staff={staff}
      reviews={reviews}
      timings={timings}
      id={id}
    />
  );
}
