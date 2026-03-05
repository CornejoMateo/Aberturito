import { useState } from 'react';
import { Work } from '@/lib/works/works';

export function useChecklistModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);

  const openChecklist = (work: Work) => {
    setSelectedWork(work);
    setIsOpen(true);
  };

  const closeChecklist = () => {
    setIsOpen(false);
    setSelectedWork(null);
  };

  return {
    isOpen,
    selectedWork,
    openChecklist,
    closeChecklist
  };
}
