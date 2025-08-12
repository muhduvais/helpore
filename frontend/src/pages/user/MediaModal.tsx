import { X } from "lucide-react";

export default function ImageModal({ url, close }: { url: string, close: () => void }) {
    if (!url) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                onClick={close}
            ></div>
            <div className="relative z-10 bg-white rounded-lg shadow-2xl max-w-4xl max-h-[90vh] overflow-hidden">
                <button
                    onClick={close}
                    className="absolute top-4 right-4 z-20 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-colors"
                >
                    <X size={20} />
                </button>
                <img
                    src={url}
                    alt="attachment"
                    className="w-full h-auto max-h-[90vh] object-contain"
                />
            </div>
        </div>
    );
}