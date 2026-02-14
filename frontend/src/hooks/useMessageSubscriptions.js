import { useEffect, useRef } from 'react';

/**
 * Custom hook for managing message subscriptions with proper cleanup
 * Prevents memory leaks from socket listeners
 * @param {Object} params
 * @param {boolean} params.isGroupChat
 * @param {Object} params.selectedUser
 * @param {Object} params.selectedGroup
 * @param {boolean} params.isConversationBlocked
 * @param {Function} params.getMessagesByUserId
 * @param {Function} params.getGroupMessages
 * @param {Function} params.subscribeToMessages
 * @param {Function} params.unsubscribeFromMessages
 * @param {Function} params.subscribeToGroupMessages
 * @param {Function} params.unsubscribeFromGroupMessages
 */
export const useMessageSubscriptions = ({
  isGroupChat,
  selectedUser,
  selectedGroup,
  isConversationBlocked,
  getMessagesByUserId,
  getGroupMessages,
  subscribeToMessages,
  unsubscribeFromMessages,
  subscribeToGroupMessages,
  unsubscribeFromGroupMessages,
}) => {
  const subscriptionRef = useRef(null);

  useEffect(() => {
    // Cleanup previous subscription
    const cleanup = () => {
      if (subscriptionRef.current) {
        subscriptionRef.current();
        subscriptionRef.current = null;
      }
    };

    cleanup();

    if (isGroupChat && selectedGroup) {
      getGroupMessages(selectedGroup._id);
      subscribeToGroupMessages();
      subscriptionRef.current = unsubscribeFromGroupMessages;
      
      return cleanup;
    }

    if (selectedUser && isConversationBlocked) {
      unsubscribeFromMessages();
      return cleanup;
    }

    if (selectedUser) {
      getMessagesByUserId(selectedUser._id);
      subscribeToMessages();
      subscriptionRef.current = unsubscribeFromMessages;
      
      return cleanup;
    }

    return cleanup;
  }, [
    isGroupChat,
    isConversationBlocked,
    selectedUser?._id,
    selectedGroup?._id,
  ]);
};
