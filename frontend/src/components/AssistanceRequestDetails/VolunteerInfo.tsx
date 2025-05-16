import { Mail, Phone, UserCheck } from "lucide-react";
import profile_pic from '../../assets/profile_pic.png';

interface IVolunteer {
    _id: string;
    name: string;
    phone: string;
    email: string;
    profilePicture: string;
}

export const VolunteerInfo: React.FC<{ volunteer: IVolunteer }> = ({ volunteer }) => {
    return (
        <div className="border-t pt-4 flex items justify-between">
            <div className="left">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Assigned Volunteer</h3>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">{volunteer.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">{volunteer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">{volunteer.email}</span>
                    </div>
                </div>
            </div>

            <div className="right flex items-start justify-end">
                <img src={volunteer.profilePicture || profile_pic} alt="pic" width="120px" />
            </div>
        </div>
    )
}