import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from 'framer-motion';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
    AlertCircle,
    ArrowLeft,
    CalendarIcon,
    Clock,
    Plus
} from "lucide-react";
import { format } from "date-fns";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { validateForm } from '@/utils/validation';
import { IAssistanceRequest, IAddress } from '@/interfaces/userInterface';
import { Types } from 'mongoose';
import { userService } from '@/services/user.service';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

interface FormData {
    type: string;
    volunteerType?: string;
    priority: string;
    requestedDate: Date | undefined;
    requestedTime: string;
    selectedAddressId: string;
    description: string;
}

type FormErrors = {
    [K in keyof FormData]?: string;
}

type AddressErrors = {
    [K in keyof IAddress]?: string;
}

const initialFormData: FormData = {
    type: '',
    volunteerType: undefined,
    priority: '',
    requestedDate: undefined,
    requestedTime: '',
    selectedAddressId: '',
    description: '',
};

const initialAddressData: IAddress = {
    fname: '',
    lname: '',
    street: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
};

const initialFormErrors: FormErrors = {
    type: '',
    volunteerType: '',
    priority: '',
    requestedDate: '',
    requestedTime: '',
    selectedAddressId: '',
    description: '',
};

const initialAddressErrors: AddressErrors = {
    fname: '',
    lname: '',
    street: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
};

