import '../styles/canvasStroke.css'
import '../styles/canvasTools.css'
import '../styles/menu.css'
import '../styles/squareSidebar.css'
import '../styles/circleSidebar.css'
import '../styles/lineSidebar.css'
import '../styles/paintbrushSidebar.css'
import '../styles/arrowSidebar.css'
import '../styles/textToolBar.css'
import '../styles/frameSidebar.css'
import '../styles/writeText.css'

export const metadata = {
  title: 'LixSketch',
  icons: {
    icon: '/Images/logo.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet" />
        <link href="https://cdn.boxicons.com/fonts/basic/boxicons.min.css" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github-dark-dimmed.min.css" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
