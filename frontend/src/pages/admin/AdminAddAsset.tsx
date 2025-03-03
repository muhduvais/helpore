import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FaAngleRight,
  FaBox,
  FaFileAlt,
  FaWarehouse,
  FaImage,
  FaTags
} from "react-icons/fa";
import { validateAddAsset } from "@/utils/validation";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { adminService } from "@/services/adminService";
import { FormField } from "@/components/FormField";
import { AddAssetFormData, AddAssetFormErrors } from "@/interfaces/authInterface";

const AddAsset = () => {
  const navigate = useNavigate();

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

  const [formData, setFormData] = useState<AddAssetFormData>(initialData);
  const [formErrors, setFormErrors] = useState<AddAssetFormErrors>(initialErrorData);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle image change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const previewUrl = URL.createObjectURL(selectedFile);
      setNewImageUrl(previewUrl);
    }
  };

  const handleBlur = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const { errors } = validateAddAsset({ ...formData, [name]: value });
    setFormErrors(prev => ({ ...prev, [name]: errors[name] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    let uploadedImageUrl = null;

    if (file) {
      const formFileData = new FormData();
      formFileData.append('file', file);

      setIsLoading(true);
  
      try {
        const uploadResponse = await adminService.uploadAssetImage(formFileData);
        uploadedImageUrl = uploadResponse.data.imageUrl;
      } catch (error) {
        setErrorMessage('Failed to upload asset image!');
        console.error('File uploading error: ', error);
        return;
      } finally {
        setIsLoading(false);
      }
    }

    const finalFormData = {
      ...formData,
      image: uploadedImageUrl,
      stocks: Number(formData.stocks),
    };

    const { isValid, errors } = validateAddAsset(finalFormData);
    setFormErrors(errors);

    if (!isValid) return;

    setIsLoading(true);

    try {
      const response = await adminService.addAsset(finalFormData);

      if (response.data) {
        toast.success('Asset added successfully!', {
          onClose: () => navigate('/admin/assetManagement')
        });
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.message || 'An error occurred';
        setErrorMessage(errorMessage);
      } else {
        console.error('Asset addition failed:', error);
        setErrorMessage('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {errorMessage && (
        <Alert variant="destructive" className="animate-slideDown">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          to="/admin/assetManagement"
          className="text-gray-500 hover:text-[#688D48] transition-colors flex items-center gap-1"
        >
          <FaBox size={14} />
          Asset Management
        </Link>
        <FaAngleRight className="text-gray-500" />
        <span className="text-[#688D48] font-medium">Add New Asset</span>
      </div>

      {/* Form Card */}
      <Card className="shadow-lg transition-shadow hover:shadow-xl">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - Asset Details */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-[#688D48] border-b pb-2">
                  Asset Details
                </h3>
                <FormField
                  name="name"
                  label="Asset Name"
                  icon={FaBox}
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={formErrors.name}
                  disabled={isLoading}
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FaTags className="text-gray-400" />
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#688D48] focus:border-transparent"
                    disabled={isLoading}
                  >
                    <option value="">Select a category</option>
                    <option value="wheelchair">Wheelchair</option>
                    <option value="airbed">Airbed</option>
                    <option value="walkingStick">Walking Stick</option>
                  </select>
                  {formErrors.category && (
                    <p className="text-sm text-red-500">{formErrors.category}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className={`text-sm font-medium ${formErrors.description ? 'text-red-500' : 'text-gray-700'} flex items-center gap-2`}>
                    <FaFileAlt className="text-gray-400" />
                    {formErrors.description ? formErrors.description : 'Description'}
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#688D48] focus:border-transparent"
                    value={formData.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Right Column - Additional Details */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-[#688D48] border-b pb-2">
                  Additional Details
                </h3>
                <FormField
                  name="stocks"
                  label="Stock Quantity"
                  icon={FaWarehouse}
                  type="number"
                  value={formData.stocks?.toString() ?? ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={formErrors.stocks}
                  disabled={isLoading}
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FaImage className="text-gray-400" />
                    Asset Image
                  </label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#688D48] focus:border-transparent"
                    disabled={isLoading}
                  />
                  {formErrors.image && (
                    <p className="text-sm text-red-500">{formErrors.image}</p>
                  )}
                </div>
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="w-full hover:bg-gray-50 transition-colors"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="w-full bg-[#688D48] hover:bg-[#557239] transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating...' : 'Add Asset'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddAsset;