import { redirect } from 'next/navigation';

export default function LoginPage() {
  // Since sign-in is removed for the demo, this page is no longer needed.
  // We redirect any access attempts to the main dashboard.
  redirect('/dashboard');
}
