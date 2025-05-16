import { IAssistanceRequest } from "@/interfaces/adminInterface"
import { Card } from "../ui/card"
import { AlertCircle, MapPin } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { format } from "date-fns"

export const RequestDetails: React.FC<{ request: IAssistanceRequest | null }> = ({ request }) => {
    return (
        <Card>
            <div className="p-6 space-y-6">
                {/* Description Section */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                    <p className="text-gray-600">{request?.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Request Details */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Request Details</h3>
                        <div className="space-y-2">
                            <p className="text-sm">
                                <span className="text-gray-500">Type:</span>{' '}
                                <span className="text-gray-700">{request?.type}</span>
                            </p>
                            {request?.volunteerType && (
                                <p className="text-sm">
                                    <span className="text-gray-500">Volunteer Type:</span>{' '}
                                    <span className="text-gray-700">{request.volunteerType}</span>
                                </p>
                            )}
                            <p className="text-sm">
                                <span className="text-gray-500">Priority:</span>{' '}
                                <span className="text-gray-700">{request?.priority}</span>
                            </p>
                            <p className="text-sm">
                                <span className="text-gray-500">Created:</span>{' '}
                                <span className="text-gray-700">
                                    {format(new Date(request?.createdAt || ''), 'PPP')}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Location Details */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Location</h3>
                        <div className="space-y-2">
                            <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                                <div>
                                    <p className="text-gray-700">{request?.address.street}</p>
                                    <p className="text-gray-600">
                                        {request?.address.city}, {request?.address.state} {request?.address.zipCode}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Alert */}
                {request?.status === 'pending' && (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Request Pending</AlertTitle>
                        <AlertDescription>
                            Your request is being reviewed. We'll notify you once it's approved.
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        </Card>
    )
}