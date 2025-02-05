import React, { useEffect, useState } from 'react';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { userService } from '../../services/userService';

const RequestsListing: React.FC = () => {
  const [requests, setRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const limit = 5;

  const fetchRequests = async (page: number, searchTerm: string) => {
    setLoading(true);
    try {
      const response = await userService.fetchAssetRequests(page, limit, searchTerm.trim());

      if (response.data.success) {
        setRequests(response.data.assetRequests);
        setTotalPages(response.data.totalPages);
      } else {
        setRequests([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching asset requests:', error);
      setRequests([]);
      setTotalPages(1);
    }
    setLoading(false);
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setSearch(searchValue);
    setCurrentPage(1);
    fetchRequests(1, searchValue);
  };

  useEffect(() => {
    fetchRequests(currentPage, search);
  }, [currentPage, search]);

  return (
    <div className="p-6 ml-64">
      {/* Page Header */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Your Requests</h1>
        <p className="text-gray-600">
          Here’s a list of all your submitted requests and their statuses.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Search requests..."
          className="w-full p-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring focus:ring-green-500"
        />
      </div>

      {/* Requests Table */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Requests List</h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : requests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-4 py-2 border font-semibold text-gray-600">Asset</th>
                  <th className="px-4 py-2 border font-semibold text-gray-600">Requested Date</th>
                  <th className="px-4 py-2 border font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request: any) => (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{request.asset?.name || 'N/A'}</td>
                    <td className="px-4 py-2 border">
                      {new Date(request.requestedDate).toLocaleDateString()}
                    </td>
                    <td
                      className={`px-4 py-2 border font-medium ${request.status === 'pending'
                          ? 'text-yellow-500'
                          : request.status === 'approved'
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}
                    >
                      {request.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No requests found.</p>
        )}
      </div>

      {/* Pagination */}
      <div className="pagination py-5 flex items-center justify-center">
        {currentPage !== 1 &&
          <button onClick={() => setCurrentPage(currentPage - 1)}
            className='text-black font-bold text-sm px-2 flex items-center justify-center'
          ><FaAngleLeft className='text-[#5F5F5F]' /><span>PREV</span></button>}
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            className={`text-white px-2 m-1 ${currentPage === index + 1 ? 'active bg-[#435D2C]' : 'bg-[#688D48]'}`}
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}
        {currentPage !== totalPages &&
          <button onClick={() => setCurrentPage(currentPage + 1)}
            className='text-black font-bold text-sm px-2 flex items-center justify-center'
          ><span>NEXT</span><FaAngleRight className='text-[#5F5F5F]' /></button>}
      </div>
    </div>
  );
};

export default RequestsListing;
