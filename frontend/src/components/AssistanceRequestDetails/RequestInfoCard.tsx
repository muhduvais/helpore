import { Card } from "@/components/ui/card";
import { IAssistanceRequest } from '@/interfaces/adminInterface';
import { PriorityBadge, RequestTimingInfo, RequestTypeIcon, StatusBadge } from './Icon';
import { VolunteerInfo } from './VolunteerInfo';

interface RequestInfoCardProps {
    request: IAssistanceRequest | null;
}

export const RequestInfoCard: React.FC<RequestInfoCardProps> = ({ request }) => {
    if (!request) return null;

    return (
        <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        <RequestTypeIcon type={request.type} />
                        <h2 className="font-semibold text-xl text-gray-800">
                            {request.type.charAt(0).toUpperCase() + request.type.slice(1)} Request
                        </h2>
                    </div>
                    <PriorityBadge priority={request.priority} />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Status</span>
                        <StatusBadge status={request.status} />
                    </div>

                    <RequestTimingInfo request={request} />
                </div>

                {request.volunteer && <VolunteerInfo volunteer={request.volunteer} />}
            </div>
        </Card>
    );
};