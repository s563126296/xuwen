import { useEffect, useRef, useState } from 'react';
import type { FieldPerson, CommandFeedItem, CommandStrategy } from '../stores/commandStore';

/**
 * Triggers incoming call modal only AFTER a strategy starts executing,
 * with a 5-second delay. Does NOT auto-show on command mode entry.
 *
 * Flow: enter command mode → assess situation → select strategy → execute →
 *       5s delay → incoming call appears
 */
export function useIncomingCallHandler(
  commandFeed: CommandFeedItem[],
  fieldPersons: FieldPerson[],
  strategies: CommandStrategy[] = []
) {
  const [showIncomingCall, setShowIncomingCall] = useState(false);
  const [incomingCallMessage, setIncomingCallMessage] = useState('');
  const [incomingCallPerson, setIncomingCallPerson] = useState<FieldPerson | null>(null);
  const lastPhoneFeedIdRef = useRef<string | null>(null);
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasTriggeredRef = useRef(false);

  // Track whether any strategy is currently executing
  const hasExecutingStrategy = strategies.some(s => s.status === 'executing');

  // When a strategy starts executing, wait 5 seconds then check for phone messages
  useEffect(() => {
    // Only trigger once per execution cycle
    if (!hasExecutingStrategy || hasTriggeredRef.current) return;

    hasTriggeredRef.current = true;

    delayTimerRef.current = setTimeout(() => {
      // Find the first unprocessed phone message in the feed
      const phoneMsg = commandFeed.find(f => f.icon === 'phone');
      if (phoneMsg && phoneMsg.id !== lastPhoneFeedIdRef.current) {
        lastPhoneFeedIdRef.current = phoneMsg.id;
        const person = fieldPersons.find(p => p.name === phoneMsg.source);
        if (person) {
          setIncomingCallPerson(person);
          setIncomingCallMessage(phoneMsg.content);
          setShowIncomingCall(true);
        }
      }
    }, 5000);

    return () => {
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }
    };
  }, [hasExecutingStrategy, commandFeed, fieldPersons]);

  // Reset trigger flag when all strategies go back to idle (new cycle)
  useEffect(() => {
    if (!hasExecutingStrategy && !strategies.some(s => s.status === 'done')) {
      hasTriggeredRef.current = false;
    }
  }, [hasExecutingStrategy, strategies]);

  // Handle NEW phone messages that arrive after execution has started
  // (e.g., field personnel calling in during active execution)
  useEffect(() => {
    if (!hasExecutingStrategy || !hasTriggeredRef.current) return;

    const phoneMsg = commandFeed.find(f => f.icon === 'phone');
    if (phoneMsg && phoneMsg.id !== lastPhoneFeedIdRef.current) {
      lastPhoneFeedIdRef.current = phoneMsg.id;
      const person = fieldPersons.find(p => p.name === phoneMsg.source);
      if (person) {
        setIncomingCallPerson(person);
        setIncomingCallMessage(phoneMsg.content);
        setShowIncomingCall(true);
      }
    }
  }, [commandFeed, fieldPersons, hasExecutingStrategy]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }
    };
  }, []);

  return {
    showIncomingCall,
    incomingCallMessage,
    incomingCallPerson,
    setShowIncomingCall,
  };
}
