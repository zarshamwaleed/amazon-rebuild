import { Link, useLocation } from 'react-router-dom'

const CONTENT = {
  '/about': {
    title: 'About Amazon Rebuild',
    body: [
      'Amazon Rebuild is a student project built in 24 hours to demonstrate a full-stack e-commerce platform using React, Vite, Tailwind CSS, and Supabase.',
      'It is not affiliated with Amazon.com, Inc. Product data, ratings, and reviews are fictional and used for demonstration purposes only.',
    ],
  },
  '/careers': {
    title: 'Careers',
    body: [
      'We are not currently hiring — this page exists as a demonstration of the assignment scope.',
      'In a real deployment, this page would link to a careers portal with open roles, company culture, and benefits.',
    ],
  },
  '/press': {
    title: 'Press Center',
    body: [
      'For press inquiries, please contact press@example.com (this is a demo — the address is not monitored).',
      'Press releases, media kits, and brand assets would normally be available here.',
    ],
  },
  '/investor-relations': {
    title: 'Investor Relations',
    body: [
      'Amazon Rebuild is a fictional company created for this assignment.',
      'Annual reports, SEC filings, and shareholder information would appear on this page in a real deployment.',
    ],
  },
  '/sustainability': {
    title: 'Sustainability',
    body: [
      'Our commitment to sustainability covers packaging, carbon-neutral shipping, and renewable energy.',
      'This page is part of a demonstration project — no real environmental programs are in place.',
    ],
  },
  '/accessibility': {
    title: 'Accessibility',
    body: [
      'Amazon Rebuild is designed with accessibility in mind: keyboard navigation, visible focus rings, screen-reader labels, and semantic HTML.',
      'If you encounter accessibility barriers, please reach out — in a real product, this page would link to a feedback form.',
    ],
  },
}

export default function InfoPage() {
  const { pathname } = useLocation()
  const content = CONTENT[pathname] || {
    title: 'Information',
    body: ['This page is part of the Amazon Rebuild demonstration project.'],
  }

  return (
    <div className="max-w-3xl mx-auto py-6">
      <nav className="text-xs text-gray-600 mb-4">
        <Link to="/" className="hover:underline">Home</Link>
        <span className="mx-1">/</span>
        <span className="text-gray-900">{content.title}</span>
      </nav>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{content.title}</h1>
      <div className="space-y-4 text-gray-700 leading-relaxed">
        {content.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  )
}
