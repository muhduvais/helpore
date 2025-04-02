import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/FormField';
import { FaUser, FaPhone, FaHome, FaCity, FaMap, FaFlag, FaMapMarkerAlt } from 'react-icons/fa';
import { userService } from '@/services/user.service';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { IUser } from '@/interfaces/userInterface';

interface IAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

// interface IUser {
//   name: string;
//   age: number;
//   gender: string;
//   phone: number;
//   email: string;
//   profilePicture?: string;
//   createdAt?: string;
// }

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUser | null;
  address: IAddress | null;
  onUpdate: () => void;
}

interface FormData extends Omit<IUser, 'profilePicture' | 'email' | 'createdAt' | 'password' | 'isActive' | 'isBlocked' | 'isVerified' | 'role' | 'googleId' | 'resetToken' | 'resetTokenExpiry'>, IAddress {}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  address, 
  onUpdate 
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: user?.name || '',
    age: user?.age || 0,
    gender: user?.gender || '',
    phone: user?.phone || 0,
    street: address?.street || '',
    city: address?.city || '',
    state: address?.state || '',
    country: address?.country || '',
    pincode: address?.pincode || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await userService.updateUser(formData);
      if (response.status === 200) {
        toast.success('Profile updated successfully!');
        onUpdate();
        onClose();
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        setError(error.response?.data?.message || 'Failed to update profile');
        toast.error(error.response?.data?.message || 'Failed to update profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#688D48]">Edit Profile</DialogTitle>
        </DialogHeader>
        
        {error && (
          <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#688D48] border-b pb-2">
                Personal Information
              </h3>
              <FormField
                name="name"
                label="Name"
                icon={FaUser}
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
              />
              <FormField
                name="age"
                label="Age"
                icon={FaUser}
                type="number"
                value={formData.age.toString()}
                onChange={handleChange}
                disabled={isLoading}
              />
              <FormField
                name="gender"
                label="Gender"
                icon={FaUser}
                value={formData.gender}
                onChange={handleChange}
                disabled={isLoading}
              />
              <FormField
                name="phone"
                label="Phone"
                icon={FaPhone}
                value={String(formData.phone)}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#688D48] border-b pb-2">
                Address Information
              </h3>
              <FormField
                name="street"
                label="Street"
                icon={FaHome}
                value={formData.street}
                onChange={handleChange}
                disabled={isLoading}
              />
              <FormField
                name="city"
                label="City"
                icon={FaCity}
                value={formData.city}
                onChange={handleChange}
                disabled={isLoading}
              />
              <FormField
                name="state"
                label="State"
                icon={FaMap}
                value={formData.state}
                onChange={handleChange}
                disabled={isLoading}
              />
              <FormField
                name="country"
                label="Country"
                icon={FaFlag}
                value={formData.country}
                onChange={handleChange}
                disabled={isLoading}
              />
              <FormField
                name="pincode"
                label="Pincode"
                icon={FaMapMarkerAlt}
                value={formData.pincode}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#688D48] hover:bg-[#557239]"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Profile'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;