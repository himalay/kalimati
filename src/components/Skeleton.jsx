import React from 'react'
import ContentLoader from 'react-content-loader'

export default function Skeleton(props) {
  return (
    <ContentLoader
      height="100%"
      width="100%"
      speed={2}
      viewBox="0 0 400 380"
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
      {...props}
    >
      <rect x="0" y="18" rx="0" ry="0" width="494" height="10" />
      <rect x="0" y="39" rx="0" ry="0" width="732" height="160" />
      <rect x="0" y="207" rx="0" ry="0" width="732" height="160" />
    </ContentLoader>
  )
}
