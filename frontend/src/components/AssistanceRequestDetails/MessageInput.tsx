import { Textarea } from "@/components/ui/textarea";
import { Button } from "../ui/button";
import { Send } from "lucide-react";

export const MessageInput: React.FC<{
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onSend: () => Promise<void>;
    placeholder: string;
    disabled: boolean | undefined;
}> = ({ value, onChange, onSend, placeholder, disabled }) => {
    return (
        <div className="p-4 border-t">
            <div className="flex items-center gap-2">
                <Textarea
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="flex-1 resize-none"
                    rows={1}
                    onKeyDown={(e: any) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            onSend();
                        }
                    }}
                />
                <Button
                    onClick={onSend}
                    size="icon"
                    disabled={!value.trim() || disabled}
                    className="bg-[#688D48] hover:bg-[#5a7a3e] text-white"
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}