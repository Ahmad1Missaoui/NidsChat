import React from 'react'
import { useAuthStore } from "../store/useAuthStore";

function ChatsPage() {
  const {logout}=useAuthStore()
  return (
    <div className='z-10'>
      chatspage
      <button onClick={logout}>logout</button>
    </div>
  )
}
export default ChatsPage
