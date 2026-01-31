import { redirect } from 'next/navigation';

export default function HomePage() {
  // The root page redirects to the dashboard, which will then handle
  // redirecting to the login page if the user is not authenticated.
  redirect('/dashboard');
}
