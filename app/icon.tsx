import { ImageResponse } from 'next/og'
 
// Route segment config
export const runtime = 'edge'
 
// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'
 
// Image generation - Matches HoodizLogo component
export default async function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 50%, #3b82f6 100%)',
          borderRadius: '8px',
        }}
      >
        {/* Stylized H icon */}
        <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Left vertical bar */}
          <rect x="12" y="12" width="6" height="24" rx="2" fill="white" />
          {/* Right vertical bar */}
          <rect x="30" y="12" width="6" height="24" rx="2" fill="white" />
          {/* Horizontal connector */}
          <rect x="18" y="21" width="12" height="6" rx="2" fill="white" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
