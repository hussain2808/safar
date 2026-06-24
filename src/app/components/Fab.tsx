import { Plus } from 'lucide-react';

export function Fab() {
  return (
    <button className="fixed bottom-20 right-5 w-14 h-14 rounded-full bg-brown text-white shadow-lg flex items-center justify-center active:scale-95">
      <Plus size={24} />
    </button>
  );
}
