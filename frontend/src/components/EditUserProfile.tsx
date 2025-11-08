import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/FormField";
import {
  FaUser,
  FaPhone,
  FaHome,
  FaCity,
  FaMap,
  FaFlag,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { userService } from "@/services/user.service";
import { toast } from "sonner";
import axios from "axios";
import { IUser } from "@/interfaces/userInterface";
import { validateForm } from "@/utils/validation";

interface FormData {
  name: string;
  age: string;
  gender: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

const initialErrors: Record<keyof FormData, string> = {
  name: "",
  age: "",
  gender: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  country: "",
  pincode: "",
};

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUser | null;
  address: any | null;
  onUpdate: (userData: any, addressData: any) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  address,
  onUpdate,
}) => {
  const initialData: FormData = {
    name: user?.name || "",
    age: user?.age ? String(user?.age) : "",
    gender: user?.gender || "",
    phone: user?.phone ? String(user?.phone) : "",
    street: address?.street || "",
    city: address?.city || "",
    state: address?.state || "",
    country: address?.country || "",
    pincode: address?.pincode ? String(address?.pincode) : "",
  };

  const [formData, setFormData] = useState<FormData>(initialData);
  const [formErrors, setFormErrors] = useState(initialErrors);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const validationResult = validateForm(name, value);

    if (validationResult?.error) {
      setFormErrors((prev) => ({ ...prev, [name]: validationResult.error }));
    }
  };

  const validateAllFields = () => {
    const newFormErrors = { ...initialErrors };
    let hasError = false;

    for (const key in formData) {
      const validationResult = validateForm(key, (formData as any)[key]);
      if (validationResult?.error) {
        newFormErrors[key as keyof FormData] = validationResult.error;
        hasError = true;
      }
    }

    setFormErrors(newFormErrors);
    return hasError;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateAllFields()) return;

    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        age: Number(formData.age),
        phone: Number(formData.phone),
      };

      const response = await userService.updateUser(payload);

      if (response.status === 200) {
        toast.success("Profile updated successfully!");

        onUpdate(
          {
            name: payload.name,
            age: payload.age,
            gender: payload.gender,
            phone: payload.phone,
          },
          {
            street: payload.street,
            city: payload.city,
            state: payload.state,
            country: payload.country,
            pincode: payload.pincode,
          }
        );

        onClose();
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to update profile");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialData);
    setFormErrors(initialErrors);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#688D48]">
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">

            {/* Personal Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#688D48] border-b pb-2">
                Personal Information
              </h3>
              <FormField name="name" label="Name" icon={FaUser}
                value={formData.name} onChange={handleChange} onBlur={handleBlur}
                error={formErrors.name} disabled={isLoading}
              />
              <FormField name="age" label="Age" type="number" icon={FaUser}
                value={formData.age} onChange={handleChange} onBlur={handleBlur}
                error={formErrors.age} disabled={isLoading}
              />
              <FormField name="gender" label="Gender" icon={FaUser}
                value={formData.gender} onChange={handleChange} onBlur={handleBlur}
                error={formErrors.gender} disabled={isLoading}
              />
              <FormField name="phone" label="Phone Number" icon={FaPhone}
                value={formData.phone} onChange={handleChange} onBlur={handleBlur}
                error={formErrors.phone} disabled={isLoading}
              />
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#688D48] border-b pb-2">
                Address Information
              </h3>
              <FormField name="street" label="Street" icon={FaHome}
                value={formData.street} onChange={handleChange} onBlur={handleBlur}
                error={formErrors.street} disabled={isLoading}
              />
              <FormField name="city" label="City" icon={FaCity}
                value={formData.city} onChange={handleChange} onBlur={handleBlur}
                error={formErrors.city} disabled={isLoading}
              />
              <FormField name="state" label="State" icon={FaMap}
                value={formData.state} onChange={handleChange} onBlur={handleBlur}
                error={formErrors.state} disabled={isLoading}
              />
              <FormField name="country" label="Country" icon={FaFlag}
                value={formData.country} onChange={handleChange} onBlur={handleBlur}
                error={formErrors.country} disabled={isLoading}
              />
              <FormField name="pincode" label="Pincode" icon={FaMapMarkerAlt}
                value={formData.pincode} onChange={handleChange} onBlur={handleBlur}
                error={formErrors.pincode} disabled={isLoading}
              />
            </div>

          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#688D48] hover:bg-[#557239]" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Profile"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
