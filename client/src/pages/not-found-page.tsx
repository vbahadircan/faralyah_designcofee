import { Link } from 'react-router';
import { tr } from '@/content/tr';

export function NotFoundPage() {
  return (
    <>
      <h1 className="text-2xl">{tr.notFound.title}</h1>
      <p className="mt-3">
        <Link to="/" className="inline-flex min-h-11 items-center text-burgundy underline">
          {tr.notFound.back}
        </Link>
      </p>
    </>
  );
}
