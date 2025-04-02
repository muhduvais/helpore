import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FaAngleRight,
  FaBox,
  FaFileAlt,
  FaWarehouse,
  FaImage,
  FaTags,
  FaCloudUploadAlt,
  FaTrash
} from "react-icons/fa";
import { validateAddAsset } from "@/utils/validation";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { adminService } from "@/services/admin.service";
import { FormField } from "@/components/FormField";
import { AddAssetFormData, AddAssetFormErrors } from "@/interfaces/authInterface";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    const { errors } = validateAddAsset({ ...formData, [name]: value });
    setFormErrors(prev => ({ ...prev, [name]: errors[name] }));
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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
      const previewUrl = URL.createObjectURL(droppedFile);
      setNewImageUrl(previewUrl);
    }
  };

  const handleRemoveImage = () => {
    setFile(null);
    setNewImageUrl('');
  };

  const handleBlur = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

      if (response.status === 201) {
        toast.success("Asset added successfully!", {
          duration: 3000,
          onAutoClose: () => navigate("/admin/assetManagement")
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
        <Alert variant="destructive" className="animate-slideDown shadow-md">
          <AlertDescription className="flex items-center">{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm mb-4">
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
      <Card className="shadow-lg transition-shadow hover:shadow-xl border-t-4 border-t-[#688D48]">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-2xl font-bold text-[#557239] flex items-center gap-2">
            <FaBox className="text-[#688D48]" />
            Add New Asset
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - Asset Details */}
              <div className="space-y-6">
                <div className="bg-[#f8f9fa] p-4 rounded-md border-l-4 border-[#688D48]">
                  <h3 className="text-xl font-semibold text-[#557239] mb-1">
                    Asset Details
                  </h3>
                  <p className="text-sm text-gray-500">Enter the basic information about the asset</p>
                </div>

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
                  <Label className={`text-sm font-medium ${formErrors.category ? 'text-red-500' : 'text-gray-700'} flex items-center gap-2`}>
                    <FaTags className="text-gray-400" />
                    Category
                  </Label>
                  <Select
                    disabled={isLoading}
                    value={formData.category}
                    onValueChange={(value) => handleSelectChange('category', value)}
                  >
                    <SelectTrigger className="w-full focus:ring-2 focus:ring-[#688D48] focus:border-transparent">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wheelchair">Wheelchair</SelectItem>
                      <SelectItem value="airbed">Airbed</SelectItem>
                      <SelectItem value="walkingStick">Walking Stick</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.category && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.category}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className={`text-sm font-medium ${formErrors.description ? 'text-red-500' : 'text-gray-700'} flex items-center gap-2`}>
                    <FaFileAlt className="text-gray-400" />
                    Description
                  </Label>
                  <Textarea
                    name="description"
                    rows={5}
                    className="w-full resize-none focus:ring-2 focus:ring-[#688D48] focus:border-transparent"
                    value={formData.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isLoading}
                    placeholder="Describe the asset's features and condition"
                  />
                  {formErrors.description && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.description}</p>
                  )}
                </div>
              </div>

              {/* Right Column - Additional Details */}
              <div className="space-y-6">
                <div className="bg-[#f8f9fa] p-4 rounded-md border-l-4 border-[#688D48]">
                  <h3 className="text-xl font-semibold text-[#557239] mb-1">
                    Additional Details
                  </h3>
                  <p className="text-sm text-gray-500">Add inventory and visual information</p>
                </div>

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
                  <Label className={`text-sm font-medium ${formErrors.image ? 'text-red-500' : 'text-gray-700'} flex items-center gap-2`}>
                    <FaImage className="text-gray-400" />
                    Asset Image
                  </Label>

                  <div
                    className={`border-2 border-dashed rounded-lg p-4 transition-colors ${isDragging ? 'border-[#688D48] bg-[#f0f4ed]' : 'border-gray-300'
                      } ${newImageUrl ? 'bg-gray-50' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {!newImageUrl ? (
                      <div className="text-center py-8">
                        <FaCloudUploadAlt className="mx-auto text-4xl text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 mb-2">Drag and drop an image here or</p>
                        <Button
                          type="button"
                          variant="outline"
                          className="bg-white hover:bg-gray-50"
                          onClick={() => document.getElementById('fileInput')?.click()}
                          disabled={isLoading}
                        >
                          Select File
                        </Button>
                        <input
                          id="fileInput"
                          type="file"
                          name="image"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          disabled={isLoading}
                        />
                        <p className="text-xs text-gray-400 mt-2">Supported formats: JPG, PNG, GIF</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="relative rounded-md overflow-hidden border shadow-sm">
                          <img
                            src={newImageUrl}
                            alt="Asset preview"
                            className="w-full h-48 object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 rounded-full w-8 h-8 p-0 flex items-center justify-center"
                            onClick={handleRemoveImage}
                            disabled={isLoading}
                          >
                            <FaTrash size={14} />
                          </Button>
                        </div>
                        <p className="text-sm text-center text-gray-500">
                          {file?.name} • {(file?.size ? (file.size / (1024 * 1024)).toFixed(2) : 0)} MB
                        </p>
                      </div>
                    )}
                  </div>

                  {formErrors.image && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.image}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="border-t pt-6 mt-6 flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="min-w-32 hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="min-w-32 bg-[#688D48] hover:bg-[#557239] transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  'Add Asset'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddAsset;