import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { adminService } from "@/services/adminService";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { FaAngleRight, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLock, FaEye, FaEyeSlash, FaCity, FaMap, FaFlag, FaHome } from "react-icons/fa";
import { validateForm } from "@/utils/validation";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { AxiosError } from "axios";
import { AddUserFormData } from "@/types/adminTypes";
import { FormField } from "@/components/FormField";
import { FormSelect } from "@/components/FormSelect";
import { countries } from 'countries-list';


const AdminAddVolunteer = () => {
  const navigate = useNavigate();
  const initialData = {
    name: '',
    age: '',
    gender: '',
    phone: '',
    email: '',
    password: '',
    fname: '',
    lname: '',
    street: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
  }

  const [formData, setFormData] = useState<AddUserFormData>(initialData);
  const [formErrors, setFormErrors] = useState<AddUserFormData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const validationResult = validateForm(name, value);
    if (validationResult?.error) {
      setFormErrors((prev: any) => ({ ...prev, [name]: validationResult.error }));
    }
  };

  const validateAllFields = () => {
    const newFormErrors = { ...initialData };
    let hasError = false;

    Object.keys(formData).forEach((field: any) => {
      const validationResult = validateForm(field, formData[field as keyof AddUserFormData]);
      if (validationResult?.error) {
        newFormErrors[field as keyof AddUserFormData] = validationResult.error;
        hasError = true;
      }
    });

    return { newFormErrors, hasError };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMessage('');

    const { newFormErrors, hasError } = validateAllFields();
    setFormErrors(newFormErrors);

    if (hasError) return;

    setIsLoading(true);

    try {
      const response = await adminService.addVolunteer(formData);

      if (response.status !== 201) {
        return setErrorMessage(response.data.message);
      }

      if (response.data) {
        toast.success('Successfully added the volunteer!', {
          onClose: () => navigate('/admin/volunteerManagement')
        });
      }

    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.message || 'An error occurred';
        if (error.response?.data?.existingMail) {
          setFormErrors({ ...formErrors, ['email']: 'Email Address' });
        }
        setErrorMessage(errorMessage);
      } else {
        console.error('Registration failed:', error);
        setErrorMessage('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex gap-2 items-center">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <div className="space-y-6">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">

      {errorMessage && (
        <Alert variant="destructive" className="animate-slideDown">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Breadcrumps */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          to="/admin/userManagement"
          className="text-gray-500 hover:text-[#688D48] transition-colors flex items-center gap-1"
        >
          <FaUser size={14} />
          Volunteer Management
        </Link>
        <FaAngleRight className="text-gray-500" />
        <span className="text-[#688D48] font-medium">Add New Volunteer</span>
      </div>

      {/* Form Card */}
      <Card className="shadow-lg transition-shadow hover:shadow-xl h-[80vh] overflow-y-scroll">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - Personal Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-[#688D48] border-b pb-2">
                  Personal Information
                </h3>
                <FormField
                  name="name"
                  label="Name"
                  icon={FaUser}
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={formErrors.name}
                  disabled={isLoading}
                />
                <FormField
                  name="age"
                  label="Age"
                  type="number"
                  icon={FaUser}
                  value={formData.age}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={formErrors.age}
                  disabled={isLoading}
                />
                <FormSelect
                  name="gender"
                  label="Gender"
                  icon={FaUser}
                  value={formData.gender}
                  onChange={(value) => {
                    setFormData((prev) => ({ ...prev, gender: value }));
                    setFormErrors((prev) => ({ ...prev, gender: "" }));
                  }}
                  error={formErrors.gender}
                  disabled={isLoading}
                  options={
                    [
                      { label: 'Male', value: 'Male' },
                      { label: 'Female', value: 'Female' },
                      { label: 'Other', value: 'Other' },
                    ]
                  }
                  placeholder=""
                />
                <FormField
                  name="phone"
                  label="Phone Number"
                  icon={FaPhone}
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={formErrors.phone}
                  disabled={isLoading}
                />
                <FormField
                  name="email"
                  label="Email Address"
                  icon={FaEnvelope}
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={formErrors.email}
                  disabled={isLoading}
                />
                <div className="relative">
                  <FormField
                    name="password"
                    label="Password"
                    icon={FaLock}
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={formErrors.password}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-10 text-gray-400 hover:text-[#688D48] transition-colors"
                  >
                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
                <hr />
              </div>

              {/* Right Column - Address Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-[#688D48] border-b pb-2">
                  Address Information
                </h3>
                <FormField
                  name="fname"
                  label="First Name"
                  icon={FaUser}
                  value={formData.fname}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={formErrors.fname}
                  disabled={isLoading}
                />
                <FormField
                  name="lname"
                  label="Last Name"
                  icon={FaUser}
                  value={formData.lname}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={formErrors.lname}
                  disabled={isLoading}
                />
                <FormField
                  name="street"
                  label="Street Address"
                  icon={FaHome}
                  value={formData.street}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={formErrors.street}
                  disabled={isLoading}
                />
                <FormField
                  name="city"
                  label="City"
                  icon={FaCity}
                  value={formData.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={formErrors.city}
                  disabled={isLoading}
                />
                <FormField
                  name="state"
                  label="State"
                  icon={FaMap}
                  value={formData.state}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={formErrors.state}
                  disabled={isLoading}
                />
                <FormSelect
                  name="country"
                  label="Country"
                  icon={FaFlag}
                  value={formData.country}
                  onChange={(value) => {
                    setFormData((prev) => ({ ...prev, country: value }));
                    setFormErrors((prev) => ({ ...prev, country: "" }));
                  }}
                  error={formErrors.country}
                  disabled={isLoading}
                  options={
                    Object.entries(countries).map(([code, country]) => ({
                      label: country.name,
                      value: country.name,
                    }))
                  }
                  placeholder=""
                />
                <FormField
                  name="pincode"
                  label="Pincode"
                  icon={FaMapMarkerAlt}
                  value={formData.pincode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={formErrors.pincode}
                  disabled={isLoading}
                />
                <hr />
                <div className="flex gap-4 pt-2">
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
                    Add Volunteer
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

export default AdminAddVolunteer;