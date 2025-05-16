import { IAssistanceRequest } from "@/interfaces/adminInterface"
import { Card } from "../ui/card"
import { format } from "date-fns"

export const RequestHistory: React.FC<{ history: IAssistanceRequest[] | null }> = ({ history }) => {
    return (
        <Card>
            <div className="p-6">
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800">Request Timeline</h3>
                    <div className="space-y-4">
                        {history && history.map((entry: any, index: number) => (
                            <div
                                key={index}
                                className="flex items-start gap-4 pb-4 border-l-2 border-gray-200 pl-4 relative"
                            >
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-[#688D48]" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium text-gray-800">
                                        {entry.action}
                                    </p>
                                    <p className="text-sm text-gray-600">{entry.details}</p>
                                    <p className="text-xs text-gray-400">
                                        {format(new Date(entry.date), 'PPP p')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    )
}