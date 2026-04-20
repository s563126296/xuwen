import { useEffect, useRef, useState } from 'react';
import type { FieldPerson, CommandFeedItem } from '../stores/commandStore';

export function useIncomingCallHandler(
  commandFeed: CommandFeedItem[],
  fieldPersons: FieldPerson[]
) {
  const [showIncomingCall, setShowIncomingCall] = useState(false);
  const [incomingCallMessage, setIncomingCallMessage] = useState('');
  const [incomingCallPerson, setIncomingCallPerson] = useState<FieldPerson | null>(null);
  const lastPhoneFeedIdRef = useRef<string | null>(null);

  useEffect(() => {
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
  }, [commandFeed, fieldPersons]);

  return {
    showIncomingCall,
    incomingCallMessage,
    incomingCallPerson,
    setShowIncomingCall,
  };
}
