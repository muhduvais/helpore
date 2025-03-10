import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FaDownload, FaHandHoldingHeart, FaHistory } from 'react-icons/fa';
import { CiHeart } from 'react-icons/ci';
import { HeartHandshake, IndianRupeeIcon, ArrowRight, ThumbsUp, Calendar } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { donationService } from '@/services/donationService';
import DonationSuccessModal from '@/modals/DonationSuccessModal';

interface DonationHistoryItem {
    _id: string;
    amount: number;
    date: string;
    status: 'completed' | 'pending' | 'failed';
    campaign?: string;
}

const DonationPage = () => {
    const [amount, setAmount] = useState<number>(50);
    const [customAmount, setCustomAmount] = useState<string>('');
    const [campaign, setCampaign] = useState<string>('general');
    const [message, setMessage] = useState<string>('');
    const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [donationHistory, setDonationHistory] = useState<DonationHistoryItem[]>([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(true);
    const [showHistory, setShowHistory] = useState<boolean>(false);

    // Donation success modal
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successDonationAmount, setSuccessDonationAmount] = useState(0);
    const [successDonationCampaign, setSuccessDonationCampaign] = useState('');

    const donationAmounts = [50, 100, 500, 1000];

    useEffect(() => {
        const fetchDonationHistory = async () => {
            try {
                setIsHistoryLoading(true);
                const response = await donationService.fetchDonationHistory();

                if (response.status === 200) {
                    setDonationHistory(response.data.donations || []);
                }
            } catch (error) {
                console.error('Error fetching donation history:', error);
            } finally {
                setIsHistoryLoading(false);
            }
        };

        if (showHistory) {
            fetchDonationHistory();
        }
    }, [showHistory]);

    const handleAmountSelect = (selectedAmount: number) => {
        setAmount(selectedAmount);
        setCustomAmount('');
    };

    const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (/^\d*\.?\d*$/.test(value)) {
            setCustomAmount(value);
            if (value) {
                setAmount(parseFloat(value));
            } else {
                setAmount(0);
            }
        }
    };

    const handleDonationCheckout = async () => {
        if (amount < 50) {
            toast.error('Please donate minimum ₹50');
            return;
        }

        setIsLoading(true);
        try {
            const response = await donationService.createCheckoutSession({
                amount,
                campaign,
                message,
                isAnonymous
            });

            // Redirect to Stripe Checkout
            if (response.data?.checkoutUrl) {
                window.location.href = response.data.checkoutUrl;
            } else {
                throw new Error('Failed to get checkout URL');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('There was a problem processing your donation. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const sessionId = query.get('session_id');
        const success = query.get('success');

        if (success === 'true' && sessionId) {
            setSuccessDonationAmount(amount);
            setSuccessDonationCampaign(campaign);
            setIsSuccessModalOpen(true);

            if (showHistory) {
                donationService.fetchDonationHistory()
                    .then(response => {
                        if (response.status === 200) {
                            setDonationHistory(response.data.donations || []);
                        }
                    })
                    .catch(error => console.error('Error fetching updated history:', error));
            }

            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (success === 'false') {
            toast.error('Your donation was not completed. Please try again.');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [showHistory]);

    const handleDownloadReceipt = async (donationId: string) => {
        try {
            await donationService.downloadDonationReceipt(donationId, null);
        } catch (error) {
            console.error('Failed to download receipt:', error);
        }
    };

    return (
        <>
            <DonationSuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => {
                    setIsSuccessModalOpen(false);
                    window.history.replaceState({}, document.title, window.location.pathname);
                }}
                amount={successDonationAmount}
                campaign={successDonationCampaign}
            />
            <div className="p-6 lg:p-8 space-y-6">
                {/* Header Section */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <FaHandHoldingHeart className="text-2xl text-[#688D48]" />
                        <h1 className="text-2xl font-semibold text-gray-800">Make a Donation</h1>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-3 space-y-6">
                            <Card className="p-6">
                                <div className="space-y-6">
                                    <h2 className="text-xl font-medium text-gray-800">Your Contribution Makes a Difference</h2>
                                    <p className="text-gray-600">
                                        Your generosity helps us continue our mission to support those in need.
                                        Choose an amount below or enter a custom donation.
                                    </p>

                                    {/* Donation Amount Selection */}
                                    <div className="space-y-4">
                                        <Label>Select Donation Amount</Label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {donationAmounts.map((amt) => (
                                                <Button
                                                    key={amt}
                                                    type="button"
                                                    variant={amount === amt && !customAmount ? "default" : "outline"}
                                                    onClick={() => handleAmountSelect(amt)}
                                                    className={amount === amt && !customAmount
                                                        ? "bg-[#688D48] hover:bg-[#557239] text-white"
                                                        : "border-[#688D48] text-[#688D48] hover:text-white hover:bg-[#688D48]"}
                                                >
                                                    ₹{amt}
                                                </Button>
                                            ))}
                                        </div>

                                        <div className="relative">
                                            <Label htmlFor="custom-amount">Custom Amount</Label>
                                            <div className="relative mt-1">
                                                <IndianRupeeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                <Input
                                                    id="custom-amount"
                                                    type="text"
                                                    placeholder="Enter amount"
                                                    value={customAmount}
                                                    onChange={handleCustomAmountChange}
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Campaign Selection */}
                                    <div className="space-y-2">
                                        <Label htmlFor="campaign">Select Campaign</Label>
                                        <Select
                                            value={campaign}
                                            onValueChange={setCampaign}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Choose a campaign" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="general">General Donation</SelectItem>
                                                <SelectItem value="education">Education Fund</SelectItem>
                                                <SelectItem value="health">Healthcare Initiatives</SelectItem>
                                                <SelectItem value="food">Food Security Program</SelectItem>
                                                <SelectItem value="shelter">Shelter Support</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Message */}
                                    <div className="space-y-2">
                                        <Label htmlFor="message">Message (Optional)</Label>
                                        <Textarea
                                            id="message"
                                            placeholder="Add a personal message..."
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            rows={3}
                                        />
                                    </div>

                                    {/* Anonymous Option */}
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="anonymous"
                                            checked={isAnonymous}
                                            onChange={() => setIsAnonymous(!isAnonymous)}
                                            className="rounded border-gray-300 text-[#688D48] focus:ring-[#688D48]"
                                        />
                                        <Label htmlFor="anonymous" className="cursor-pointer">Make my donation anonymous</Label>
                                    </div>

                                    {/* Donate Button */}
                                    <Button
                                        onClick={handleDonationCheckout}
                                        className="w-full bg-[#688D48] hover:bg-[#557239] text-white"
                                        disabled={amount <= 0 || isLoading}
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center justify-center">
                                                <DotLottieReact
                                                    src="https://lottie.host/525ff46b-0a14-4aea-965e-4b22ad6a8ce7/wGcySY4DHd.lottie"
                                                    loop
                                                    autoplay
                                                    style={{ width: '24px', height: '24px' }}
                                                />
                                                <span className="ml-2">Processing...</span>
                                            </div>
                                        ) : (
                                            <>
                                                Donate ₹{amount > 0 ? amount.toFixed(2) : '0.00'}
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </Card>

                            <Card className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-medium text-gray-800 flex items-center gap-2">
                                        <FaHistory className="text-[#688D48]" />
                                        Donation History
                                    </h2>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowHistory(!showHistory)}
                                        className="text-[#688D48] border-[#688D48]"
                                    >
                                        {showHistory ? 'Hide History' : 'View History'}
                                    </Button>
                                </div>

                                {/* Donation history */}
                                {showHistory && (
                                    <div>
                                        {isHistoryLoading ? (
                                            <div className="flex justify-center items-center py-8">
                                                <DotLottieReact
                                                    src="https://lottie.host/525ff46b-0a14-4aea-965e-4b22ad6a8ce7/wGcySY4DHd.lottie"
                                                    loop
                                                    autoplay
                                                    style={{ width: '40px', height: '40px' }}
                                                />
                                            </div>
                                        ) : donationHistory.length > 0 ? (
                                            <div className="space-y-4">
                                                {donationHistory.map((donation) => (
                                                    <div
                                                        key={donation._id}
                                                        className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-[#688D48] bg-opacity-10 p-2 rounded-full">
                                                                <HeartHandshake className="h-5 w-5 text-[#688D48]" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">₹{donation.amount.toFixed(2)}</p>
                                                                <p className="text-sm text-gray-500">
                                                                    {donation.campaign ? donation.campaign : 'General Fund'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-right">
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3 text-gray-400" />
                                                                    <p className="text-sm text-gray-500">
                                                                        {format(new Date(donation.date), 'MMM d, yyyy')}
                                                                    </p>
                                                                </div>
                                                                <span
                                                                    className={`text-xs px-2 py-0.5 rounded-full ${donation.status === 'completed'
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : donation.status === 'pending'
                                                                            ? 'bg-yellow-100 text-yellow-800'
                                                                            : 'bg-red-100 text-red-800'
                                                                        }`}
                                                                >
                                                                    {donation.status}
                                                                </span>
                                                            </div>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleDownloadReceipt(donation._id)}
                                                                className="text-[#688D48] border-[#688D48] hover:bg-[#688D48]/10"
                                                            >
                                                                <FaDownload className="mr-2" /> Receipt
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <CiHeart className="mx-auto text-4xl text-gray-300 mb-2" />
                                                <h3 className="text-lg font-medium text-gray-600 mb-1">No Donations Yet</h3>
                                                <p className="text-gray-500 text-sm">Make your first donation today!</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Card>

                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Impact Card */}
                            <Card className="p-6 bg-[#688D48] text-white">
                                <h2 className="text-xl font-medium mb-4">Your Impact</h2>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-white bg-opacity-20 p-2 rounded-full mt-1">
                                            <ThumbsUp className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium">₹100</p>
                                            <p className="text-sm opacity-90">Provides meals for a family in need</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="bg-white bg-opacity-20 p-2 rounded-full mt-1">
                                            <ThumbsUp className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium">₹500</p>
                                            <p className="text-sm opacity-90">Supplies educational materials for children</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="bg-white bg-opacity-20 p-2 rounded-full mt-1">
                                            <ThumbsUp className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium">₹2000</p>
                                            <p className="text-sm opacity-90">Provides emergency medical support</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="bg-white bg-opacity-20 p-2 rounded-full mt-1">
                                            <ThumbsUp className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium">₹10000</p>
                                            <p className="text-sm opacity-90">Helps secure temporary shelter for families</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* FAQ Card */}
                            <Card className="p-6">
                                <h2 className="text-xl font-medium text-gray-800 mb-4">Frequently Asked Questions</h2>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-medium text-[#688D48]">Is my donation tax-deductible?</h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Yes, all donations are tax-deductible. You will receive a receipt for your records.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="font-medium text-[#688D48]">How is my donation used?</h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Your donations directly support our programs and services for those in need in our community.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="font-medium text-[#688D48]">Can I make a recurring donation?</h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Yes, you can set up monthly donations by selecting the recurring option during checkout.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="font-medium text-[#688D48]">Is my payment information secure?</h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Yes, we use Stripe's secure payment processing to ensure your information is protected.
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default DonationPage;
