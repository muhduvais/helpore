import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    FaEdit, FaSave, FaTimes, FaImage,
    FaBox, FaTags, FaExclamationCircle
} from 'react-icons/fa';
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { adminService } from '@/services/adminService';
import { IAsset } from '@/interfaces/adminInterface';
import { useToast } from "@/hooks/use-toast";

interface EditAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    asset: IAsset | null;
    onAssetUpdated: (updatedAsset: IAsset) => void;
}

const EditAssetModal: React.FC<EditAssetModalProps> = ({
    isOpen, onClose, asset, onAssetUpdated
}) => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        stocks: 0,
        image: null as File | null
    });
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    useEffect(() => {
        if (asset) {
            setFormData({
                name: asset.name || '',
                description: asset.description || '',
                category: asset.category || '',
                stocks: asset.stocks || 0,
                image: null
            });
            setPreviewImage(asset.image || null);
            setErrors({});
        }
    }, [asset]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'stocks' ? parseInt(value) : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, image: 'Image size should be less than 5MB' }));
                return;
            }
            setFormData(prev => ({ ...prev, image: file }));
            setPreviewImage(URL.createObjectURL(file));
            setErrors(prev => ({ ...prev, image: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.description.trim()) newErrors.description = "Description is required";
        if (!formData.category) newErrors.category = "Category is required";
        if (formData.stocks < 0) newErrors.stocks = "Stock cannot be negative";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        
        setIsSubmitting(true);
        try {
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('description', formData.description);
            submitData.append('category', formData.category);
            submitData.append('stocks', formData.stocks.toString());

            if (formData.image) {
                submitData.append('image', formData.image);
            }

            const response = await adminService.updateAsset(asset?._id || '', submitData);

            if (response.status === 200) {
                toast({
                    title: "Success!",
                    description: "Asset has been successfully updated.",
                    variant: "default"
                });
                onAssetUpdated(response.data);
                onClose();
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update asset. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const categories = ['Wheelchair', 'Airbed', 'Walking Stick'];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FaEdit className="text-[#688D48]" />
                        Edit Asset
                    </DialogTitle>
                    <DialogDescription>
                        Make changes to your asset. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="name" className="text-right pt-2">
                            <FaTags className="inline mr-2" /> Name
                        </Label>
                        <div className="col-span-3">
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                                required
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <FaExclamationCircle size={12} /> {errors.name}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="description" className="text-right pt-2">
                            <FaBox className="inline mr-2" /> Description
                        </Label>
                        <div className="col-span-3">
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className={`${errors.description ? 'border-red-500 focus:ring-red-500' : ''}`}
                                required
                            />
                            {errors.description && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <FaExclamationCircle size={12} /> {errors.description}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="category" className="text-right pt-2">
                            Category
                        </Label>
                        <div className="col-span-3">
                            <Select
                                defaultValue={asset?.category}
                                value={formData.category}
                                onValueChange={(value) => {
                                    setFormData(prev => ({ ...prev, category: value }));
                                    setErrors(prev => ({ ...prev, category: '' }));
                                }}
                            >
                                <SelectTrigger className={`${errors.category ? 'border-red-500' : ''}`}>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(category => (
                                        <SelectItem key={category} value={category}>
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.category && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <FaExclamationCircle size={12} /> {errors.category}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="stocks" className="text-right pt-2">
                            Stocks
                        </Label>
                        <div className="col-span-3">
                            <Input
                                id="stocks"
                                name="stocks"
                                type="number"
                                value={formData.stocks}
                                onChange={handleInputChange}
                                className={`${errors.stocks ? 'border-red-500 focus:ring-red-500' : ''}`}
                                min="0"
                                required
                            />
                            {errors.stocks && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <FaExclamationCircle size={12} /> {errors.stocks}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="image" className="text-right pt-2">
                            <FaImage className="inline mr-2" /> Image
                        </Label>
                        <div className="col-span-3 space-y-4">
                            <div className="flex items-center gap-4">
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className={`flex-grow ${errors.image ? 'border-red-500' : ''}`}
                                />
                                {previewImage && (
                                    <div className="relative">
                                        <img
                                            src={previewImage}
                                            alt="Preview"
                                            className="w-20 h-20 object-cover rounded ring-2 ring-[#688D48]/20"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPreviewImage(null);
                                                setFormData(prev => ({ ...prev, image: null }));
                                            }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 
                                                     hover:bg-red-600 transition-colors"
                                        >
                                            <FaTimes size={12} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            {errors.image && (
                                <p className="text-red-500 text-sm flex items-center gap-1">
                                    <FaExclamationCircle size={12} /> {errors.image}
                                </p>
                            )}
                            <p className="text-sm text-gray-500">
                                Maximum file size: 5MB. Supported formats: JPG, PNG
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="mr-2"
                        >
                            <FaTimes className="mr-2" /> Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-[#688D48] hover:bg-[#557239] text-white"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <FaSave className="mr-2" /> Save Changes
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditAssetModal;