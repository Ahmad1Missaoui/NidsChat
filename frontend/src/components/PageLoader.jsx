import React from 'react'
import { LoaderIcon} from "lucide-react"

function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-nids-black text-[#facc15] z-50">
     <LoaderIcon className="size-12 animate-spin drop-shadow-[0_0_24px_rgba(212,175,55,0.35)]"/>
    </div>
  )
}

export default PageLoader
