import { useState, useEffect } from 'react';
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
import { adminService } from '@/services/admin.service';
import { IAsset } from '@/interfaces/adminInterface';
import { validateAddAsset } from '@/utils/validation';
import { AddAssetFormData, AddAssetFormErrors } from '@/interfaces/authInterface';

import { toast } from "sonner";
import axios from 'axios';

export interface UploadAssetImageResponse {
    imageUrl: string;
}

interface EditAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    asset: IAsset | null;
    onAssetUpdated: (updatedAsset: IAsset) => void;
}

const initialData = {
    name: '',
    category: '',
    description: '',
    stocks: 0,
    image: null as File | null,
};

const initialErrorData = {
    name: '',
    category: '',
    description: '',
    stocks: '',
    image: '',
};

const EditAssetModal: React.FC<EditAssetModalProps> = ({
    isOpen, onClose, asset, onAssetUpdated
}) => {

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [file, setFile] = useState<File | string | null>(null);
    const [isFileChanged, setIsFileChanged] = useState<boolean>(false);

    const [formData, setFormData] = useState<AddAssetFormData>(initialData);
    const [formErrors, setFormErrors] = useState<AddAssetFormErrors>(initialErrorData);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (asset) {
            setFormData({
                name: asset.name || '',
                description: asset.description || '',
                category: asset.category || '',
                stocks: asset.stocks || 0,
                image: null
            });
            setFile(asset.image);
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

        setIsFileChanged(true);

        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, image: 'Image size should be less than 5MB' }));
                return;
            }
            setFormData(prev => ({ ...prev, image: file }));
            setFile(file);
            setPreviewImage(URL.createObjectURL(file));
            setErrors(prev => ({ ...prev, image: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        let uploadedImageUrl = null;

        if (file && isFileChanged) {
            const formFileData = new FormData();
            formFileData.append('file', file);

            setIsImageLoading(true);

            try {
                const uploadResponse = await adminService.uploadAssetImage(formFileData);
                uploadedImageUrl = uploadResponse.data.imageUrl;
            } catch (error: unknown) {
                if (axios.isAxiosError(error)) {
                    setErrorMessage(error.response?.data?.message || 'Failed to upload asset image!');
                    console.error('File uploading error: ', error);
                } else if (error instanceof Error) {
                    setErrorMessage('An unexpected error occurred during file upload');
                    console.error('Unexpected error: ', error);
                } else {
                    setErrorMessage('An unknown error occurred during file upload');
                    console.error('Unknown error: ', error);
                }
                return;
            } finally {
                setIsImageLoading(false);
            }
        }

        const finalFormData = {
            ...formData,
            image: uploadedImageUrl || file,
            stocks: Number(formData.stocks) ? Number(formData.stocks) : 0,
        };

        const { isValid, errors } = validateAddAsset(finalFormData as AddAssetFormData);
        setFormErrors(errors);

        if (!isValid) return;

        setIsSubmitting(true);

        try {
            const response = await adminService.updateAsset(asset?.id as string, finalFormData);

            if (response.data) {
                console.log('response', response)
                toast.success('Asset updated successfully!');
                onAssetUpdated(response.data.asset);
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || 'An error occurred';
                setErrorMessage(errorMessage);
            } else {
                console.error('Asset updation failed:', error);
                setErrorMessage('An unexpected error occurred');
            }
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

                {errorMessage && <p className='text-sm text-red-500'>{errorMessage}</p>}

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
                                className={`${formErrors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                            />
                            {formErrors.name && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <FaExclamationCircle size={12} /> {formErrors.name}
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
                                className={`${formErrors.description ? 'border-red-500 focus:ring-red-500' : ''}`}
                            />
                            {formErrors.description && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <FaExclamationCircle size={12} /> {formErrors.description}
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
                                value={formData.category}
                                onValueChange={(value) => {
                                    setFormData(prev => ({ ...prev, category: value }));
                                    setErrors(prev => ({ ...prev, category: '' }));
                                }}
                            >
                                <SelectTrigger className={`${formErrors.category ? 'border-red-500' : ''}`}>
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
                            {formErrors.category && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <FaExclamationCircle size={12} /> {formErrors.category}
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
                                value={Number(formData.stocks)}
                                onChange={handleInputChange}
                                className={`${formErrors.stocks ? 'border-red-500 focus:ring-red-500' : ''}`}
                                min="0"
                            />
                            {formErrors.stocks && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <FaExclamationCircle size={12} /> {formErrors.stocks}
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
                                    className={`flex-grow ${formErrors.image ? 'border-red-500' : ''}`}
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
                                            }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 
                                                     hover:bg-red-600 transition-colors"
                                        >
                                            <FaTimes size={12} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            {formErrors.image && (
                                <p className="text-red-500 text-sm flex items-center gap-1">
                                    <FaExclamationCircle size={12} /> {formErrors.image}
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
                                    <FaSave className="mr-2" /> {isImageLoading ? 'Saving...' : 'Save Changes'}
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