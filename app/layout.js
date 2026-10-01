import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";

const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || "1416585060378313";

const geistSans = localFont({
  variable: "--font-geist-sans",
  src: "../public/fonts/Inter-Variable.ttf",
  display: "swap",
});

const geistMono = localFont({
  variable: "--font-geist-mono",
  src: "../public/fonts/Montserrat-Variable.ttf",
  display: "swap",
});

export const metadata = {
  title: "Menos Millas Universitarias — Michael Eusebio",
  description: "Apoya a Michael Eusebio en su camino a la Universidad de Colorado Boulder. Cómprame un día, patrocina mi carrera y sé parte de esta historia.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-0792GYNQN2"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-0792GYNQN2');
            `,
          }}
        />
        {/* Meta Pixel */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${metaPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1" alt="" />`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
