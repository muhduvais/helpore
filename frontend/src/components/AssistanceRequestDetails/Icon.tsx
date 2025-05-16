import {
    ArrowLeft,
    Share2,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Calendar,
    MapPin,
    Mail,
    Phone,
    AlertTriangle,
    UserCheck,
    History as HistoryIcon,
    FileText,
    Ambulance,
    HeartHandshake,
    Send,
    MessageSquare
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import React from 'react';
import { IAssistanceRequest } from '@/interfaces/adminInterface';
import { format } from 'date-fns';

export const RequestTypeIcon: React.FC<{ type: 'volunteer' | 'ambulance' }> = ({ type }) => {
    return type === 'ambulance'
        ? <Ambulance className="h-5 w-5 text-red-500" />
        : <HeartHandshake className="h-5 w-5 text-green-500" />;
}

export const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
    return (
        <Badge variant="outline" className={
            priority === 'urgent'
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
        }>
            {priority.toUpperCase()}
        </Badge>
    );
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'approved':
            return <CheckCircle2 className="h-4 w-4" />;
        case 'rejected':
            return <XCircle className="h-4 w-4" />;
        default:
            return <Clock className="h-4 w-4" />;
    }
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'approved':
            return 'bg-green-100 text-green-800';
        case 'rejected':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-yellow-100 text-yellow-800';
    }
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    return <Badge className={getStatusColor(status || 'pending')}>
        <span className="flex items-center gap-1">
            {getStatusIcon(status || 'pending')}
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    </Badge>
};

export const RequestTimingInfo: React.FC<{ request: IAssistanceRequest }> = ({ request }) => {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(request?.requestedDate || ''), 'PPP')}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{request?.requestedTime}</span>
            </div>
        </div>
    )
}