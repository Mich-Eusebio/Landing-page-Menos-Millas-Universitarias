export async function generateMetadata({ searchParams }) {
  const params = await searchParams
  const day = params?.day || ''
  const name = params?.name || ''
  const photo = params?.photo || ''

  const baseUrl = 'https://millasmichael.do'
  const ogUrl = `${baseUrl}/api/og-image?day=${encodeURIComponent(day)}&name=${encodeURIComponent(name)}&photo=${encodeURIComponent(photo)}`

  return {
    openGraph: {
      title: day ? `¡Patrociné el día ${day} de Michael! 🎉` : 'Menos Millas Universitarias',
      description: 'Únete y apoya este proyecto. Cada día patrocinado me acerca a la Universidad de Colorado Boulder.',
      images: [
        {
          url: ogUrl,
          width: 1200,
          height: 630,
          alt: day ? `Día ${day} patrocinado` : 'Menos Millas Universitarias',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: day ? `¡Patrociné el día ${day} de Michael!` : 'Menos Millas Universitarias',
      description: 'Únete y apoya este proyecto.',
      images: [ogUrl],
    },
    other: {
      'og:image:width': '1200',
      'og:image:height': '630',
    },
  }
}

export const dynamic = 'force-dynamic'

export default function GraciasLayout({ children }) {
  return children
}
