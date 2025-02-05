import { useState } from "react";
import { LineChart, Users, Handshake, Package } from "lucide-react";

const AdminDashboard = () => {
    const [stats] = useState([
        { title: "Total Users", value: 1284, icon: <Users size={32} /> },
        { title: "Active Volunteers", value: 342, icon: <Handshake size={32} /> },
        { title: "Donations Received", value: "$24,500", icon: <LineChart size={32} /> },
        { title: "Assets in Use", value: 78, icon: <Package size={32} /> }
    ]);

    const [recentActivities] = useState([
        "John Doe registered as a volunteer.",
        "Donation of 10 wheelchairs received.",
        "New blog post published: 'Helping Hands'.",
        "Sarah Smith requested a walker.",
    ]);

    return (
        <div className="p-6 w-full">
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white p-6 rounded-xl shadow-lg flex items-center gap-x-6 transition-all transform hover:scale-105 hover:shadow-xl hover:bg-gray-50"
                    >
                        <div className="text-green-600 bg-green-100 p-4 rounded-full">
                            {stat.icon}
                        </div>
                        <div>
                            <h4 className="text-gray-600 text-sm">{stat.title}</h4>
                            <p className="text-xl font-semibold text-gray-800">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activities */}
            <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-2xl font-semibold mb-5 text-gray-800">Recent Activities</h3>
                <ul className="space-y-4 text-gray-700 text-sm">
                    {recentActivities.map((activity, index) => (
                        <li
                            key={index}
                            className="border-l-4 border-green-600 pl-4 transition-all hover:bg-green-50 cursor-pointer"
                        >
                            {activity}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AdminDashboard;
