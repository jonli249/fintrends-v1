import Image from 'next/image'
import Link from 'next/link'
import GoogleTrendsSearch from '@/components/trendsform'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full max-w-4xl mt-8">
        <GoogleTrendsSearch />
      </div>
    </main>
  )
}
