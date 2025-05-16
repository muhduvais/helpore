import { useEffect, useState } from "react";
import profile_pic from "../../assets/profile_pic.png";
import { validateChangePassword } from "../../utils/validation";
import { userService } from '../../services/user.service'
import { toast } from 'sonner';
import { AxiosError } from "axios";
import { IUser } from "../../interfaces/userInterface";

const ProfileChangePassword = () => {

  const initialFormState = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  }

  const [user, setUser] = useState<IUser | null>(null);
  const [formData, setFormData] = useState(initialFormState)
  const [formErrors, setFormErrors] = useState(initialFormState)
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchUserDetails = async () => {
    try {
      const response = await userService.fetchUserDetails();
      
      if (response.status === 200) {
        const userDetails = response.data;
        setUser(userDetails.user);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log('Error fetching user details:', error.response?.data?.message || error.message);
      }
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const { isValid, errors } = validateChangePassword(formData);
    setFormErrors(errors);

    if (isValid) {
      setIsLoading(true);
      try {
        const response = await userService.changePassword(formData);
        if (response?.status === 200) {
          toast.success('Password reset successfully!');
          clearFields();
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 400) {
            setMessage(error.response?.data?.message || 'Invalid current password!');
          }
        } else {
          setMessage('An unexpected error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    }
  }

  const clearFields = () => {
    setFormData(initialFormState);
    setFormErrors(initialFormState);
  }

  return (
    <div className="bg-white shadow-lg rounded-lg max-w-6xl w-full overflow-hidden">
      {/* Profile Banner */}
      <div className="bg-gradient-to-r from-[#688D48] to-[#435D2C] p-6 text-white">
        <div className="relative flex items-center space-x-6">
          {user?.profilePicture ? <img
            src={user.profilePicture}
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
          /> :
            <img
              src={profile_pic}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
            />}
          <div>
            <h1 className="text-3xl font-bold">{user?.name}</h1>
            <p className="text-lg opacity-80">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Change Password</h2>
        {message && (
          <div
            className={`p-3 mb-4 rounded bg-red-100 text-red-700`}
          >
            {message}
          </div>
        )}
        <form
          className="space-y-6"
          onSubmit={handleChangePassword}
        >
          <fieldset disabled={isLoading}>
            <div>
              <label htmlFor="currentPassword" className="block text-sm text-gray-500">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                className="w-full mt-1 px-4 py-2 border text-gray-700"
              />
              {formErrors.currentPassword && (
                <p className="text-sm text-red-500">{formErrors.currentPassword}</p>
              )}
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm text-gray-500">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="w-full mt-1 px-4 py-2 border text-gray-700 focus:ring"
              />
              {formErrors.newPassword && (
                <p className="text-sm text-red-500">{formErrors.newPassword}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm text-gray-500">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full mt-1 px-4 py-2 border text-gray-700 focus:ring"
              />{formErrors.confirmPassword && (
                <p className="text-sm text-red-500">{formErrors.confirmPassword}</p>
              )}
            </div>

          </fieldset>

          <div className="flex items-center space-x-4">
            <button
              type="submit"
              className="px-6 py-2 bg-[#688D48] text-white font-semibold hover:bg-[#435D2C] transition"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update Password"}
            </button>
            <button
              type="button"
              className="px-6 py-2 bg-gray-200 text-gray-600 font-semibold hover:bg-gray-300 transition"
              onClick={clearFields}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileChangePassword;
