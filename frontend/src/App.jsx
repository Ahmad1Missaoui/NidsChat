import React, { use } from 'react'
import { Navigate, Route,Routes } from 'react-router'
import ChatsPage from './pages/ChatsPage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import { useEffect } from 'react'
import { useAuthStore } from './store/useAuthStore'
import PageLoader from './components/PageLoader'
import { Toaster } from 'react-hot-toast'




function App() {
  const {checkAuth,isCheckingAuth,authUser} = useAuthStore()
  useEffect(() => {
    checkAuth()
    }, [checkAuth]);

    console.log({authUser})
    if(isCheckingAuth) return <PageLoader/>



  return (

  <div className="min-h-screen bg-slate-900 relative flex items-center justify-center p-4 overflow-hidden">
  {/* DECORATORS - GRID BG & GLOW SHAPES */}
  {/* Dark Grid Background */}
  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:14px_24px]" />
  {/* Yellow and Black Glow Shapes */}
  <div className="absolute top-0 -left-4 size-96 bg-green-400 opacity-20 blur-[100px]" />
  <div className="absolute bottom-0 -right-4 size-96  bg-yellow-400 opacity-20 blur-[100px]"/>

    <Routes>
        <Route path="/" element={authUser ? <ChatsPage/>:<Navigate to={"/login"} />}/>
        <Route path="/login" element={!authUser ? <LoginPage/> : <Navigate to={"/"} />}/>
        <Route path="/signup" element={!authUser ? <SignUpPage/> : <Navigate to={"/"} />}/> 
    </Routes>


   <Toaster/>
    </div>
  );
}

export default App
