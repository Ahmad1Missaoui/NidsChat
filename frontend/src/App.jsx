import React, { use } from 'react'
import { Navigate, Route,Routes } from 'react-router'
import HomePage from './pages/HomePage'
import ChatsPage from './pages/ChatsPage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import FriendRequestsPage from './pages/FriendRequestsPage'
import UserSearchPage from './pages/UserSearchPage'
import GroupsPage from './pages/GroupsPage'
import BlockedUsersPage from './pages/BlockedUsersPage'
import SettingsPage from './pages/SettingsPage'
import CallsPage from './pages/CallsPage'
import AIChatPage from './pages/AIChatPage'
import { useEffect } from 'react'
import { useAuthStore } from './store/useAuthStore'
import { useThemeStore } from './store/useThemeStore'
import { useCallStore } from './store/useCallStore'
import PageLoader from './components/PageLoader'
import { Toaster } from 'react-hot-toast'
import IncomingCallModal from './components/IncomingCallModal'
import ActiveCallScreen from './components/ActiveCallScreen'




function App() {
  const { theme } = useThemeStore()
  const {checkAuth,isCheckingAuth,authUser} = useAuthStore()
  const { subscribeToCallEvents, unsubscribeFromCallEvents } = useCallStore()
  
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    checkAuth()
    }, [checkAuth]);

    useEffect(() => {
      if (authUser) {
        subscribeToCallEvents()
        return () => unsubscribeFromCallEvents()
      }
    }, [authUser, subscribeToCallEvents, unsubscribeFromCallEvents])

    console.log({authUser})
    if(isCheckingAuth) return <PageLoader/>



  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <Routes>
        <Route path="/" element={!authUser ? <HomePage/> : <Navigate to={"/chats"} />}/>
        <Route path="/chats" element={authUser ? <ChatsPage/> : <Navigate to={"/"} />}/>
        <Route path="/login" element={!authUser ? <LoginPage/> : <Navigate to={"/chats"} />}/>
        <Route path="/signup" element={!authUser ? <SignUpPage/> : <Navigate to={"/chats"} />}/>
        <Route path="/verify-email" element={<VerifyEmailPage/>}/>
        <Route path="/friend-requests" element={authUser ? <FriendRequestsPage/> : <Navigate to={"/"} />}/>
        <Route path="/search" element={authUser ? <UserSearchPage/> : <Navigate to={"/"} />}/>
        <Route path="/groups" element={authUser ? <GroupsPage/> : <Navigate to={"/"} />}/>
        <Route path="/blocked" element={authUser ? <BlockedUsersPage/> : <Navigate to={"/"} />}/>
        <Route path="/settings" element={authUser ? <SettingsPage/> : <Navigate to={"/"} />}/>
        <Route path="/profile" element={authUser ? <SettingsPage/> : <Navigate to={"/"} />}/>
        <Route path="/calls" element={authUser ? <CallsPage/> : <Navigate to={"/"} />}/>
        <Route path="/ai-chat" element={authUser ? <AIChatPage/> : <Navigate to={"/"} />}/>
      </Routes>

      {/* Call Components */}
      <IncomingCallModal />
      <ActiveCallScreen />

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "rgba(12,12,18,0.9)",
            color: "#facc15",
            border: "1px solid rgba(212,175,55,0.35)",
            boxShadow: "0 10px 32px rgba(212,175,55,0.18)",
          },
          success: {
            iconTheme: { primary: "#facc15", secondary: "#0b0b0f" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#0b0b0f" },
          },
        }}
      />
    </div>
  );
}

export default App
