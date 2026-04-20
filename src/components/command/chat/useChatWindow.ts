import { useEffect, useMemo, useRef, useState } from 'react';
import { useCommandStore } from '../../../stores/commandStore';
import { playMessageSound, playClickSound } from '../../../utils/soundEffects';
import { ChatType, PERSONS, STATUS_CONFIG } from './ChatTypes';

export function useChatWindow() {
  const [minimized, setMinimized] = useState(false);
  const [closed, setClosed] = useState(false);
  const [chatType, setChatType] = useState<ChatType>('group');
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [animationState, setAnimationState] = useState<'entering' | 'entered'>('entering');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);

  const commandState = useCommandStore((s) => s.commandState);
  const addCommandFeedItem = useCommandStore((s) => s.addCommandFeedItem);
  const startCall = useCommandStore((s) => s.startCall);
  const { commandFeed } = commandState;
  const activeChatPersonId = useCommandStore((s) => s.commandState.activeChatPersonId);

  const unreadCount = commandFeed.filter((item) => item.type === 'field').length;

  const departments = useMemo(() => {
    return Array.from(new Set(PERSONS.map((person) => person.department)));
  }, []);

  const selectedPersonRecord = useMemo(() => {
    if (!selectedPerson) return null;
    return PERSONS.find((person) => person.id === selectedPerson) ?? null;
  }, [selectedPerson]);

  const selectedMessages = useMemo(() => {
    const sortedByTimeline = [...commandFeed].reverse();

    if (chatType === 'group') {
      return sortedByTimeline;
    }

    if (!selectedPersonRecord) {
      return [];
    }

    return sortedByTimeline.filter(
      (item) => item.source === selectedPersonRecord.name || item.type === 'command'
    );
  }, [chatType, commandFeed, selectedPersonRecord]);

  useEffect(() => {
    if (minimized || closed) return;
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [selectedMessages, minimized, closed]);

  // Play message sound when new messages arrive
  useEffect(() => {
    if (selectedMessages.length > prevMessageCountRef.current && prevMessageCountRef.current > 0) {
      playMessageSound();
    }
    prevMessageCountRef.current = selectedMessages.length;
  }, [selectedMessages.length]);

  // Entrance animation
  useEffect(() => {
    if (!closed && !minimized) {
      setAnimationState('entering');
      setTimeout(() => setAnimationState('entered'), 50);
    }
  }, [closed, minimized]);

  // 响应 store 中的 activeChatPersonId 变化
  useEffect(() => {
    if (activeChatPersonId) {
      setClosed(false);
      setMinimized(false);
      setChatType('private');
      setSelectedPerson(activeChatPersonId);
    }
  }, [activeChatPersonId]);

  const handleSelectGroup = () => {
    setChatType('group');
    setSelectedPerson(null);
  };

  const handleSelectPerson = (personId: string) => {
    setChatType('private');
    setSelectedPerson(personId);
  };

  const handleQuickReply = (text: string) => {
    playClickSound();
    if (chatType === 'group') {
      addCommandFeedItem(`[群组] ${text}`);
      return;
    }

    if (selectedPersonRecord) {
      addCommandFeedItem(text);
    }
  };

  const handleStartCall = (type: 'voice' | 'video') => {
    playClickSound();
    if (!selectedPersonRecord) return;

    if (type === 'voice') {
      addCommandFeedItem(`发起与${selectedPersonRecord.name}的语音通话`);
      return;
    }

    startCall(selectedPersonRecord.id);
    addCommandFeedItem(`发起与${selectedPersonRecord.name}的视频通话`);
  };

  const getSourceDotColor = (source: string) => {
    const person = PERSONS.find((item) => item.name === source);
    if (person) {
      return STATUS_CONFIG[person.status].color;
    }
    return '#64748B';
  };

  return {
    minimized,
    setMinimized,
    closed,
    setClosed,
    chatType,
    selectedPerson,
    animationState,
    messagesEndRef,
    messagesContainerRef,
    unreadCount,
    departments,
    selectedPersonRecord,
    selectedMessages,
    commandFeed,
    handleSelectGroup,
    handleSelectPerson,
    handleQuickReply,
    handleStartCall,
    getSourceDotColor,
  };
}
