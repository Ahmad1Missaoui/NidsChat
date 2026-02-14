import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import { useChatStore } from "./useChatStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useCallStore = create((set, get) => ({
  isCallActive: false,
  callType: null, // 'voice' or 'video'
  isCalling: false,
  isReceivingCall: false,
  caller: null,
  callId: null, // Store the call ID from backend
  localStream: null,
  remoteStream: null,
  peerConnection: null,
  isMuted: false,
  isVideoOff: false,
  isSpeakerOn: true,
  ringtone: null,
  callSound: null,
  calls: [], // Call history

  startCall: async (user, type) => {
    try {
      const constraints = {
        audio: true,
        video: type === 'video',
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      set({ 
        localStream: stream, 
        isCalling: true, 
        callType: type,
        caller: user 
      });

      // Play calling sound
      const callSound = new Audio('/sounds/calling.mp3');
      callSound.loop = true;
      callSound.play().catch(e => console.log('Call sound failed:', e));
      set({ callSound });

      const { socket } = useAuthStore.getState();
      const pc = get().createPeerConnection();
      
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit('callUser', {
        userToCall: user._id,
        signalData: offer,
        from: useAuthStore.getState().authUser._id,
        name: useAuthStore.getState().authUser.fullName,
        callType: type,
      });

    } catch (error) {
      console.error('Error starting call:', error);
      toast.error('Could not access camera/microphone');
      get().endCall();
    }
  },

  answerCall: async (incomingSignal) => {
    try {
      const { callType, caller, ringtone, callId } = get();
      
      // Stop ringtone
      if (ringtone) {
        ringtone.pause();
        ringtone.currentTime = 0;
      }
      
      const constraints = {
        audio: true,
        video: callType === 'video',
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      set({ localStream: stream, isCallActive: true, isReceivingCall: false });

      const pc = get().createPeerConnection();
      
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Set remote description from the incoming offer
      await pc.setRemoteDescription(new RTCSessionDescription(incomingSignal));
      
      // Create and set local description (answer)
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      const { socket } = useAuthStore.getState();
      socket.emit('answerCall', { 
        signal: answer, 
        to: caller._id,
        callId 
      });
      
      // Play connected sound
      const connectedSound = new Audio('/sounds/connected.mp3');
      connectedSound.play().catch(e => console.log('Connected sound failed:', e));

    } catch (error) {
      console.error('Error answering call:', error);
      toast.error('Could not access camera/microphone');
      get().rejectCall();
    }
  },

  rejectCall: () => {
    const { socket } = useAuthStore.getState();
    const { caller, ringtone, callId } = get();
    
    if (caller) {
      socket.emit('rejectCall', { to: caller._id, callId });
      
      // Send missed call message
      socket.emit('missedCall', {
        to: caller._id,
        callType: get().callType,
      });
    }
    
    if (ringtone) {
      ringtone.pause();
      ringtone.currentTime = 0;
    }
    
    get().cleanupCall();
  },

  endCall: () => {
    const { socket } = useAuthStore.getState();
    const { caller, callSound, ringtone, isCalling, callType, callId, isCallActive } = get();
    
    if (caller) {
      socket.emit('endCall', { to: caller._id, callId });
      
      // If we were calling (not in active call), create missed call
      if (isCalling && !isCallActive) {
        socket.emit('missedCall', {
          to: caller._id,
          callType: callType,
        });
      }
    }
    
    if (callSound) {
      callSound.pause();
      callSound.currentTime = 0;
    }
    
    if (ringtone) {
      ringtone.pause();
      ringtone.currentTime = 0;
    }
    
    get().cleanupCall();
  },

  cleanupCall: () => {
    const { localStream, remoteStream, peerConnection, ringtone, callSound } = get();
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
    }
    
    if (peerConnection) {
      peerConnection.close();
    }

    if (ringtone) {
      ringtone.pause();
      ringtone.currentTime = 0;
    }

    if (callSound) {
      callSound.pause();
      callSound.currentTime = 0;
    }

    set({
      isCallActive: false,
      isCalling: false,
      isReceivingCall: false,
      caller: null,
      callId: null,
      localStream: null,
      remoteStream: null,
      peerConnection: null,
      callType: null,
      isMuted: false,
      isVideoOff: false,
      isSpeakerOn: true,
      ringtone: null,
      callSound: null,
    });
  },

  toggleMute: () => {
    const { localStream, isMuted } = get();
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      set({ isMuted: !isMuted });
    }
  },

  toggleVideo: () => {
    const { localStream, isVideoOff } = get();
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff;
      });
      set({ isVideoOff: !isVideoOff });
    }
  },

  toggleSpeaker: () => {
    const { isSpeakerOn } = get();
    // In browsers, speaker control is limited, but we can toggle between earpiece and speaker
    // This is more of a visual indicator
    set({ isSpeakerOn: !isSpeakerOn });
    toast.success(isSpeakerOn ? 'Earpiece mode' : 'Speaker mode');
  },

  createPeerConnection: () => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const { socket } = useAuthStore.getState();
        const { caller } = get();
        socket.emit('iceCandidate', { 
          candidate: event.candidate, 
          to: caller?._id 
        });
      }
    };

    pc.ontrack = (event) => {
      set({ remoteStream: event.streams[0] });
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        get().endCall();
      }
    };

    set({ peerConnection: pc });
    return pc;
  },

  incomingSignal: null,

  subscribeToCallEvents: () => {
    const { socket, authUser } = useAuthStore.getState();

    // Store callId when we initiate a call
    socket.on('callInitiated', ({ callId }) => {
      set({ callId });
    });

    socket.on('incomingCall', ({ from, name, callType, signal, callId }) => {
      const caller = { _id: from, fullName: name };
      set({ 
        isReceivingCall: true, 
        caller,
        callType,
        callId,
        incomingSignal: signal
      });

      // Play ringtone
      const ringtone = new Audio('/sounds/ringtone.mp3');
      ringtone.loop = true;
      ringtone.play().catch(e => console.log('Ringtone play failed:', e));
      
      // Store ringtone to stop later
      set({ ringtone });
    });

    socket.on('callAccepted', async ({ signal, callId }) => {
      const { peerConnection, ringtone, callSound } = get();
      
      // Store the callId when call is accepted
      set({ callId });
      
      if (ringtone) {
        ringtone.pause();
        ringtone.currentTime = 0;
      }

      if (callSound) {
        callSound.pause();
        callSound.currentTime = 0;
      }

      await peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
      set({ isCallActive: true, isCalling: false });
      
      // Play connected sound
      const connectedSound = new Audio('/sounds/connected.mp3');
      connectedSound.play().catch(e => console.log('Connected sound failed:', e));
    });

    socket.on('callRejected', () => {
      const { ringtone, callSound } = get();
      if (ringtone) {
        ringtone.pause();
        ringtone.currentTime = 0;
      }
      if (callSound) {
        callSound.pause();
        callSound.currentTime = 0;
      }
      toast.error('Call rejected');
      get().cleanupCall();
    });

    socket.on('callEnded', () => {
      toast.info('Call ended');
      get().cleanupCall();
    });

    socket.on('iceCandidate', async ({ candidate }) => {
      const { peerConnection } = get();
      if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });
  },

  unsubscribeFromCallEvents: () => {
    const { socket } = useAuthStore.getState();
    socket.off('callInitiated');
    socket.off('incomingCall');
    socket.off('callAccepted');
    socket.off('callRejected');
    socket.off('callEnded');
    socket.off('iceCandidate');
  },

  // Call History Functions
  getCallHistory: async () => {
    try {
      const { data } = await axiosInstance.get("/calls/history");
      set({ calls: data });
    } catch (error) {
      console.error('Error fetching call history:', error);
      toast.error('Failed to load call history');
    }
  },

  deleteCall: async (callId) => {
    try {
      await axiosInstance.delete(`/calls/${callId}`);
      set({ calls: get().calls.filter(call => call._id !== callId) });
      toast.success('Call deleted');
    } catch (error) {
      console.error('Error deleting call:', error);
      toast.error('Failed to delete call');
    }
  },

  initiateCall: async (userId, isVideo = false) => {
    try {
      const userToCall = get().getUserFromChats(userId);
      if (!userToCall) {
        toast.error('User not found');
        return;
      }
      await get().startCall(userToCall, isVideo ? 'video' : 'voice');
    } catch (error) {
      console.error('Error initiating call:', error);
      toast.error('Failed to start call');
    }
  },
  
  getUserFromChats: (userId) => {
    // Helper to get user info from chat store
    const { chats } = useChatStore.getState();
    return chats.find(chat => chat._id === userId);
  },

  getMissedCallsCount: async () => {
    try {
      const { data } = await axiosInstance.get("/calls/missed-count");
      return data.count;
    } catch (error) {
      console.error('Error fetching missed calls count:', error);
      return 0;
    }
  },
}));
