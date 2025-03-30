import { useState } from "react";
import { MdSettings } from "react-icons/md";

const ProfileSettings = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Delete account
  const handleDeleteAccount = () => {
    console.log("Account deletion confirmed");
    closeModal();
  };

  return (
    <div className="bg-white shadow-lg rounded-lg max-w-6xl w-full overflow-hidden">
      {/* Settings Banner */}
      <div className="bg-gradient-to-r from-[#688D48] to-[#435D2C] p-6 text-white">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Settings</h1>
          <MdSettings className="text-2xl" />
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Delete Account Section */}
        <div className="md:col-span-3 bg-gray-50 p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 text-gray-500">Delete Account</h2>
          <p className="text-gray-700 mb-6">
            Deleting your account is permanent and will remove all your data. This action cannot be undone.
          </p>
          <button
            onClick={openModal}
            className="bg-red-700 text-white px-4 py-2 shadow-md hover:bg-red-800"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Footer Section */}
      <div className="bg-gray-100 p-4 text-center border-t">
        <p className="text-sm text-gray-600">Profile Settings</p>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-gray-700 mb-4">
              Confirm Account Deletion
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your account? This action cannot
              be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-700 text-white hover:bg-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;
