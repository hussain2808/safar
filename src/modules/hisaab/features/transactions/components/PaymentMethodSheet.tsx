import { Check } from 'lucide-react';
import { BottomSheet } from '@/modules/hisaab/shared/components/BottomSheet';
import { PAYMENT_METHOD_IDS, PAYMENT_METHOD_LABELS, PaymentMethodIcon } from '@/modules/hisaab/lib/paymentMethods';

interface PaymentMethodSheetProps {
  open: boolean;
  onClose: () => void;
  value?: string;
  onSelect: (method: string | undefined) => void;
}

export function PaymentMethodSheet({ open, onClose, value, onSelect }: PaymentMethodSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Payment Method">
      <div className="px-2 pt-2 pb-8">
        {PAYMENT_METHOD_IDS.map((id) => (
          <button
            key={id}
            onClick={() => { onSelect(id); onClose(); }}
            className="w-full flex items-center gap-3 px-3 py-3.5 rounded-icon active:bg-bg-hover transition-colors"
          >
            <span className="w-9 h-9 rounded-icon bg-bg-icon flex items-center justify-center flex-shrink-0 text-hisaabText-secondary">
              <PaymentMethodIcon methodId={id} size={16} />
            </span>
            <span className="flex-1 text-body text-hisaabText-primary text-left">{PAYMENT_METHOD_LABELS[id]}</span>
            {value === id && <Check size={18} className="text-hisaabAccent-button flex-shrink-0" />}
          </button>
        ))}
        {value && (
          <button
            onClick={() => { onSelect(undefined); onClose(); }}
            className="w-full text-center text-caption text-hisaabText-secondary underline py-3 mt-1"
          >
            Clear selection
          </button>
        )}
      </div>
    </BottomSheet>
  );
}
