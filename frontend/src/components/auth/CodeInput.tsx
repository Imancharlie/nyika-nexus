import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type Props = { value: string; onChange: (value: string) => void; onComplete?: (value: string) => void };

const CodeInput = ({ value, onChange, onComplete }: Props) => (
  <InputOTP
    maxLength={6}
    value={value}
    onChange={onChange}
    onComplete={onComplete}
    inputMode="numeric"
    pattern="^[0-9]*$"
    autoFocus
    containerClassName="justify-center"
  >
    <InputOTPGroup className="gap-2">
      {Array.from({ length: 6 }, (_, i) => (
        <InputOTPSlot
          key={i}
          index={i}
          className="h-14 w-12 rounded-2xl border-[1.5px] border-[#BFE3CB] bg-white font-display text-2xl font-bold first:rounded-2xl last:rounded-2xl"
        />
      ))}
    </InputOTPGroup>
  </InputOTP>
);

export default CodeInput;
