import QuoteResponseForm from '@/components/admin/QuoteResponseForm';

export default function QuoteDetailPage({ params }: { params: { id: string } }) {
  // The data fetching and logic are now handled directly inside QuoteResponseForm
  // to ensure the data is fresh and avoids server/client state mismatches.
  return <QuoteResponseForm quoteId={params.id} />;
}
