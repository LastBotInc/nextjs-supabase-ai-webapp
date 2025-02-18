import Link from 'next/link'
import { CheckCircleIcon } from '@heroicons/react/24/outline'

export default function BookingSuccessPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="mb-8">
        <CheckCircleIcon className="w-16 h-16 mx-auto text-green-500" />
      </div>

      <h1 className="text-3xl font-bold mb-4">
        Booking Confirmed!
      </h1>

      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
        Thank you for booking a meeting. You will receive a confirmation email shortly with all the details.
      </p>

      <div className="space-y-4">
        <p className="text-gray-500 dark:text-gray-400">
          Please check your email for:
        </p>
        <ul className="text-gray-600 dark:text-gray-300 space-y-2">
          <li>Meeting link</li>
          <li>Calendar invitation</li>
          <li>Preparation instructions</li>
        </ul>
      </div>

      <div className="mt-12">
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600"
        >
          Return to Home
        </Link>
      </div>
    </div>
  )
} 