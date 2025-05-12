import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ThumbsUp, HeartHandshake } from 'lucide-react';

interface DonationSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    campaign?: string;
}

const DonationSuccessModal: React.FC<DonationSuccessModalProps> = ({ 
    isOpen, 
    onClose, 
    campaign = 'General Fund' 
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <div className="text-center space-y-6">
                    <div className="flex justify-center mb-4">
                        <div className="bg-[#688D48] bg-opacity-20 p-4 rounded-full">
                            <HeartHandshake className="h-12 w-12 text-[#688D48]" />
                        </div>
                    </div>
                    
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-semibold text-gray-800 text-center">
                            Thank You for Your Donation!
                        </DialogTitle>
                    </DialogHeader>
                    
                    <DialogDescription className="text-center text-gray-600 space-y-4">
                        <p>
                            Your generous contribution to the <span className="font-semibold">{campaign}</span> campaign will make a real difference.
                        </p>
                        
                        <div className="bg-[#688D48] bg-opacity-10 p-4 rounded-lg">
                            <div className="flex items-center justify-center gap-3">
                                <ThumbsUp className="h-6 w-6 text-[#688D48]" />
                                <p className="text-[#688D48] font-medium">
                                    Your support helps change lives
                                </p>
                            </div>
                        </div>
                    </DialogDescription>
                    
                    <div className="flex justify-center">
                        <Button 
                            onClick={onClose} 
                            className="bg-[#688D48] hover:bg-[#557239] text-white"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DonationSuccessModal;