const RequestAssistanceForm = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAddressSubmitting, setIsAddressSubmitting] = useState(false);
    const [generalError, setGeneralError] = useState("");
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [addressData, setAddressData] = useState<IAddress>(initialAddressData);
    const [formErrors, setFormErrors] = useState<FormErrors>(initialFormErrors);
    const [addressErrors, setAddressErrors] = useState<AddressErrors>(initialAddressErrors);
    const [addresses, setAddresses] = useState<IAddress[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchUserAddresses();
    }, []);

    const fetchUserAddresses = async () => {
        try {
            const response = await userService.getUserAddresses();
            if (response.status === 200) {
                setAddresses(response.data.addresses);
                if (response.data.length > 0) {
                    setFormData(prev => ({ ...prev, selectedAddressId: response.data[0]._id }));
                }
            }
        } catch (error) {
            toast.error("Failed to fetch addresses");
        }
    };

    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                slots.push(timeString);
            }
        }
        return slots;
    };

    const handleInputChange = (field: keyof FormData, value: FormData[keyof FormData]) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAddressInputChange = (field: keyof IAddress, value: string) => {
        setAddressData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const transformFormDataToRequest = (data: FormData): Omit<IAssistanceRequest, 'user' | 'status' | 'volunteer'> => {
        return {
            type: data.type,
            volunteerType: data.type === 'volunteer' ? data.volunteerType : undefined,
            description: data.description,
            requestedDate: data.requestedDate as Date,
            requestedTime: data.requestedTime,
            priority: data.priority,
            address: new Types.ObjectId(data.selectedAddressId),
        };
    };

    const validateAllFields = () => {
        const newFormErrors: FormErrors = { ...initialFormErrors };
        let hasError = false;

        (Object.keys(formData) as Array<keyof FormData>).forEach((field) => {
            const validationResult = validateForm(field, formData[field] as string);
            if (validationResult?.error) {
                newFormErrors[field] = validationResult.error;
                hasError = true;
            }
        });

        return { newFormErrors, hasError };
    };

    const validateAddressFields = () => {
        const newAddressErrors: AddressErrors = { ...initialAddressErrors };
        let hasError = false;

        (Object.keys(addressData) as Array<keyof IAddress>).forEach((field) => {
            const validationResult = validateForm(field, addressData[field] as string);
            if (validationResult?.error) {
                newAddressErrors[field] = validationResult.error;
                hasError = true;
            }
        });

        return { newAddressErrors, hasError };
    };

    const handleAddressSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsAddressSubmitting(true);
        setAddressErrors(initialAddressErrors);

        try {
            const { newAddressErrors, hasError } = validateAddressFields();
            setAddressErrors(newAddressErrors);

            if (hasError) {
                return;
            }

            const response = await userService.createAddress(addressData);
            if (response.status === 200) {
                toast.success("Address created successfully!");
                await fetchUserAddresses();
                setFormData(prev => ({ ...prev, selectedAddressId: response.data._id }));
                setIsModalOpen(false);
                setAddressData(initialAddressData);
            }
        } catch (error) {
            console.log('error: ', error)
            toast.error("Failed to create address");
        } finally {
            setIsAddressSubmitting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsSubmitting(true);
        setGeneralError("");
        setFormErrors(initialFormErrors);

        try {
            const { newFormErrors, hasError } = validateAllFields();
            setFormErrors(newFormErrors);

            if (hasError) {
                setGeneralError("Please fix the errors in the form before submitting.");
                return;
            }

            const requestData = transformFormDataToRequest(formData);
            const response = await userService.requestAssistance(requestData);
            if (response.status === 200) {
                toast.success("Request submitted successfully!", {
                    duration: 3000,
                    onAutoClose: () => navigate("/user/requests?tab=assistance")
                });
                setFormData(initialFormData);
            } else {
                toast.error("Request failed!");
            }
        } catch (error) {
            setGeneralError("An error occurred while submitting the form. Please try again.");
            toast.error("Failed to submit request");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative p-4 sm:p-6 max-w-4xl mx-auto">
            <Link to="/user/requests?tab=assistance" className='absolute top-5 -left-7'>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="text-[#688D48] h-5 w-5" />
                    </Button>
                </motion.div>
            </Link>
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
                    Request Assistance
                </h1>
                <p className="text-gray-600 mt-2">
                    Fill out the form below to request assistance. We'll process your request as soon as possible.
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <Card className="p-6 space-y-6">
                    {generalError && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{generalError}</AlertDescription>
                        </Alert>
                    )}

                    {/* Assistance Type */}
                    <div className="space-y-2">
                        <Label htmlFor="type" className={formErrors.type ? "text-destructive" : ""}>
                            {formErrors.type || "Type of Assistance"}
                        </Label>
                        <Select
                            onValueChange={(value) => handleInputChange("type", value as 'volunteer' | 'ambulance')}
                            value={formData.type}
                        >
                            <SelectTrigger className={formErrors.type ? "border-destructive" : ""}>
                                <SelectValue placeholder="Select type of assistance" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ambulance">Ambulance Service</SelectItem>
                                <SelectItem value="volunteer">Volunteer Assistance</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Volunteer Type (Conditional) */}
                    {formData.type === "volunteer" && (
                        <div className="space-y-2">
                            <Label htmlFor="volunteerType" className={formErrors.volunteerType ? "text-destructive" : ""}>
                                {formErrors.volunteerType || "Type of Volunteer Assistance"}
                            </Label>
                            <Select
                                onValueChange={(value) => handleInputChange("volunteerType", value as FormData['volunteerType'])}
                                value={formData.volunteerType}
                            >
                                <SelectTrigger className={formErrors.volunteerType ? "border-destructive" : ""}>
                                    <SelectValue placeholder="Select type of assistance needed" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="medical">Medical Assistance</SelectItem>
                                    <SelectItem value="eldercare">Elder Care</SelectItem>
                                    <SelectItem value="maintenance">Home Maintenance</SelectItem>
                                    <SelectItem value="transportation">Transportation</SelectItem>
                                    <SelectItem value="general">General Assistance</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Priority Level */}
                    <div className="space-y-2">
                        <Label htmlFor="priority" className={formErrors.priority ? "text-destructive" : ""}>
                            {formErrors.priority || "Priority Level"}
                        </Label>
                        <Select
                            onValueChange={(value) => handleInputChange("priority", value as 'urgent' | 'normal')}
                            value={formData.priority}
                        >
                            <SelectTrigger className={formErrors.priority ? "border-destructive" : ""}>
                                <SelectValue placeholder="Select priority level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="urgent">Urgent</SelectItem>
                                <SelectItem value="normal">Normal</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date and Time Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className={formErrors.requestedDate ? "text-destructive" : ""}>
                                {formErrors.requestedDate || "Date"}
                            </Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !formData.requestedDate && "text-muted-foreground",
                                            formErrors.requestedDate && "border-destructive"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.requestedDate ? format(formData.requestedDate, "PPP") : "Select date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={formData.requestedDate}
                                        onSelect={(date) => handleInputChange("requestedDate", date)}
                                        disabled={(date) => date < new Date()}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label className={formErrors.requestedTime ? "text-destructive" : ""}>
                                {formErrors.requestedTime || "Time"}
                            </Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !formData.requestedTime && "text-muted-foreground",
                                            formErrors.requestedTime && "border-destructive"
                                        )}
                                    >
                                        <Clock className="mr-2 h-4 w-4" />
                                        {formData.requestedTime || "Select time"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-48">
                                    <div className="max-h-48 overflow-y-auto">
                                        {generateTimeSlots().map((slot) => (
                                            <Button
                                                key={slot}
                                                variant="ghost"
                                                className="w-full justify-start"
                                                onClick={() => handleInputChange("requestedTime", slot)}
                                            >
                                                {slot}
                                            </Button>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {/* Address Selection */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className={formErrors.selectedAddressId ? "text-destructive" : ""}>
                                {formErrors.selectedAddressId || "Delivery Address"}
                            </Label>
                            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add New Address
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px]">
                                    <DialogHeader>
                                        <DialogTitle>Add New Address</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleAddressSubmit} className="space-y-4 mt-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className={addressErrors.fname ? "text-destructive" : ""}>
                                                    {addressErrors.fname || "First Name"}
                                                </Label>
                                                <Input
                                                    placeholder="First name"
                                                    className={addressErrors.fname ? "border-destructive" : ""}
                                                    value={addressData.fname}
                                                    onChange={(e) => handleAddressInputChange("fname", e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label className={addressErrors.lname ? "text-destructive" : ""}>
                                                    {addressErrors.lname || "Last Name"}
                                                </Label>
                                                <Input
                                                    placeholder="Last name"
                                                    className={addressErrors.lname ? "border-destructive" : ""}
                                                    value={addressData.lname}
                                                    onChange={(e) => handleAddressInputChange("lname", e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label className={addressErrors.street ? "text-destructive" : ""}>
                                                {addressErrors.street || "Street Address"}
                                            </Label>
                                            <Input
                                                placeholder="Street address"
                                                className={addressErrors.street ? "border-destructive" : ""}
                                                value={addressData.street}
                                                onChange={(e) => handleAddressInputChange("street", e.target.value)}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className={addressErrors.city ? "text-destructive" : ""}>
                                                    {addressErrors.city || "City"}
                                                </Label>
                                                <Input
                                                    placeholder="City"
                                                    className={addressErrors.city ? "border-destructive" : ""}
                                                    value={addressData.city}
                                                    onChange={(e) => handleAddressInputChange("city", e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label className={addressErrors.state ? "text-destructive" : ""}>
                                                    {addressErrors.state || "State"}
                                                </Label>
                                                <Input
                                                    placeholder="State"
                                                    className={addressErrors.state ? "border-destructive" : ""}
                                                    value={addressData.state}
                                                    onChange={(e) => handleAddressInputChange("state", e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className={addressErrors.country ? "text-destructive" : ""}>
                                                    {addressErrors.country || "Country"}
                                                </Label>
                                                <Input
                                                    placeholder="Country"
                                                    className={addressErrors.country ? "border-destructive" : ""}
                                                    value={addressData.country}
                                                    onChange={(e) => handleAddressInputChange("country", e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label className={addressErrors.pincode ? "text-destructive" : ""}>
                                                    {addressErrors.pincode || "Pincode"}
                                                </Label>
                                                <Input
                                                    placeholder="Pincode"
                                                    type="number"
                                                    className={addressErrors.pincode ? "border-destructive" : ""}
                                                    value={addressData.pincode}
                                                    onChange={(e) => handleAddressInputChange("pincode", e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end space-x-4 mt-6">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setIsModalOpen(false);
                                                    setAddressErrors(initialAddressErrors);
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                className='bg-[#688D48]'
                                                type="submit"
                                                disabled={isAddressSubmitting}
                                            >
                                                {isAddressSubmitting ? "Saving..." : "Save Address"}
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <Select
                            value={formData.selectedAddressId}
                            onValueChange={(value) => handleInputChange("selectedAddressId", value)}
                        >
                            <SelectTrigger className={cn(
                                "w-full",
                                formErrors.selectedAddressId && "border-destructive"
                            )}>
                                <SelectValue placeholder="Select an address" />
                            </SelectTrigger>
                            <SelectContent>
                                {addresses.length > 0 && addresses.map((address) => (
                                    <SelectItem key={address._id?.toString()} value={address._id ? address._id?.toString() : ''}>
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {address.fname} {address.lname}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                {address.street}, {address.city}, {address.state}, {address.country} - {address.pincode}
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className={formErrors.description ? "text-destructive" : ""}>
                            {formErrors.description || "Description"}
                        </Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                            placeholder="Provide additional details about your request"
                            className={formErrors.description ? "border-destructive" : ""}
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full md:w-auto bg-[#688D48]"
                        >
                            {isSubmitting ? "Submitting..." : "Submit Request"}
                        </Button>
                    </div>
                </Card>
            </form>
        </div>
    );
};

export default RequestAssistanceForm;